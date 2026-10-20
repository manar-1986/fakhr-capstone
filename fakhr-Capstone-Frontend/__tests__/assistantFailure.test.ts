import { assistantFailure } from '../utils/assistantFailure';
test.each([true,false])('safe localized errors %s',ar=>{
 for(const status of [400,401,429,503]){const s=assistantFailure(Object.assign(Error('PRIVATE'),{status}),ar);expect(s).not.toContain('PRIVATE');expect(/[\u0600-\u06ff]/.test(s)).toBe(ar);}
 expect(assistantFailure(Object.assign(Error(),{status:429,retryAfterSeconds:42}),ar)).toContain('42');
 expect(assistantFailure(Object.assign(Error(),{code:'FEATURE_DISABLED'}),ar)).toBeTruthy();
});
test('pilot UI is off unless explicitly requested and only opens ask POST',()=>{
 delete process.env.EXPO_PUBLIC_FAKHR_AI_ACCESS;jest.resetModules();let g=require('../utils/minimumRelease');expect(g.unavailableRoute('/directory/helpCenter')).toBe(true);
 process.env.EXPO_PUBLIC_FAKHR_AI_ACCESS='pilot';jest.resetModules();g=require('../utils/minimumRelease');expect(g.unavailableRoute('/directory/helpCenter')).toBe(false);expect(g.unavailableApi('/ai/ask','post')).toBe(false);expect(g.unavailableApi('/ai/ask','get')).toBe(true);expect(g.unavailableRoute('/messages')).toBe(true);delete process.env.EXPO_PUBLIC_FAKHR_AI_ACCESS;
});
