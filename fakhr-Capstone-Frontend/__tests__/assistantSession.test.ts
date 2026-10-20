import { assistantSession, saveAssistantSession, syncAssistantAccount } from '../utils/assistantSession';
beforeEach(()=>syncAssistantAccount(undefined));
test('memory survives repeated visits only for the same authenticated account',()=>{
 const first=assistantSession('one');saveAssistantSession(first,{messages:['answer'],offset:123,drafts:{child:'draft'}});
 expect(assistantSession('one')).toBe(first);
 syncAssistantAccount('two');expect(assistantSession('two').values).toEqual({});
 saveAssistantSession(first,{messages:['late response']});
 syncAssistantAccount('one');expect(assistantSession('one').values).toEqual({});
});
test('logout clears memory and guest snapshots cannot be retained',()=>{
 const first=assistantSession('one');saveAssistantSession(first,{messages:['private']});
 syncAssistantAccount(undefined);saveAssistantSession(first,{messages:['late response']});
 expect(assistantSession('one').values).toEqual({});
 const guest=assistantSession();saveAssistantSession(guest,{messages:['guest']});expect(assistantSession().values).toEqual({});
});
