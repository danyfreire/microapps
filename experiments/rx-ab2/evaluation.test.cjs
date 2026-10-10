'use strict';
const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');
const implementation = process.env.RX_IMPL || process.argv[2];
if (!implementation) throw new Error('Set RX_IMPL to absolute candidate rx-lifecycle.cjs');
const { createPersonalRecord:create, applyRxAction:apply, summarizeUser:summary } = require(path.resolve(implementation));
const T='2026-10-10';
const base=(id='r1',who='ana',quantity=50,date=T,today=T)=>create({id,userId:who,quantity,activityDate:date},today);
const ctx=(who,today=T)=>({actorId:who,today});
const req=(who='bob')=>({type:'REQUEST',witnessId:who});
const code=(f,c)=>assert.throws(f,e=>e && e.code===c,'Expected error.code '+c);
const approved=(record=base())=>apply(apply(record,req(),ctx('ana')), {type:'APPROVE'}, ctx('bob'));

test('01 create today as Personal with prescribed shape',()=>{
 assert.deepEqual(base(),{id:'r1',userId:'ana',quantity:50,activityDate:T,createdDate:T,status:'PERSONAL',validatorId:null,validatedBy:null});
});
test('02 yesterday crossing new year accepted',()=>{
 assert.equal(base('r','ana',9,'2026-12-31','2027-01-01').status,'PERSONAL');
});
test('03 older than yesterday rejected',()=>code(()=>base('r','ana',10,'2026-10-08'), 'INVALID_ACTIVITY_DATE'));
test('04 future activity date rejected',()=>code(()=>base('r','ana',10,'2026-10-11'), 'INVALID_ACTIVITY_DATE'));
test('05 zero quantity rejected',()=>code(()=>base('r','ana',0), 'INVALID_QUANTITY'));
test('06 noninteger quantity rejected',()=>code(()=>base('r','ana',1.5),'INVALID_QUANTITY'));
test('07 no arbitrary daily limit (5000 accepted)',()=>assert.equal(base('r','ana',5000).quantity,5000));
test('08 request on creation day accepted',()=>assert.equal(apply(base(),req(),ctx('ana')).status,'VERIFICATION_PENDING'));
test('09 request on day 7 inclusive accepted',()=>{
 const r=base('r','ana',20,'2026-10-01','2026-10-01');
 assert.equal(apply(r,req(),ctx('ana','2026-10-08')).validatorId,'bob');
});
test('10 request on day 8 rejected',()=>{
 const r=base('r','ana',20,'2026-10-01','2026-10-01');
 code(()=>apply(r,req(),ctx('ana','2026-10-09')),'WINDOW_EXPIRED');
});
test('11 request before createdDate rejected',()=>code(()=>apply(base(),req(),ctx('ana','2026-10-09')),'WINDOW_EXPIRED'));
test('12 owner alone requests verification',()=>code(()=>apply(base(),req(),ctx('bob')),'FORBIDDEN'));
test('13 user cannot request self-verification',()=>code(()=>apply(base(),req('ana'),ctx('ana')),'SELF_VERIFICATION'));
test('14 missing witness rejected',()=>code(()=>apply(base(),req(''),ctx('ana')),'INVALID_WITNESS'));
test('15 a pending record cannot have two active validators',()=>{
 const r=apply(base(),req('bob'),ctx('ana'));
 code(()=>apply(r,req('zoe'),ctx('ana')),'INVALID_STATE');
});
test('16 only selected witness may approve',()=>{
 const r=apply(base(),req('bob'),ctx('ana'));
 code(()=>apply(r,{type:'APPROVE'},ctx('zoe')),'FORBIDDEN');
});
test('17 approval changes state and stores verifier',()=>{
 const r=approved();assert.equal(r.status,'RX_VERIFIED');assert.equal(r.validatedBy,'bob');
});
test('18 response allowed after 7 days (benchmark-only convention)',()=>{
 const original=base('r','ana',20,'2026-10-01','2026-10-01');
 const requested=apply(original,req(),ctx('ana','2026-10-02'));
 assert.equal(apply(requested,{type:'APPROVE'},ctx('bob','2026-11-01')).status,'RX_VERIFIED');
});
test('19 rejection by witness transitions to REJECTED',()=>{
 const r=apply(base(),req(),ctx('ana'));
 assert.equal(apply(r,{type:'REJECT'},ctx('bob')).status,'REJECTED');
});
test('20 rejection by a different witness forbidden',()=>{
 const r=apply(base(),req(),ctx('ana'));
 code(()=>apply(r,{type:'REJECT'},ctx('eve')),'FORBIDDEN');
});
test('21 owner may cancel and request a replacement witness',()=>{
 const pending=apply(base(),req('bob'),ctx('ana'));
 const canceled=apply(pending,{type:'CANCEL'},ctx('ana'));
 assert.equal(canceled.status,'PERSONAL');assert.equal(canceled.validatorId,null);
 const replaced=apply(canceled,req('zoe'),ctx('ana'));
 assert.equal(replaced.validatorId,'zoe');assert.equal(replaced.status,'VERIFICATION_PENDING');
});
test('22 nonowner cannot cancel',()=>{
 const r=apply(base(),req(),ctx('ana'));
 code(()=>apply(r,{type:'CANCEL'},ctx('bob')),'FORBIDDEN');
});
test('23 cannot approve twice',()=>code(()=>apply(approved(),{type:'APPROVE'},ctx('bob')),'INVALID_STATE'));
test('24 owner voids verified Rx',()=>assert.equal(apply(approved(),{type:'VOID'},ctx('ana')).status,'VOIDED'));
test('25 nonowner cannot void record',()=>code(()=>apply(base(),{type:'VOID'},ctx('bob')),'FORBIDDEN'));
test('26 voided records stay voided / no further actions',()=>{
 const r=apply(base(),{type:'VOID'},ctx('ana'));
 code(()=>apply(r,req('bob'),ctx('ana')),'INVALID_STATE');
 code(()=>apply(r,{type:'VOID'},ctx('ana')),'INVALID_STATE');
});
test('27 rejected remains total but not Rx',()=>{
 const rejected=apply(apply(base(),req(),ctx('ana')),{type:'REJECT'},ctx('bob'));
 assert.deepEqual(summary([rejected],'ana'),{total:50,rx:0,rxIndex:0});
});
test('28 mixed statuses produce correct total, Rx, and index',()=>{
 const a=approved(base('one','ana',25));
 const b=base('two','ana',25);
 const c=apply(base('three','ana',50),{type:'VOID'},ctx('ana'));
 assert.deepEqual(summary([a,b,c],'ana'),{total:50,rx:25,rxIndex:50});
});
test('29 voiding an Rx recalculates totals',()=>{
 const rx=approved(base('one','ana',30));
 const other=base('two','ana',20);
 assert.deepEqual(summary([rx,other],'ana'),{total:50,rx:30,rxIndex:60});
 assert.deepEqual(summary([apply(rx,{type:'VOID'},ctx('ana')),other],'ana'),{total:20,rx:0,rxIndex:0});
});
test('30 repeated IDs counted once, records of another user ignored',()=>{
 const rx=approved(base('x','ana',20));
 const another=base('y','bob',90);
 assert.deepEqual(summary([rx,rx,another],'ana'),{total:20,rx:20,rxIndex:100});
});
test('31 empty Total has 0 percent',()=>assert.deepEqual(summary([],'ana'),{total:0,rx:0,rxIndex:0}));
test('32 no mutation, including frozen records, actions and context',()=>{
 const input=Object.freeze({id:'r',userId:'ana',quantity:50,activityDate:T});
 const record=Object.freeze(create(input,T));
 const action=Object.freeze(req('bob'));
 const context=Object.freeze(ctx('ana'));
 const output=apply(record,action,context);
 assert.equal(record.status,'PERSONAL');assert.equal(output.status,'VERIFICATION_PENDING');
 assert.notStrictEqual(output,record);
});
test('33 no mutation in read models with frozen arrays and entries',()=>{
 const record=Object.freeze(base());const list=Object.freeze([record]);
 assert.deepEqual(summary(list,'ana'),{total:50,rx:0,rxIndex:0});
});
test('34 unknown action rejects with standard error code',()=>code(()=>apply(base(),{type:'FAKE'},ctx('ana')),'INVALID_STATE'));
test('35 witness peer relationships work in both directions',()=>{
 const ana=apply(apply(base('a','ana',10),req('bob'),ctx('ana')),{type:'APPROVE'},ctx('bob'));
 const bob=apply(apply(base('b','bob',20),req('ana'),ctx('bob')),{type:'APPROVE'},ctx('ana'));
 assert.equal(summary([ana,bob],'ana').rx,10);assert.equal(summary([ana,bob],'bob').rx,20);
});
