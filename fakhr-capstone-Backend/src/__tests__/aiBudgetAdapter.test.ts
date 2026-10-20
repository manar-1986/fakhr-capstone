import {runBudgetedAI} from '../modules/ai/ai.transport';
import {buildAIRequest} from '../modules/ai/ai.requests';
test('real application adapter remains disabled without paid dispatch',async()=>{
 await expect(runBudgetedAI({category:'general',topic:'plans',language:'en'})).rejects.toMatchObject({statusCode:503});
});
test('public request construction rejects raw narrative and private fields',()=>{
 expect(()=>buildAIRequest({category:'general',topic:'plans',question:'private'})).toThrow();
 expect(()=>buildAIRequest({category:'awareness',topicIds:['sound'],profile:{name:'private'}})).toThrow();
});
