import {validateProductionEnvironment, passwordResetUrl} from '../config/production';
import {initializeBackend} from '../startup';

// Synthetic strings only. No validation test connects to these hosts.
const valid = () => ({NODE_ENV:'production', JWT_SECRET:'aB3!cD4@eF5#gH6$iJ7%kL8^mN9&oP0*',
 MONGODB_URI:'mongodb+srv://fixture:fixture-password@db.example.invalid/fakhr',
 FRONTEND_URL:'https://app.example.invalid', EMAIL_HOST:'smtp.example.invalid',EMAIL_PORT:'587',
 EMAIL_SECURE:'false',EMAIL_USER:'fixture-user',EMAIL_PASS:'fixture-password',EMAIL_FROM:'noreply@example.invalid',
 FAKHR_AI_ENABLED:'false',SEED_CARE_PATH:'false'});

describe('Production configuration preflight',()=>{
 it('accepts the required STARTTLS configuration',()=>expect(()=>validateProductionEnvironment(valid())).not.toThrow());
 it('accepts implicit TLS and authenticated replica-set TLS',()=>expect(()=>validateProductionEnvironment({...valid(),EMAIL_PORT:'465',EMAIL_SECURE:'true',MONGODB_URI:'mongodb://fixture:fixture-password@db1.example.invalid:27017,db2.example.invalid:27017/fakhr?tls=true&replicaSet=rs0'})).not.toThrow());
 it.each(['JWT_SECRET','MONGODB_URI','FRONTEND_URL','EMAIL_HOST','EMAIL_PORT','EMAIL_SECURE','EMAIL_USER','EMAIL_PASS','EMAIL_FROM'])('rejects missing %s without leaking values',key=>{
  const raw:Record<string,string>=valid();delete raw[key];expect(()=>validateProductionEnvironment(raw)).toThrow('Invalid production configuration');
 });
 it.each([
  ['JWT_SECRET','short'],['JWT_SECRET','x'.repeat(64)],['JWT_SECRET','replace-me-abcdefghijklmnopqrstuvwxyz12345'],
  ['MONGODB_URI','mongodb://localhost/fakhr'],['MONGODB_URI','mongodb+srv://db.example.invalid/fakhr'],
  ['MONGODB_URI','mongodb+srv://fixture:fixture-password@db.example.invalid/'],
  ['MONGODB_URI','mongodb://fixture:fixture-password@db.example.invalid/fakhr'],
  ['MONGODB_URI','mongodb+srv://fixture:fixture-password@db.example.invalid/fakhr?tls=false'],
  ['MONGODB_URI','mongodb+srv://fixture:fixture-password@db.example.invalid/fakhr?tlsAllowInvalidCertificates=true'],
  ['MONGODB_URI','mongodb+srv://fixture:fixture-password@db.example.invalid/fakhr?tlsInsecure=true'],
  ['MONGODB_URI','mongodb+srv://fixture:fixture-password@db.example.invalid/fakhr?tls=true&TLS=false'],
  ['MONGODB_URI','mongodb+srv://fixture:%ZZ@db.example.invalid/fakhr'],
  ['EMAIL_HOST','localhost'],['EMAIL_HOST','smtp://smtp.example.invalid'],['EMAIL_PORT','587junk'],
  ['EMAIL_PORT','25'],['EMAIL_SECURE','TRUE'],['EMAIL_SECURE','true'],['EMAIL_PASS','short'],
  ['EMAIL_FROM','sender@example.invalid\r\nBcc: victim@example.invalid'],
  ['EMAIL_FROM','Fakhr <sender@example.invalid>'],['EMAIL_USER','fixture\nvalue'],
  ['PORT','70000'],['JWT_EXPIRES_IN','invalid'],['NODE_TLS_REJECT_UNAUTHORIZED','0'],
  ['SEED_CARE_PATH','true'],['FAKHR_AI_ENABLED','true'],['FAKHR_SUPPORT_LOCAL_TEST','1'],
 ])('rejects unsafe %s configuration', (key,value)=>expect(()=>validateProductionEnvironment({...valid(),[key]:value})).toThrow('Invalid production configuration'));
 it.each(['https://localhost','https://localhost.','https://child.localhost','https://127.0.0.1',
  'https://[::1]','https://2130706433','https://10.0.0.1','https://app.local','https://intranet',
  'http://app.example.invalid','javascript:alert(1)','https://user:pass@app.example.invalid',
  'https://app.example.invalid/reset','https://app.example.invalid?redirect=https://other.invalid',
  'https://app.example.invalid#fragment','https://app.example.invalid:8443',' https://app.example.invalid',
  'https://app.example.invalid\\@other.invalid', 'https://app.example.invalid/\n'])('rejects unsafe reset origin %s',url=>{
   expect(()=>validateProductionEnvironment({...valid(),FRONTEND_URL:url})).toThrow('FRONTEND_URL');
   expect(()=>passwordResetUrl(url,'a'.repeat(64),true)).toThrow('FRONTEND_URL');
 });
 it('constructs only the fixed reset path and encoded token',()=>{
  const url=new URL(passwordResetUrl('https://app.example.invalid/','ab'.repeat(32),true));
  expect(url.origin).toBe('https://app.example.invalid');expect(url.pathname).toBe('/reset-password');
  expect(url.search).toBe('');expect(new URLSearchParams(url.hash.slice(1)).get('token')).toBe('ab'.repeat(32));
 });
 it.each(['//other.invalid','a'.repeat(64)+'&redirect=https://other.invalid','<script>',''])('rejects invalid token/redirect injection',token=>expect(()=>passwordResetUrl(valid().FRONTEND_URL,token,true)).toThrow('Invalid reset token'));
 it('never includes credentials or input URLs in errors',()=>{
  const credential='sensitive-fixture-only';
  try{validateProductionEnvironment({...valid(),MONGODB_URI:`mongodb://fixture:${credential}@localhost/fakhr`});throw new Error('Expected rejection');}
  catch(e){expect((e as Error).message).toBe('Invalid production configuration: MONGODB_URI');expect(String(e)).not.toContain(credential);}
 });
 it.each(['development','test'])('retains isolated %s defaults and localhost reset support',NODE_ENV=>{
  expect(()=>validateProductionEnvironment({NODE_ENV})).not.toThrow();
  expect(passwordResetUrl('http://localhost:3000','a'.repeat(64),false)).toContain('http://localhost:3000/reset-password#token=');
 });
 it('rejects misspelled production mode',()=>expect(()=>validateProductionEnvironment({NODE_ENV:'Production'})).toThrow('NODE_ENV'));
 it.each([undefined,'development','test'])('rejects Render production-mode bypass: %s',NODE_ENV=>expect(()=>validateProductionEnvironment({RENDER:'true',NODE_ENV})).toThrow('NODE_ENV'));
 it('does not permit non-web reset schemes in development',()=>expect(()=>passwordResetUrl('javascript:alert(1)','a'.repeat(64),false)).toThrow('FRONTEND_URL'));
});

