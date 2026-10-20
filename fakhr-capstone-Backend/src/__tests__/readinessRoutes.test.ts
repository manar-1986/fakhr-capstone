import request from 'supertest';
import {createApp} from '../application';
import User from '../models/User.model';
import {generateToken} from '../utils/jwt';
jest.mock('../utils/email',()=>({sendPasswordResetEmail:jest.fn(),verifyEmailConfig:jest.fn()}));
jest.mock('openai',()=>({__esModule:true,default:jest.fn(()=>{throw new Error('Live AI forbidden in readiness tests')})}));
const operations=[
 ['GET','/api/care-path-tasks/invalid'],
 ['GET','/api/plan-dashboard'],['POST','/api/plan-dashboard/generate'],['POST','/api/plan-dashboard/add-activity'],
 ['POST','/api/plan-dashboard/tasks/invalid'],['POST','/api/plan-dashboard/meals'],['PUT','/api/plan-dashboard/meals/invalid'],
 ['GET','/api/plan-dashboard/suggestions'],['PUT','/api/plan-dashboard/suggestions'],
 ['GET','/api/plan-dashboard/companion'],['PUT','/api/plan-dashboard/companion'],
 ['GET','/api/daily-care'],['GET','/api/daily-care/activities'],['POST','/api/daily-care/participation'],
 ['POST','/api/daily-care/appointments'],['PUT','/api/daily-care/appointments/invalid'],['PUT','/api/daily-care/appointments/invalid/occurrence'],
 ['POST','/api/daily-care/medications'],['PUT','/api/daily-care/medications/invalid'],['POST','/api/daily-care/medication-actions'],
];
const before={profile:process.env.FAKHR_RELEASE_PROFILE,plan:process.env.FAKHR_PLAN_DASHBOARD_ENABLED,care:process.env.FAKHR_DAILY_CARE_ENABLED};
beforeAll(()=>{process.env.FAKHR_RELEASE_PROFILE='minimum-plan';process.env.FAKHR_PLAN_DASHBOARD_ENABLED='true';process.env.FAKHR_DAILY_CARE_ENABLED='true'});
afterAll(()=>{for(const [key,value] of Object.entries({FAKHR_RELEASE_PROFILE:before.profile,FAKHR_PLAN_DASHBOARD_ENABLED:before.plan,FAKHR_DAILY_CARE_ENABLED:before.care})){if(value===undefined)delete process.env[key];else process.env[key]=value}});
test.each(operations)('%s %s is mounted, authenticates, and validates input',async(method,url)=>{
 const app=createApp();await (request(app) as any)[method.toLowerCase()](url).send({}).expect(401);
 const user=await User.create({email:'readiness@example.invalid',password:'synthetic'});
 const response=await (request(app) as any)[method.toLowerCase()](url).auth(generateToken({userId:user.id}),{type:'bearer'}).send({});
 expect(response.status).toBe(400);
 expect(response.headers['content-type']).toContain('application/json');
});