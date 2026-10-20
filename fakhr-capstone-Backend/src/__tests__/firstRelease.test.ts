import {validateProductionEnvironment} from '../config/production';
const base=()=>({NODE_ENV:'production',FAKHR_RELEASE_PROFILE:'minimum-plan',JWT_SECRET:'aB3!cD4@eF5#gH6$iJ7%kL8^mN9&oP0*',MONGODB_URI:'mongodb+srv://fixture:fixture-password@db.example.invalid/fakhr'});
const active=()=>({...base(),FAKHR_AI_ENABLED:'true',FAKHR_AI_ACCESS:'pilot',FAKHR_AI_OPENAI_API_KEY:'dummy-not-a-real-key-1234567890',FAKHR_AI_LEDGER_ANCHOR:'1'.repeat(64),FAKHR_AI_LEDGER_SIGNING_KEY:'2'.repeat(64),FAKHR_AI_WITNESS_SIGNING_KEY:'3'.repeat(64),FAKHR_AI_WITNESS_URI:'mongodb+srv://fixture:fixture-password@witness.example.invalid/witness'});
test('Plan may boot with AI off and email absent',()=>expect(()=>validateProductionEnvironment(base())).not.toThrow());
test('combined explicit pilot accepts complete synthetic configuration',()=>expect(()=>validateProductionEnvironment(active())).not.toThrow());
test.each(['FAKHR_AI_OPENAI_API_KEY','FAKHR_AI_LEDGER_ANCHOR','FAKHR_AI_LEDGER_SIGNING_KEY','FAKHR_AI_WITNESS_SIGNING_KEY','FAKHR_AI_WITNESS_URI','FAKHR_AI_ACCESS'])('missing %s fails closed',key=>{const raw:any=active();delete raw[key];expect(()=>validateProductionEnvironment(raw)).toThrow();});
test.each([
 ['FAKHR_RELEASE_PROFILE','minimum'],['FAKHR_AI_ENABLED','TRUE'],['FAKHR_AI_ACCESS','public'],
 ['FAKHR_AI_WITNESS_URI',base().MONGODB_URI],['FAKHR_AI_WITNESS_URI','mongodb://x:y@localhost/test'],
 ['FAKHR_AI_WITNESS_SIGNING_KEY','2'.repeat(64)],['FAKHR_AI_LEDGER_ANCHOR','malformed'],
 ['FAKHR_AI_OPENAI_API_KEY','Authorization: Bearer dummy secret'],['FAKHR_AI_RECOVERY_APPROVED','forfeit-without-refund']
])('rejects unsafe %s without values in errors',(key,value)=>{try{validateProductionEnvironment({...active(),[key]:value});throw Error('ACCEPTED');}catch(e){expect((e as Error).message).toMatch(/^Invalid production configuration:/);expect((e as Error).message).not.toContain(value);}});
test('Render proxy requirement is not bypassed by AI',()=>expect(()=>validateProductionEnvironment({...active(),RENDER:'true'})).toThrow('TRUSTED_PROXY_CIDRS'));
