/** @jest-environment node */
import { captureResetToken, takeResetToken, clearResetToken } from "../utils/resetEntry";
const root=globalThis as any;
afterEach(()=>{delete root.window;clearResetToken();});
test("removes all URL secrets before router initialization without storing credentials",()=>{const replaceState=jest.fn();root.window={location:{pathname:"/reset-password",href:"https://account.example.invalid/reset-password?token="+"a".repeat(64)+"&extra=secret#hidden"},history:{state:{},replaceState}};captureResetToken();expect(replaceState).toHaveBeenCalledWith({},"","/reset-password");expect(takeResetToken()).toBe("a".repeat(64));expect(takeResetToken()).toBe("a".repeat(64));clearResetToken();expect(takeResetToken()).toBeUndefined();});
test("duplicate query tokens fail closed",()=>{root.window={location:{pathname:"/reset-password",href:"https://account.example.invalid/reset-password?token="+"a".repeat(64)+"&token="+"b".repeat(64)},history:{state:null,replaceState:jest.fn()}};captureResetToken();expect(takeResetToken()).toBe("");});

test.each(['#token='+ 'a'.repeat(64), '?token='+ 'a'.repeat(64)])('fragment and legacy query links preserve token only in memory: %s',suffix=>{
 const replaceState=jest.fn();root.window={location:{pathname:'/reset-password',href:'https://account.example.invalid/reset-password'+suffix},history:{state:null,replaceState}};
 captureResetToken();expect(takeResetToken()).toBe('a'.repeat(64));expect(replaceState).toHaveBeenCalledWith(null,'','/reset-password');
});
test.each(['#token=bad','#token='+ 'a'.repeat(64)+'&token='+ 'b'.repeat(64),'?token='+ 'a'.repeat(64)+'#token='+ 'a'.repeat(64)])('malformed or mixed fragments fail closed: %s',suffix=>{
 root.window={location:{pathname:'/reset-password',href:'https://account.example.invalid/reset-password'+suffix},history:{state:null,replaceState:jest.fn()}};
 captureResetToken();expect(takeResetToken()).toBe('');expect(root.window.history.replaceState).toHaveBeenCalled();
});
