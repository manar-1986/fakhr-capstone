import axios, { AxiosError, AxiosHeaders } from 'axios';
import api from '../api/axios';
import * as storage from '../utils/secureStorage';
jest.mock('../utils/secureStorage', () => ({getItemAsync: jest.fn(),deleteItemAsync: jest.fn()}));
const getToken = storage.getItemAsync as jest.Mock;
const removeToken = storage.deleteItemAsync as jest.Mock;
beforeEach(() => { jest.clearAllMocks(); getToken.mockResolvedValue('synthetic-test-token'); });
async function capture(url: string, method = 'get') {
 let captured: any;
 const result = await api.request({url,method,adapter: async config => {
  captured=config;return {data:{ok:true},status:200,statusText:'OK',headers:{},config};
 }});
 expect(result).toEqual({ok:true});return captured;
}
test('patched Axios preserves authenticated headers and request defaults', async () => {
 const c=await capture('/children');expect(c.headers.get('Authorization')).toBe('Bearer synthetic-test-token');
 expect(c.headers.get('Content-Type')).toBe('application/json');expect(c.timeout).toBe(10000);
});
test('guest and public directory reads do not attach a token', async () => {
 expect((await capture('/directory/doctors')).headers.get('Authorization')).toBeUndefined();
 expect(getToken).not.toHaveBeenCalled();getToken.mockResolvedValue(null);
 expect((await capture('/children')).headers.get('Authorization')).toBeUndefined();
});
test.each([401,403,429,500])('preserves API error %s and clears only unauthorized sessions', async status => {
 await expect(api.get('/children',{adapter:async config => {throw new AxiosError('rejected','ERR_BAD_RESPONSE',config,undefined,{data:{message:'synthetic error'},status,statusText:'Error',headers:{},config});}})).rejects.toMatchObject({message:'synthetic error',status});
 expect(removeToken).toHaveBeenCalledTimes(status===401?1:0);
});
test.each(['ECONNABORTED','ERR_NETWORK'])('network failure %s does not delete session', async code => {
 await expect(api.get('/children',{adapter:async config=>{throw new AxiosError('Network Error',code,config);}})).rejects.toThrow();
 expect(removeToken).not.toHaveBeenCalled();
});
