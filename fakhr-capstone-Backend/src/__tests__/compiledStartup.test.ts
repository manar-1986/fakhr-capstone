import {spawnSync} from 'node:child_process';
import path from 'node:path';

const root=path.resolve(__dirname,'../..');
const config={NODE_ENV:'production',JWT_SECRET:'aB3!cD4@eF5#gH6$iJ7%kL8^mN9&oP0*',
 MONGODB_URI:'mongodb+srv://fixture:fixture-password@db.example.invalid/fakhr',
 FRONTEND_URL:'https://app.example.invalid',EMAIL_HOST:'smtp.example.invalid',EMAIL_PORT:'587',
 EMAIL_SECURE:'false',EMAIL_USER:'fixture-user',EMAIL_PASS:'fixture-password',EMAIL_FROM:'noreply@example.invalid',FAKHR_AI_ENABLED:'false'};

function run(mode:'success'|'false'|'reject'|'invalid') {
 // Substitute only network/listen boundaries in this child process; the compiled
 // startup, environment validation and email verification code execute unchanged.
 const script=`
 const path=require('node:path');
 const root=${JSON.stringify(root)};
 const db=path.join(root,'dist/config/db.js');
 require.cache[db]={id:db,filename:db,loaded:true,exports:{default:async()=>{console.log('MOCK_DB');}}};
 const app=path.join(root,'dist/application.js');
 require.cache[app]={id:app,filename:app,loaded:true,exports:{createApp:()=>({listen:()=>console.log('MOCK_LISTEN')})}};
 require('nodemailer').createTransport=()=>({verify:async()=>{console.log('MOCK_SMTP');${mode==='reject' ? "throw new Error('private SMTP fixture');" : `return ${mode==='success'};`}}});
 require(path.join(root,'dist/app.js'));
 `;
 return spawnSync(process.execPath,['-e',script],{cwd:root,encoding:'utf8',timeout:15000,
  env:{PATH:process.env.PATH,SystemRoot:process.env.SystemRoot,...config,...(mode==='invalid'?{FRONTEND_URL:'http://localhost:3000'}:{})}});
}
describe('Compiled production startup with mocked I/O only',()=>{
 it('validates, connects, verifies SMTP, then listens in order',()=>{
  const r=run('success');expect(r.error).toBeUndefined();expect(r.status).toBe(0);
  expect(r.stdout).toMatch(/MOCK_DB[\s\S]*MOCK_SMTP[\s\S]*MOCK_LISTEN/);
 });
 it.each(['false','reject'] as const)('exits without listening for SMTP %s',mode=>{
  const r=run(mode);expect(r.error).toBeUndefined();expect(r.status).toBe(1);
  expect(r.stdout).toContain('MOCK_SMTP');expect(r.stdout).not.toContain('MOCK_LISTEN');
  expect(r.stderr).toContain('Backend startup failed');
  expect(r.stderr).not.toContain('private SMTP fixture');expect(r.stderr).not.toContain('fixture-password');
 });
 it('rejects localhost before any network boundary',()=>{
  const r=run('invalid');expect(r.error).toBeUndefined();expect(r.status).toBe(1);
  expect(r.stdout).not.toMatch(/MOCK_DB|MOCK_SMTP|MOCK_LISTEN/);
  expect(r.stderr).not.toContain('localhost');
 });
});