describe('Required SMTP startup gate',()=>{
 it('validates before making connections',async()=>{
  const connect=jest.fn(),verifyEmail=jest.fn();
  await expect(initializeBackend({NODE_ENV:'production'},{connect,verifyEmail})).rejects.toThrow('JWT_SECRET');
  expect(connect).not.toHaveBeenCalled();expect(verifyEmail).not.toHaveBeenCalled();
 });
 it('permits startup only after required SMTP succeeds',async()=>{
  const order:string[]=[];
  await initializeBackend(valid(),{connect:async()=>{order.push('db');},verifyEmail:async()=>{order.push('smtp');return true;}});
  expect(order).toEqual(['db','smtp']);
 });
 it.each(['false','reject'])('fails startup on SMTP %s without provider details',async mode=>{
  const listen=jest.fn();const verifyEmail=jest.fn(async()=>{if(mode==='reject')throw new Error('private SMTP credentials');return false;});
  await expect(initializeBackend(valid(),{connect:async()=>{},verifyEmail}).then(listen)).rejects.toThrow('Required SMTP verification failed');
  expect(listen).not.toHaveBeenCalled();
 });
 it('does not attempt SMTP after database failure',async()=>{
  const verifyEmail=jest.fn();await expect(initializeBackend(valid(),{connect:async()=>{throw new Error('Database unavailable');},verifyEmail})).rejects.toThrow('Database unavailable');expect(verifyEmail).not.toHaveBeenCalled();
 });
 it.each(['test','development'])('does not require live SMTP in %s',async NODE_ENV=>{
  const verifyEmail=jest.fn();await initializeBackend({NODE_ENV},{connect:async()=>{},verifyEmail});expect(verifyEmail).not.toHaveBeenCalled();
 });
});
