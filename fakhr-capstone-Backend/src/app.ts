import {env} from './config/env';
import {validateProductionEnvironment} from './config/production';
import {initializeBackend} from './startup';
async function start() {
 validateProductionEnvironment(process.env);
 // Load services only after preflight; this package compiles to CommonJS.
 const {default:connectDB}=require('./config/db') as typeof import('./config/db');
 const {createApp}=require('./application') as typeof import('./application');
 const {verifyEmailConfig}=require('./utils/email') as typeof import('./utils/email');
 await initializeBackend(process.env,{connect:connectDB,verifyEmail:verifyEmailConfig});
 createApp().listen(env.PORT,()=>console.log('Fakhr backend listening'));
}
void start().catch(async()=>{
 console.error('Backend startup failed: configuration, database or required SMTP verification');
 const {default:mongoose}=await import('mongoose');
 await mongoose.disconnect().catch(()=>{});
 process.exitCode=1;
});
