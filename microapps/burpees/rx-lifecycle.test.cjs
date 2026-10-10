'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createPersonalRecord:create,applyRxAction:act,summarizeUser:stats}=require('./rx-lifecycle.cjs');
const data=(id='r1',who='ana',quantity=50,activityDate='2026-10-10')=>({id,userId:who,quantity,activityDate});
const today='2026-10-10';
const context=actorId=>({actorId,today});
const request={type:'REQUEST',witnessId:'bob'};
const err=(fn,code)=>assert.throws(fn,e=>e.code===code);

test('record created for today with personal state',()=>{
  const v=create(data(),today);assert.equal(v.status,'PERSONAL');assert.equal(v.createdDate,today);
});
test('invalid quantity and old activity date rejected',()=>{
  err(()=>create(data('q','ana',0),today),'INVALID_QUANTITY');
  err(()=>create(data('d','ana',4,'2026-10-07'),today),'INVALID_ACTIVITY_DATE');
});
test('request and confirm by witness',()=>{
  const p=act(create(data(),today),request,context('ana'));
  assert.equal(p.validatorId,'bob');assert.equal(p.status,'VERIFICATION_PENDING');
  const rx=act(p,{type:'APPROVE'},context('bob'));
  assert.equal(rx.status,'RX_VERIFIED');assert.equal(rx.validatedBy,'bob');
});
test('self-validation forbidden and wrong actor rejected',()=>{
  const r=create(data(),today);
  err(()=>act(r,{type:'REQUEST',witnessId:'ana'},context('ana')),'SELF_VERIFICATION');
  err(()=>act(r,request,context('eve')),'FORBIDDEN');
});
test('request expires after seven calendar days',()=>{
  const r=create(data('x','ana',10,'2026-10-01'),'2026-10-01');
  err(()=>act(r,request,{actorId:'ana',today:'2026-10-09'}),'WINDOW_EXPIRED');
});
test('cancel and replace testifying person',()=>{
  const pending=act(create(data(),today),request,context('ana'));
  const canceled=act(pending,{type:'CANCEL'},context('ana'));
  assert.equal(canceled.validatorId,null);
  assert.equal(act(canceled,{type:'REQUEST',witnessId:'zoe'},context('ana')).validatorId,'zoe');
});
test('void affects totals and verified percentage',()=>{
  const p=act(create(data(),today),request,context('ana'));
  const confirmed=act(p,{type:'APPROVE'},context('bob'));
  assert.deepEqual(stats([confirmed],'ana'),{total:50,rx:50,rxIndex:100});
  assert.deepEqual(stats([act(confirmed,{type:'VOID'},context('ana'))],'ana'),{total:0,rx:0,rxIndex:0});
});
