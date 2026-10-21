const {test} = require('node:test');
const assert = require('node:assert/strict');
const {checkModel} = require('./check-ai-model.cjs');
const env = {FAKHR_AI_ENVIRONMENT:'authorized-nonproduction',FAKHR_AI_ENABLED:'false',FAKHR_AI_ACCESS:'off',FAKHR_AI_OPENAI_API_KEY:'synthetic-test-only'};
test('missing configuration never dispatches',async()=>{
  assert.equal(await checkModel({},()=>{throw Error('must not call');}),'BLOCKED_CONFIGURATION');
});
test('metadata request only, fixed model and no payload',async()=>{
  assert.equal(await checkModel(env,async(url,options)=>{
    assert.equal(url,'https://api.openai.com/v1/models/gpt-6-luna');
    assert.equal(options.method,'GET'); assert.equal(options.body,undefined);
    assert.equal(options.redirect,'error');
    return {ok:true,json:async()=>({id:'gpt-6-luna'})};
  }),'MODEL_METADATA_ACCESS_CONFIRMED');
});
test('errors and wrong model fail without disclosing content',async()=>{
  assert.equal(await checkModel(env,async()=>{throw Error('sensitive-provider-error');}),'MODEL_ACCESS_UNVERIFIED');
  assert.equal(await checkModel(env,async()=>({ok:true,json:async()=>({id:'other'})})),'MODEL_ACCESS_UNVERIFIED');
});
test('enabled live dispatch configuration is refused',async()=>{
  assert.equal(await checkModel({...env,FAKHR_AI_ENABLED:'true'},()=>{throw Error('must not call');}),'BLOCKED_CONFIGURATION');
});
