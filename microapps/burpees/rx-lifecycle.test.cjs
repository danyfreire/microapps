'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createPersonalRecord:create,applyRxAction:act,summarizeUser:sum}=require('./rx-lifecycle.cjs');
const base=(id='r',qty=50,today='2026-10-10')=>create({id,userId:'ana',quantity:qty,activityDate:today},today);
const operation=(record,type,actorId='ana',today='2026-10-10',extra={})=>act(record,{type,...extra},{actorId,today});
function throwsCode(fn,code){assert.throws(fn,e=>e.code===code);}
test('creation preserves identity and initializes unverified record',()=>{
 assert.deepEqual(base(),{id:'r',userId:'ana',quantity:50,activityDate:'2026-10-10',createdDate:'2026-10-10',status:'PERSONAL',validatorId:null,validatedBy:null});
});
test('only today or yesterday allowed as civil date',()=>{
 assert.equal(create({id:'a',userId:'ana',quantity:1,activityDate:'2026-12-31'},'2027-01-01').status,'PERSONAL');
 throwsCode(()=>create({id:'a',userId:'ana',quantity:1,activityDate:'2026-10-08'},'2026-10-10'),'INVALID_ACTIVITY_DATE');
});
test('invalid quantities rejected without imposing a maximum',()=>{
 throwsCode(()=>base('a',0),'INVALID_QUANTITY');
 throwsCode(()=>base('a',1.2),'INVALID_QUANTITY');
 assert.equal(base('a',9000).quantity,9000);
});
test('only owner may request a different identifiable witness',()=>{
 const r=base();
 throwsCode(()=>operation(r,'REQUEST','bob','2026-10-10',{witnessId:'zoe'}),'FORBIDDEN');
 throwsCode(()=>operation(r,'REQUEST','ana','2026-10-10',{witnessId:'ana'}),'SELF_VERIFICATION');
 throwsCode(()=>operation(r,'REQUEST','ana','2026-10-10',{witnessId:''}),'INVALID_WITNESS');
 assert.equal(operation(r,'REQUEST','ana','2026-10-10',{witnessId:'bob'}).validatorId,'bob');
});
test('request window is days 0 through 7 inclusive',()=>{
 const r=create({id:'r',userId:'ana',quantity:20,activityDate:'2026-10-01'},'2026-10-01');
 assert.equal(operation(r,'REQUEST','ana','2026-10-08',{witnessId:'bob'}).status,'VERIFICATION_PENDING');
 throwsCode(()=>operation(r,'REQUEST','ana','2026-10-09',{witnessId:'bob'}),'WINDOW_EXPIRED');
 throwsCode(()=>operation(r,'REQUEST','ana','2026-09-30',{witnessId:'bob'}),'WINDOW_EXPIRED');
});
test('pending record only responds to selected witness',()=>{
 const r=operation(base(),'REQUEST','ana','2026-10-10',{witnessId:'bob'});
 throwsCode(()=>operation(r,'APPROVE','zoe'),'FORBIDDEN');
 throwsCode(()=>operation(r,'REQUEST','ana','2026-10-10',{witnessId:'zoe'}),'INVALID_STATE');
 assert.deepEqual([operation(r,'APPROVE','bob').status,operation(r,'REJECT','bob').status],['RX_VERIFIED','REJECTED']);
});
test('late response accepted after timely request',()=>{
 const r=create({id:'a',userId:'ana',quantity:20,activityDate:'2026-10-01'},'2026-10-01');
 const pending=operation(r,'REQUEST','ana','2026-10-02',{witnessId:'bob'});
 assert.equal(operation(pending,'APPROVE','bob','2027-02-02').validatedBy,'bob');
});
test('cancel only by owner, enables replacing a witness',()=>{
 const pending=operation(base(),'REQUEST','ana','2026-10-10',{witnessId:'bob'});
 throwsCode(()=>operation(pending,'CANCEL','bob'),'FORBIDDEN');
 const canceled=operation(pending,'CANCEL');
 assert.equal(canceled.status,'PERSONAL');assert.equal(canceled.validatorId,null);
 assert.equal(operation(canceled,'REQUEST','ana','2026-10-10',{witnessId:'zoe'}).validatorId,'zoe');
});
test('voiding verified activity removes Rx and Total',()=>{
 const pending=operation(base(),'REQUEST','ana','2026-10-10',{witnessId:'bob'});
 const verified=operation(pending,'APPROVE','bob');
 assert.deepEqual(sum([verified],'ana'),{total:50,rx:50,rxIndex:100});
 const voided=operation(verified,'VOID');
 assert.deepEqual(sum([voided],'ana'),{total:0,rx:0,rxIndex:0});
 throwsCode(()=>operation(voided,'VOID'),'INVALID_STATE');
});
test('statistics exclude other users and deduplicate record ids',()=>{
 const other=create({id:'b',userId:'bob',quantity:10,activityDate:'2026-10-10'},'2026-10-10');
 const record=base();
 assert.deepEqual(sum([record,record,other],'ana'),{total:50,rx:0,rxIndex:0});
});
test('never mutate frozen records or caller inputs',()=>{
 const source=Object.freeze({id:'r',userId:'ana',quantity:50,activityDate:'2026-10-10'});
 const r=Object.freeze(create(source,'2026-10-10'));
 const action=Object.freeze({type:'REQUEST',witnessId:'bob'});
 const context=Object.freeze({actorId:'ana',today:'2026-10-10'});
 const next=act(r,action,context);
 assert.equal(r.status,'PERSONAL'); assert.notEqual(next,r);
 assert.deepEqual(sum(Object.freeze([r]),'ana'),{total:50,rx:0,rxIndex:0});
});
