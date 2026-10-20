describe('coordinated Plan and AI release navigation',()=>{
 const previous={...process.env};
 afterEach(()=>{process.env={...previous};jest.resetModules();});
 function gates(){jest.resetModules();return require('../utils/minimumRelease');}
 test('both explicit capabilities coexist and deferred features remain closed',()=>{
  process.env.EXPO_PUBLIC_FAKHR_RELEASE_PROFILE='minimum-plan';process.env.EXPO_PUBLIC_FAKHR_AI_ACCESS='pilot';
  const g=gates();
  for(const route of ['/plan','/generate-plan','/directory/helpCenter'])expect(g.unavailableRoute(route)).toBe(false);
  for(const route of ['/messages','/calendar','/forgot-password','/delete-account'])expect(g.unavailableRoute(route)).toBe(true);
  for(const api of ['/care-paths/generate','/care-path-tasks/id/complete','/ai/ask'])expect(g.unavailableApi(api,'post')).toBe(false);
  expect(g.unavailableApi('/ai/ask','get')).toBe(true);
 });
 test('preview mock flag cannot enable release AI',()=>{
  delete process.env.EXPO_PUBLIC_FAKHR_AI_ACCESS;process.env.EXPO_PUBLIC_FAKHR_MOCK_AI='true';
  expect(gates().unavailableApi('/ai/ask','post')).toBe(true);
 });
 test('production URL cannot fall back to local or an alternate service',()=>{
  const g=gates();expect(g.releaseApiUrl(false)).toBe('https://fakhrcapstone-36gs.onrender.com/api');
  expect(()=>g.releaseApiUrl(false,'http://localhost:3000/api')).toThrow();
 });
});
