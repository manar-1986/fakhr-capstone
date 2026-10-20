import { consumeAuthLimit } from '../middlewares/authRateLimit';
import { AuthLimit } from '../models/AuthSecurity.model';
test('atomic persistent account limits survive handler recreation and expire by server time',async()=>{
 await consumeAuthLimit('synthetic-a',3); // create prior to concurrency, test independent handlers
 const replies=await Promise.all(Array.from({length:6},()=>consumeAuthLimit('synthetic-a',3)));
 expect(replies.filter(r=>r.allowed)).toHaveLength(2);
 expect((await consumeAuthLimit('synthetic-a',3)).allowed).toBe(false);
 expect((await consumeAuthLimit('synthetic-b',3)).allowed).toBe(true);
 await AuthLimit.updateOne({_id:'synthetic-a'},{$set:{expiresAt:new Date(0)}});
 expect((await consumeAuthLimit('synthetic-a',3)).allowed).toBe(true);
 expect((await AuthLimit.findById('synthetic-a'))?.count).toBe(1);
});
