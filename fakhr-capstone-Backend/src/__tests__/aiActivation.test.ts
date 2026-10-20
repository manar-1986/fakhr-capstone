import { aiActivation,aiPilotEnabled } from '../modules/ai/ai.activation';
import { consumeAuthLimit } from '../middlewares/authRateLimit';
jest.mock('../middlewares/authRateLimit',()=>({consumeAuthLimit:jest.fn()}));
jest.mock('../config/env',()=>({env:{JWT_SECRET:'synthetic-test-secret-only'}}));
const consume=consumeAuthLimit as jest.Mock;
function response(){const r:any={setHeader:jest.fn(),status:jest.fn(),json:jest.fn()};r.status.mockReturnValue(r);return r;}
beforeEach(()=>{jest.clearAllMocks();delete process.env.FAKHR_AI_ACCESS;delete process.env.FAKHR_AI_ENABLED;});
test.each([{}, {FAKHR_AI_ACCESS:'pilot'}, {FAKHR_AI_ENABLED:'true'}, {FAKHR_AI_ACCESS:'pilot',FAKHR_AI_ENABLED:'TRUE'}])('default closed %j',raw=>expect(aiPilotEnabled(raw)).toBe(false));
test('guest cannot consume storage',async()=>{const r=response();await aiActivation({} as any,r,jest.fn());expect(r.status).toHaveBeenCalledWith(401);expect(consume).not.toHaveBeenCalled();});
test('disabled account does not consume storage',async()=>{const r=response();await aiActivation({user:{id:'a'}} as any,r,jest.fn());expect(r.status).toHaveBeenCalledWith(503);expect(consume).not.toHaveBeenCalled();});
test('account key isolated and hashed; quota is three',async()=>{
 process.env.FAKHR_AI_ACCESS='pilot';process.env.FAKHR_AI_ENABLED='true';consume.mockResolvedValue({allowed:true});const next=jest.fn();
 for(const id of ['account-a','account-b','account-a'])await aiActivation({user:{id}} as any,response(),next);
 expect(next).toHaveBeenCalledTimes(3);expect(consume.mock.calls[0][0]).toMatch(/^[a-f0-9]{64}$/);
 expect(consume.mock.calls[0]).toEqual(consume.mock.calls[2]);expect(consume.mock.calls[0][0]).not.toEqual(consume.mock.calls[1][0]);expect(consume.mock.calls[0][1]).toBe(3);
});
test('rate limit supplies Retry-After and never dispatches',async()=>{
 process.env.FAKHR_AI_ACCESS='pilot';process.env.FAKHR_AI_ENABLED='true';consume.mockResolvedValue({allowed:false,retryAfter:42});const r=response(),next=jest.fn();await aiActivation({user:{id:'a'}} as any,r,next);expect(r.status).toHaveBeenCalledWith(429);expect(r.setHeader).toHaveBeenCalledWith('Retry-After',42);expect(next).not.toHaveBeenCalled();
});
test('storage failure is closed and sanitized',async()=>{
 process.env.FAKHR_AI_ACCESS='pilot';process.env.FAKHR_AI_ENABLED='true';consume.mockRejectedValue(Error('SENSITIVE_SENTINEL'));const r=response(),next=jest.fn();await aiActivation({user:{id:'a'}} as any,r,next);expect(r.status).toHaveBeenCalledWith(503);expect(JSON.stringify(r.json.mock.calls)).not.toContain('SENSITIVE');expect(next).not.toHaveBeenCalled();
});
