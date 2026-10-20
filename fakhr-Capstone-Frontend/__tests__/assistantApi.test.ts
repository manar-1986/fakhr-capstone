import instance from "../api/axios";
import { sendHelpMessage } from "../api/helpCenter.api";
jest.mock("../api/axios", () => ({ __esModule: true, default: { post: jest.fn() } }));
test("uses the existing ask contract and reads the real answer", async () => {
  (instance.post as jest.Mock).mockResolvedValue({ success: true, data: { answer: "Verified response", timestamp: "2026-10-09T00:00:00Z" } });
  await expect(sendHelpMessage({ message: "Question" })).resolves.toEqual({ message: "Verified response", timestamp: "2026-10-09T00:00:00Z" });
  expect(instance.post).toHaveBeenCalledWith("/ai/ask", { question: "Question" }, { timeout: 60000 });
});
test("rejects empty responses instead of supplying a made-up answer", async () => {
  (instance.post as jest.Mock).mockResolvedValue({ success: true, data: { answer: "" } });
  await expect(sendHelpMessage({ message: "Question" })).rejects.toThrow("AI returned no answer");
});

test.each([
  {category:'assessment' as const,language:'en' as const},
  {category:'general' as const,topic:'activities' as const,language:'ar-KW' as const},
  {category:'awareness' as const,topicIds:['sound'],categoryId:'autism' as const,language:'ar-KW' as const},
])('round-trips conversation context without adding child data: $category',async schoolContext=>{
  (instance.post as jest.Mock).mockResolvedValue({success:true,data:{answer:'Safe reply',schoolContext,language:schoolContext.language}});
  const reply=await sendHelpMessage({message:'Follow up',schoolContext});
  expect(reply.schoolContext).toEqual(schoolContext);
  expect(instance.post).toHaveBeenLastCalledWith('/ai/ask',{question:'Follow up',schoolContext},{timeout:60000});
});

test('passes optional structured assessment without altering the authenticated request',async()=>{
 const assessment={version:1,introduction:'Contacts',organizations:[]};
 (instance.post as jest.Mock).mockResolvedValue({success:true,data:{answer:'Fallback',assessment}});
 expect((await sendHelpMessage({message:'IQ'})).assessment).toEqual(assessment);
 expect(instance.post).toHaveBeenLastCalledWith('/ai/ask',{question:'IQ'},{timeout:60000});
});

test('round-trips inactive specialist memory without adding profiles or active filters',async()=>{
 const schoolContext={category:'sports' as const,criteria:{disabilities:['intellectual'],age:8,stage:null,area:null,governorate:null,services:[],specialistSearch:false,practitionerPreference:null,specialistMemory:{practitionerPreference:'female' as const,services:['speech'],specialistSearch:true}}};
 (instance.post as jest.Mock).mockResolvedValue({success:true,data:{answer:'Club options',schoolContext}});
 expect((await sendHelpMessage({message:'Sports clubs',schoolContext})).schoolContext).toEqual(schoolContext);
 expect(instance.post).toHaveBeenLastCalledWith('/ai/ask',{question:'Sports clubs',schoolContext},{timeout:60000});
});

test('preserves awareness metadata and rejects malformed evidence without losing answer',async()=>{
 const awareness={version:'v1',status:'source-checked-not-clinically-reviewed',checkedAt:'2026-10-14',sources:[{id:'source',title:'NHS',url:'https://example.invalid/source',verification:{status:'source-checked',checkedAt:'2026-10-14',clinicalReview:'not-clinically-reviewed',note:''}}]};
 (instance.post as jest.Mock).mockResolvedValue({success:true,data:{answer:'Original answer',awareness}});expect((await sendHelpMessage({message:'Question'})).awareness).toEqual(awareness);
 (instance.post as jest.Mock).mockResolvedValue({success:true,data:{answer:'Original answer',awareness:{}}});expect(await sendHelpMessage({message:'Question'})).toMatchObject({message:'Original answer'});expect((await sendHelpMessage({message:'Question'})).awareness).toBeUndefined();
});
