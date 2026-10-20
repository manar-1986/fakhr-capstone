import {mockChatReply} from '../utils/mockPlanChat';
test('cannot run outside mock preview',()=>expect(()=>mockChatReply(false,'plan',false)).toThrow('MOCK_DISABLED'));
test.each(['',' ', 'x'.repeat(501)])('rejects invalid input',s=>expect(()=>mockChatReply(true,s,false)).toThrow('INVALID_MESSAGE'));
test('provides bilingual limited responses',()=>{expect(mockChatReply(true,'How do I plan?',false)).toContain('approval');expect(mockChatReply(true,'كيف أنشئ خطة؟',true)).toContain('موافقتك');expect(mockChatReply(true,'progress',false)).toContain('does not prove');expect(mockChatReply(true,'aac',false)).toContain('never changes automatically')});
test('does not echo private input or claim personal knowledge',()=>{const s='My child Mary has a private diagnosis';expect(mockChatReply(true,s,false)).not.toContain('Mary');expect(mockChatReply(true,s,false)).toContain('cannot diagnose');expect(mockChatReply(true,'anything else',false)).toContain('local simulation')});
