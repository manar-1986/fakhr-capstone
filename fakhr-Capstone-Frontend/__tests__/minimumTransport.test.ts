import {AxiosError} from 'axios';
import api from '../api/axios';
import {finishSignIn,beginSignOut} from '../utils/sessionLifecycle';
import * as storage from '../utils/secureStorage';
jest.mock('../utils/secureStorage',()=>({getItemAsync:jest.fn(),deleteItemAsync:jest.fn()}));
beforeEach(()=>{jest.clearAllMocks();finishSignIn();jest.mocked(storage.getItemAsync).mockImplementation(async k=>k==='token'?'synthetic':null);});
const ok = jest.fn(async(config:any)=>({config,data:{success:true},status:200,statusText:'OK',headers:{}}));
test('disabled request is rejected before transport without clearing token',async()=>{await expect(api.get('/favorites',{adapter:ok})).rejects.toMatchObject({status:503,code:'FEATURE_DISABLED'});expect(ok).not.toHaveBeenCalled();expect(storage.deleteItemAsync).not.toHaveBeenCalled();});
test('remote FEATURE_DISABLED keeps code and bilingual message',async()=>{await expect(api.get('/children',{adapter:async config=>{throw new AxiosError('failure','ERR_BAD_RESPONSE',config,undefined,{config,status:503,statusText:'Unavailable',headers:{},data:{code:'FEATURE_DISABLED'}});}})).rejects.toMatchObject({code:'FEATURE_DISABLED',status:503,message:expect.stringContaining('غير متاحة')});expect(storage.deleteItemAsync).not.toHaveBeenCalled();});
test('logout retains authorization while other private requests are blocked',async()=>{beginSignOut();await expect(api.get('/children',{adapter:ok})).rejects.toMatchObject({status:401});await api.post('/auth/logout',{}, {adapter:async config=>{expect(config.headers.Authorization).toBe('Bearer synthetic');return ok(config);}});});
test('guest catalog remains usable after logout',async()=>{beginSignOut();await api.get('/directory/centers',{adapter:ok});expect(ok).toHaveBeenCalled();});
test('late previous-session response cannot populate a new session',async()=>{await expect(api.get('/children',{adapter:async config=>{finishSignIn();return ok(config);}})).rejects.toMatchObject({code:'SESSION_CHANGED'});});
test('rate limit preserves Retry-After and blocks immediate manual resubmission',async()=>{
 const now=Date.now();const clock=jest.spyOn(Date,'now').mockReturnValue(now);
 try{await expect(api.post('/auth/login',{}, {adapter:async config=>{throw new AxiosError('failure','ERR_BAD_RESPONSE',config,undefined,{config,status:429,statusText:'Rate limit',headers:{'retry-after':'4'},data:{message:'Wait'}});}})).rejects.toMatchObject({status:429,retryAfterSeconds:4});
 const transport=jest.fn(ok);await expect(api.post('/auth/login',{}, {adapter:transport})).rejects.toMatchObject({status:429});expect(transport).not.toHaveBeenCalled();clock.mockReturnValue(now+5000);await api.post('/auth/login',{}, {adapter:transport});expect(transport).toHaveBeenCalledTimes(1);
 }finally{clock.mockRestore();}
});
