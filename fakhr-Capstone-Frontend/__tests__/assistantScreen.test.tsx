import { syncAssistantAccount, assistantSession } from "../utils/assistantSession";
import React from "react";
import { Dimensions, ScrollView as NativeScrollView } from "react-native";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import HelpCenterScreen from "../app/(tabs)/directory/helpCenter";
import { sendHelpMessage } from "../api/helpCenter.api";
import providerSnapshot from "../data/ai/providers.snapshot.json";
const mockBack = jest.fn(), mockReplace = jest.fn();
const mockQuery=jest.fn();
let mockRTL = true;
let mockChildren = [{ id: "one", name: "First child", nameAr: "", nameEn: "" }, { id: "two", name: "Second child", nameAr: "", nameEn: "" }];
jest.mock("expo-router", () => ({ useFocusEffect: jest.fn(), useRouter: () => ({ canGoBack: () => false, back: mockBack, replace: mockReplace }) }));
jest.mock("@expo/vector-icons", () => ({ Ionicons: "Icon" }));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: "SafeAreaView" }));
jest.mock("../hooks/useI18nLayout", () => ({ useI18nLayout: () => ({ isRTL: mockRTL }) }));
jest.mock("../context/AuthContext", () => ({ useAuth: () => ({ user: { id: "parent-test" } }) }));
jest.mock("../api/children.api", () => ({ getChildren: jest.fn() }));
jest.mock("@tanstack/react-query", () => ({ useQuery: (options: unknown) => (mockQuery(options), { data: mockChildren }) }));
jest.mock("../api/helpCenter.api", () => ({ sendHelpMessage: jest.fn() }));
beforeEach(() => { syncAssistantAccount(undefined); jest.clearAllMocks(); mockRTL = true; mockChildren = [{ id: "one", name: "First child", nameAr: "", nameEn: "" }, { id: "two", name: "Second child", nameAr: "", nameEn: "" }]; });

const approvedMedical = {
  ar: "💜 فخر منصة توعوية وداعمة للأهالي، ولسنا جهة طبية أو جهة مختصة بالتشخيص والعلاج. المعلومات المقدمة للإرشاد العام ولا تغني عن استشارة المختص. ننصحكم دائماً بمراجعة المختص المناسب لحالة طفلكم.",
  en: "💜 Fakhr is an awareness and family support platform, not a medical provider or an authority qualified to diagnose or treat. The information provided is for general guidance and does not replace consultation with a specialist. Please consult a qualified specialist for your child's needs.",
};

test.each(['ar', 'en'] as const)('complete answer, contact details and recommendation cards precede one final disclaimer: %s', async language => {
  mockRTL = language === 'ar';
  const record = providerSnapshot.records.find(r => r.category === 'doctor')!;
  const branch = record.branches[0];
  const medical = approvedMedical[language];
  const main = language === 'ar' ? 'هذه معلومات التقييم والخدمات المتاحة للاستفسار.' : 'Here is the complete assessment and service information for inquiry.';
  const contacts = '1861111 · 24814720 · 24843900 · 23945619 · 24814328 · 24617345';
  const eligibility = language === 'ar' ? '💜 ننصحكم بالتواصل مع الجهة للتأكد من شروط القبول والخدمات وتوفر الأماكن.' : '💜 Please contact the provider to confirm eligibility, services and availability.';
  (sendHelpMessage as jest.Mock).mockResolvedValue({
    message: [medical, main, medical, contacts, eligibility, medical].join('\n\n'), language,
    schoolContext: { category: 'doctor', criteria: {disabilities:[],services:[],age:null,area:null,governorate:null,stage:null} },
    directoryVersion: providerSnapshot.version,
    recommendations: [{category:'doctor',id:record.id,branchIds:[branch.id],verification:'inquiry',evidence:[{branchId:branch.id,sourceId:'directory-profile',page:0,needs:'',ages:null,stage:null,area:null,governorate:null,services:[],verification:'inquiry',reasons:['source_unverified']}]}],
  });
  const ui = render(<HelpCenterScreen />);
  fireEvent.changeText(ui.getByTestId('assistant-input'), language==='ar'?'أريد معلومات التقييم':'Assessment information');
  await act(async () => { fireEvent.press(ui.getByTestId('assistant-send')); });
  expect(ui.getAllByText(medical)).toHaveLength(1);
  expect(ui.getByTestId('provider-card-'+branch.id)).toBeTruthy();
  const tree = JSON.stringify(ui.toJSON());
  expect(tree.indexOf(main)).toBeLessThan(tree.indexOf('assistant-medical-notice'));
  expect(tree.indexOf(contacts)).toBeLessThan(tree.indexOf('assistant-medical-notice'));
  expect(tree.indexOf('provider-card-'+branch.id)).toBeLessThan(tree.indexOf('assistant-admission-notice'));
  expect(tree.indexOf('assistant-admission-notice')).toBeLessThan(tree.indexOf('assistant-medical-notice'));
  expect(ui.getByTestId('assistant-answer-bubble').findAll(node=>node.props.children===medical)).toHaveLength(0);
});

test.each([
  {category:'assessment',language:'en'},
  {category:'general',topic:'activities',language:'ar-KW'},
])('assistant retains $category context and response language',async schoolContext=>{
  (sendHelpMessage as jest.Mock).mockResolvedValue({message:'Context reply',schoolContext,language:schoolContext.language});
  const ui=render(<HelpCenterScreen/>);
  fireEvent.changeText(ui.getByTestId('assistant-input'),'First question');await act(async () => { fireEvent.press(ui.getByTestId('assistant-send')); });
  await waitFor(()=>expect(ui.queryByTestId('assistant-loading')).toBeNull());
  const style=ui.getByText('Context reply').props.style.flat();
  expect(style).toEqual(expect.arrayContaining([expect.objectContaining({writingDirection:schoolContext.language==='en'?'ltr':'rtl'})]));
  fireEvent.changeText(ui.getByTestId('assistant-input'),'Follow up');await act(async () => { fireEvent.press(ui.getByTestId('assistant-send')); });
  await waitFor(()=>expect(ui.queryByTestId('assistant-loading')).toBeNull());
  expect(sendHelpMessage).toHaveBeenLastCalledWith({message:'Follow up',schoolContext,locale:schoolContext.language});
});

test('child profiles are requested only when the parent opens the child selector',()=>{
 const ui=render(<HelpCenterScreen/>);
 expect(mockQuery).toHaveBeenLastCalledWith(expect.objectContaining({enabled:false}));
 fireEvent.press(ui.getByTestId('assistant-child'));
 expect(mockQuery).toHaveBeenLastCalledWith(expect.objectContaining({enabled:true}));
});
test("school criteria persist only within the selected child's conversation", async () => {
  const schoolContext={category:'school',criteria:{disabilities:['autism'],age:null,stage:null,governorate:null,area:null,services:[]}};
  (sendHelpMessage as jest.Mock).mockResolvedValue({message:'How old?',schoolContext});
  const ui=render(<HelpCenterScreen/>);
  fireEvent.changeText(ui.getByTestId('assistant-input'),'Which school for autism?');fireEvent.press(ui.getByTestId('assistant-send'));
  await waitFor(()=>expect(ui.queryByTestId('assistant-loading')).toBeNull());
  fireEvent.changeText(ui.getByTestId('assistant-input'),'8');fireEvent.press(ui.getByTestId('assistant-send'));
  await waitFor(()=>expect(ui.queryByTestId('assistant-loading')).toBeNull());
  expect(sendHelpMessage).toHaveBeenLastCalledWith({message:'8',schoolContext,locale:'ar'});
  fireEvent.press(ui.getByTestId('assistant-child'));fireEvent.press(ui.getByTestId('assistant-child-two'));
  fireEvent.changeText(ui.getByTestId('assistant-input'),'Another school');fireEvent.press(ui.getByTestId('assistant-send'));
  await waitFor(()=>expect(ui.queryByTestId('assistant-loading')).toBeNull());
  expect(sendHelpMessage).toHaveBeenLastCalledWith({message:'Another school',locale:'ar'});
  expect(JSON.stringify((sendHelpMessage as jest.Mock).mock.calls)).not.toContain('First child');
});
test("pending requests cannot duplicate; replies and history stay with the selected child", async () => {
  let resolve!: (value: { message: string }) => void;
  (sendHelpMessage as jest.Mock).mockReturnValue(new Promise(r => { resolve = r; }));
  const ui = render(<HelpCenterScreen />);
  fireEvent.changeText(ui.getByTestId("assistant-input"), "General question");
  fireEvent.press(ui.getByTestId("assistant-send"));
  fireEvent.press(ui.getByTestId("assistant-send"));
  expect(sendHelpMessage).toHaveBeenCalledTimes(1);
  expect(sendHelpMessage).toHaveBeenCalledWith({ message: "General question", locale: "ar" });
  expect(ui.getByTestId("assistant-loading")).toBeTruthy();
  await act(async () => resolve({ message: "Actual API reply" }));
  expect(ui.getByText("Actual API reply")).toBeTruthy();
  fireEvent.press(ui.getByTestId("assistant-child"));
  fireEvent.press(ui.getByTestId("assistant-child-two"));
  expect(ui.queryByText("Actual API reply")).toBeNull();
  fireEvent.press(ui.getByTestId("assistant-child"));
  fireEvent.press(ui.getByTestId("assistant-child-one"));
  expect(ui.getByText("Actual API reply")).toBeTruthy();
  fireEvent.press(ui.getByTestId("assistant-history"));
  expect(ui.getByTestId("assistant-panel-close")).toBeTruthy();
});
test("API failure is visible and restores the draft without a fabricated response", async () => {
  (sendHelpMessage as jest.Mock).mockRejectedValue(new Error("offline"));
  const ui = render(<HelpCenterScreen />);
  fireEvent.changeText(ui.getByTestId("assistant-input"), "Retry me");
  fireEvent.press(ui.getByTestId("assistant-send"));
  await waitFor(() => expect(ui.getByTestId("assistant-error")).toBeTruthy());
  expect(ui.getByTestId("assistant-input").props.value).toBe("Retry me");
  expect(ui.queryByTestId("assistant-loading")).toBeNull();
});
test.each([true, false])("all suggestions send real prompts and back has a Home fallback, RTL=%s", async rtl => {
  mockRTL = rtl;
  (sendHelpMessage as jest.Mock).mockResolvedValue({ message: "API reply" });
  const ui = render(<HelpCenterScreen />);
  for (let index = 0; index < 4; index++) {
    await act(async () => { fireEvent.press(ui.getByTestId(`assistant-action-${index}`)); });
    await waitFor(() => expect(ui.queryByTestId("assistant-loading")).toBeNull());
  }
  expect(sendHelpMessage).toHaveBeenCalledTimes(4);
  fireEvent.press(ui.getByTestId("assistant-back"));
  expect(mockReplace).toHaveBeenCalledWith("/(tabs)/home");
});

test.each([true, false])("restored title, real child and unavailable controls remain accessible, RTL=%s", rtl => {
  mockRTL = rtl;
  const ui = render(<HelpCenterScreen />);
  expect(ui.getByText(rtl ? "اسأل فخر" : "Ask Fakhr")).toBeTruthy();
  expect(ui.queryByText("مساعد فخر")).toBeNull();
  expect(ui.getByText("First child")).toBeTruthy();
  expect(ui.getByLabelText(rtl ? "المرفقات غير مدعومة" : "Attachments unavailable").props.accessibilityState.disabled).toBe(true);
  expect(ui.getByLabelText(rtl ? "الصوت غير مدعوم" : "Voice input unavailable").props.accessibilityState.disabled).toBe(true);
  fireEvent.press(ui.getByTestId("assistant-child"));
  fireEvent.press(ui.getByTestId("assistant-child-two"));
  expect(ui.getByText("Second child")).toBeTruthy();
  expect(sendHelpMessage).not.toHaveBeenCalled();
});

 test.each([true, false])("localized long child names keep one line with full accessible name, RTL=%s", rtl => {
  mockRTL = rtl;
  mockChildren = [{ id: "one", name: "Original unlocalized name", nameAr: "عبدالله عبدالرحمن محمد أحمد الاختبار", nameEn: "Abdullah Abdulrahman Mohammed Ahmed Test" }];
  const ui = render(<HelpCenterScreen />);
  const name = rtl ? mockChildren[0].nameAr : mockChildren[0].nameEn;
  const label = ui.getByTestId("assistant-child-name");
  expect(ui.getByText(name)).toBeTruthy();
  expect(label.props.numberOfLines).toBe(Dimensions.get("window").fontScale > 1 ? undefined : 1);
  expect(label.props.accessibilityLabel).toBe(name);
  expect(label.props.ellipsizeMode).toBe("tail");
  fireEvent.press(ui.getByTestId("assistant-child"));
  expect(ui.getAllByText(name)).toHaveLength(2);
  expect(sendHelpMessage).not.toHaveBeenCalled();
 });
 test.each([true, false])("missing translation preserves the original name, RTL=%s", rtl => {
  mockRTL = rtl;
  mockChildren = [{ id: "one", name: "عبدالله عبدالرحمن", nameAr: "", nameEn: "" }];
  const ui = render(<HelpCenterScreen />);
  expect(ui.getByText("عبدالله عبدالرحمن")).toBeTruthy();
 });

test("privacy explanation remains available without sending a message", () => {
  const ui = render(<HelpCenterScreen />);
  fireEvent.press(ui.getByLabelText("خصوصية المحادثة"));
  expect(ui.getByText(/لا يقرأ ملف الطفل أو خطته تلقائياً/)).toBeTruthy();
  expect(sendHelpMessage).not.toHaveBeenCalled();
});

test.each([
  { rtl: true, language: "ar", main: "جم عمر طفلك؟", admission: "💜 ننصحكم بالتواصل مع المدرسة للتأكد من شروط القبول والخدمات المناسبة لطفلكم.", medical: "💜 فخر منصة توعوية وداعمة للأهالي، ولسنا جهة طبية. المعلومات المقدمة للإرشاد العام ولا تغني عن التشخيص أو الاستشارة الطبية. ننصحكم دائماً بمراجعة المختص المناسب لحالة طفلكم." },
  { rtl: false, language: "en", main: "How old is your child?", admission: "💜 Please contact the school to confirm admission requirements and services suitable for your child.", medical: "💜 Fakhr is an awareness and family support platform, not a medical provider. Our information is for general guidance and does not replace professional medical advice, diagnosis, or treatment. Please consult a qualified specialist for your child's needs." },
])("full notices remain separate from each other and the answer, $language", async ({ rtl, language, main, admission, medical }) => {
  mockRTL = rtl;
  (sendHelpMessage as jest.Mock).mockResolvedValue({ message: [main, admission, medical].join("\n\n"), language });
  const ui = render(<HelpCenterScreen />);
  fireEvent.changeText(ui.getByTestId("assistant-input"), "School question");
  await act(async () => { fireEvent.press(ui.getByTestId("assistant-send")); });
  expect(ui.getAllByText(main)).toHaveLength(1);
  expect(ui.getAllByText(admission)).toHaveLength(1);
  expect(ui.getAllByText(medical)).toHaveLength(1);
  expect(ui.getByTestId("assistant-answer-bubble").findAll(node => node.props.children === medical)).toHaveLength(0);
  expect(ui.getByTestId("assistant-medical-notice").findAll(node => node.props.children === medical).length).toBeGreaterThan(0);
  expect(ui.getByTestId("assistant-admission-notice").findAll(node => node.props.children === admission).length).toBeGreaterThan(0);
});

test.each([
  { category: "school", keep: false }, { category: "nursery", keep: false }, { category: "sports", keep: false },
  { category: "doctor", keep: true }, { category: "rehabilitation", keep: true }, { category: "assessment", keep: true },
  { category: "school", keep: true, question: "What speech therapy treatment is available?" },
  { category: "nursery", keep: true, question: "أحتاج تقييم وعلاج النطق" },
])("medical notice policy: $category / $keep", async ({ category, keep, question }) => {
  const medical = "💜 Fakhr is an awareness and family support platform, not a medical provider. Our information is for general guidance and does not replace professional medical advice, diagnosis, or treatment. Please consult a qualified specialist for your child's needs.";
  const schoolContext = category === "assessment" ? { category } : { category, criteria: { disabilities: ["autism"], age: 8, stage: null, area: null, governorate: null, services: [] } };
  (sendHelpMessage as jest.Mock).mockResolvedValue({ message: "Contact the provider to confirm eligibility.\n\n" + medical, schoolContext, language: "en" });
  const ui = render(<HelpCenterScreen />);
  fireEvent.changeText(ui.getByTestId("assistant-input"), question || "Recommend a provider for autism");
  await act(async () => { fireEvent.press(ui.getByTestId("assistant-send")); });
  expect(ui.getByText("Contact the provider to confirm eligibility.")).toBeTruthy();
  expect(!!ui.queryByTestId("assistant-medical-notice")).toBe(keep);
  if (keep) expect(ui.getByText(medical)).toBeTruthy();
  else expect(ui.queryByText(medical)).toBeNull();
});

test.each(['ar','en'] as const)('structured contacts appear before one final medical disclaimer: %s',async language=>{
 const medical=approvedMedical[language];
 const assessment={version:1,introduction:'Contact introduction',explanation:'Helpful explanation',verificationNotice:'Shared notice',sources:[],medicalDisclaimer:medical,organizations:[{id:'candidate',name:{ar:'جهة حكومية',en:'Government candidate'},candidatePhone:'1861111',departmentStatus:'unverified',serviceStatus:'unverified',referralStatus:'unverified',acceptanceStatus:'unverified',contactEvidence:{status:'unverified',source:null,scope:''}}]};
 (sendHelpMessage as jest.Mock).mockResolvedValue({message:'Legacy repeated contacts '+medical,assessment,language,schoolContext:{category:'assessment'}});
 const ui=render(<HelpCenterScreen/>);fireEvent.changeText(ui.getByTestId('assistant-input'),'IQ assessment');await act(async()=>{fireEvent.press(ui.getByTestId('assistant-send'));});
 expect(ui.queryByText(/Legacy repeated contacts/)).toBeNull();expect(ui.getAllByText(medical)).toHaveLength(1);
 const tree=JSON.stringify(ui.toJSON());expect(tree.indexOf('Contact introduction')).toBeLessThan(tree.indexOf('assessment-contacts'));expect(tree.indexOf('assessment-card-candidate')).toBeLessThan(tree.indexOf('assistant-medical-notice'));
});

test.each(['ar','en'] as const)('seven expanded assessment cards and sources precede the single complete footer: %s',async language=>{
 const medical=approvedMedical[language];
 const phones=['1861111','24814720','24843900','23945619','24814328',null,'24617345'];
 const assessment={version:1,introduction:'Inquiry',explanation:'',verificationNotice:'Confirm services',sources:['https://online.pada.gov.kw/InfoServices.aspx?type=1'],medicalDisclaimer:medical,organizations:phones.map((phone,i)=>({id:String(i),name:{ar:'جهة '+i,en:'Candidate '+i},candidatePhone:phone,departmentStatus:'unverified',serviceStatus:'unverified',referralStatus:'unverified',acceptanceStatus:'unverified',contactEvidence:{status:'unverified',source:'https://online.pada.gov.kw/InfoServices.aspx?type=1',scope:''}}))};
 (sendHelpMessage as jest.Mock).mockResolvedValue({message:medical+'\n\nLegacy\n\n'+medical,assessment,language,schoolContext:{category:'assessment'}});
 const ui=render(<HelpCenterScreen/>);fireEvent.changeText(ui.getByTestId('assistant-input'),'IQ');await act(async()=>{fireEvent.press(ui.getByTestId('assistant-send'));});
 for(let i=0;i<7;i++)fireEvent.press(ui.getByTestId('assessment-toggle-'+i));
 expect(ui.getAllByTestId(/^assessment-card-/)).toHaveLength(7);expect(ui.getAllByTestId(/^assessment-call-/)).toHaveLength(6);expect(ui.getAllByText(medical)).toHaveLength(1);
 const tree=JSON.stringify(ui.toJSON());const footer=tree.indexOf('assistant-medical-notice');
 for(let i=0;i<7;i++){expect(tree.indexOf('assessment-card-'+i)).toBeLessThan(footer);expect(tree.indexOf('assessment-verification-'+i)).toBeLessThan(footer);}
 expect(tree.lastIndexOf(language==='en'?'Official source':'المصدر الرسمي')).toBeLessThan(footer);
 expect(ui.getByTestId('assistant-input').props.placeholder).toBe(language==='en'?'Write your message...':'اكتب رسالتك...');
 expect(ui.getByTestId('assistant-input').props.style.flat()).toEqual(expect.arrayContaining([expect.objectContaining({writingDirection:language==='en'?'ltr':'rtl'})]));
});

test.each([true,false])('input starts in UI language and follows conversation language switches, RTL=%s',async rtl=>{
 mockRTL=rtl;const ui=render(<HelpCenterScreen/>);
 expect(ui.getByTestId('assistant-input').props.placeholder).toBe(rtl?'اكتب رسالتك...':'Write your message...');
 for(const language of ['en','ar-KW','en']){
  (sendHelpMessage as jest.Mock).mockResolvedValue({message:'Reply',language});
  fireEvent.changeText(ui.getByTestId('assistant-input'),'Question');await act(async()=>{fireEvent.press(ui.getByTestId('assistant-send'));});
  expect(ui.getByTestId('assistant-input').props.placeholder).toBe(language==='en'?'Write your message...':'اكتب رسالتك...');
 expect(ui.getByTestId('assistant-input').props.style.flat()).toEqual(expect.arrayContaining([expect.objectContaining({writingDirection:language==='en'?'ltr':'rtl'})]));
 }
});


test.each(['ar','en'] as const)('mixed specialist cards precede female availability note and final medical disclaimer: %s',async language=>{
 mockRTL=language==='ar';
 const refs=['center-speech-plus','center-abc-kuwait'].map(id=>{const r=providerSnapshot.records.find(x=>x.id===id)!;const b=r.branches[0];return {category:r.category,id,branchIds:[b.id],verification:'inquiry',evidence:[{branchId:b.id,sourceId:'directory-profile',page:0,needs:'',ages:null,stage:null,area:null,governorate:null,services:[],verification:'inquiry',reasons:['female_availability_unknown']}]};});
 const notice=language==='ar'?'💜 ننصحكم بالتواصل مع الجهة للتأكد من توفر أخصائية.':'💜 Please contact the provider to confirm female-specialist availability.';
 const criteria={disabilities:[],services:['speech'],age:null,area:null,governorate:null,stage:null,specialistSearch:true,practitionerPreference:'female'};
 (sendHelpMessage as jest.Mock).mockResolvedValue({message:['Matching services',notice,approvedMedical[language]].join('\n\n'),language,schoolContext:{category:'doctor',criteria},directoryVersion:providerSnapshot.version,recommendations:refs});
 const ui=render(<HelpCenterScreen/>);fireEvent.changeText(ui.getByTestId('assistant-input'),'أبي أخصائية نطق');await act(async()=>{fireEvent.press(ui.getByTestId('assistant-send'));});
 const tree=JSON.stringify(ui.toJSON());for(const ref of refs)expect(tree.indexOf('provider-card-'+ref.id)).toBeLessThan(tree.indexOf('assistant-admission-notice'));
 expect(tree.indexOf('assistant-admission-notice')).toBeLessThan(tree.indexOf('assistant-medical-notice'));expect(ui.getAllByText(approvedMedical[language])).toHaveLength(1);
 fireEvent.changeText(ui.getByTestId('assistant-input'),'والمراكز؟');await act(async()=>{fireEvent.press(ui.getByTestId('assistant-send'));});
 expect(sendHelpMessage).toHaveBeenLastCalledWith(expect.objectContaining({schoolContext:{category:'doctor',criteria}}));
});

test.each([true,false])('restores child, conversation, draft, criteria and scroll after Details remount, RTL=%s',async rtl=>{
 mockRTL=rtl;
 const schoolContext={category:'school',criteria:{disabilities:['autism'],age:8,stage:null,governorate:null,area:null,services:[]}};
 (sendHelpMessage as jest.Mock).mockResolvedValue({message:'Saved answer',schoolContext,language:rtl?'ar':'en'});
 let ui=render(<HelpCenterScreen/>);
 fireEvent.press(ui.getByTestId('assistant-child'));fireEvent.press(ui.getByTestId('assistant-child-two'));
 fireEvent.changeText(ui.getByTestId('assistant-input'),'Question before Details');
 await act(async()=>{fireEvent.press(ui.getByTestId('assistant-send'));});
 fireEvent.changeText(ui.getByTestId('assistant-input'),'Unsent draft');
 fireEvent.scroll(ui.getByTestId('assistant-chat-scroll'),{nativeEvent:{contentOffset:{y:240}}});
 ui.unmount();ui=render(<HelpCenterScreen/>);
 expect(ui.getByText('Saved answer')).toBeTruthy();expect(ui.getByText('Question before Details')).toBeTruthy();
 expect(ui.getByTestId('assistant-child-name').props.accessibilityLabel).toBe('Second child');
 expect(ui.getByTestId('assistant-input').props.value).toBe('Unsent draft');
 expect(assistantSession('parent-test').values.offset).toBe(240);
 await act(async()=>{fireEvent.press(ui.getByTestId('assistant-send'));});
 expect(sendHelpMessage).toHaveBeenLastCalledWith({message:'Unsent draft',schoolContext,locale:rtl?'ar':'en'});
});

test('layout changes restore offset and only a new message triggers auto-scroll',async()=>{
 const to=jest.spyOn(NativeScrollView.prototype,'scrollTo').mockImplementation(()=>{});
 const end=jest.spyOn(NativeScrollView.prototype,'scrollToEnd').mockImplementation(()=>{});
 (sendHelpMessage as jest.Mock).mockResolvedValue({message:'New answer'});
 const ui=render(<HelpCenterScreen/>);
 fireEvent.scroll(ui.getByTestId('assistant-chat-scroll'),{nativeEvent:{contentOffset:{y:175}}});
 fireEvent(ui.getByTestId('assistant-chat-scroll'),'contentSizeChange',300,1000);
 expect(to).toHaveBeenLastCalledWith({y:175,animated:false});expect(end).not.toHaveBeenCalled();
 fireEvent.changeText(ui.getByTestId('assistant-input'),'New question');
 await act(async()=>{fireEvent.press(ui.getByTestId('assistant-send'));});
 fireEvent(ui.getByTestId('assistant-chat-scroll'),'contentSizeChange',300,1400);
 expect(end).toHaveBeenCalledTimes(1);
 fireEvent(ui.getByTestId('assistant-chat-scroll'),'contentSizeChange',300,1450);
 expect(end).toHaveBeenCalledTimes(1);
 to.mockRestore();end.mockRestore();
});

test.each(['ar','en'] as const)('awareness answer then sources then one disclaimer with session restore: %s',async language=>{
 mockRTL=language==='ar';const awareness={version:'v1',status:'source-checked-not-clinically-reviewed',checkedAt:'2026-10-14',sources:[{id:'s',title:'NHS Hair Care',url:'https://example.invalid/hair',verification:{status:'source-checked',checkedAt:'2026-10-14',clinicalReview:'not-clinically-reviewed',note:''}}]};
 const heading=language==='en'?'Educational sources — source-checked summaries, not clinically reviewed or an individual assessment:':'مصادر توعوية — ملخصات راجعنا مصادرها، ولم تخضع لمراجعة سريرية وليست تقييماً فردياً:';
 (sendHelpMessage as jest.Mock).mockResolvedValue({message:['Helpful answer',heading+'\nNHS Hair Care: https://example.invalid/hair',approvedMedical[language]].join('\n\n'),language,awareness,schoolContext:{category:'awareness',topicIds:['haircut']}});
 let ui=render(<HelpCenterScreen/>);fireEvent.changeText(ui.getByTestId('assistant-input'),'Haircuts');await act(async()=>{fireEvent.press(ui.getByTestId('assistant-send'));});
 expect(ui.getByText('Helpful answer')).toBeTruthy();expect(ui.getAllByText(approvedMedical[language])).toHaveLength(1);
 const tree=JSON.stringify(ui.toJSON());expect(tree.indexOf('assistant-answer-bubble')).toBeLessThan(tree.indexOf('educational-sources'));expect(tree.indexOf('educational-sources')).toBeLessThan(tree.indexOf('assistant-medical-notice'));
 expect(ui.queryByText(/NHS Hair Care: https/)).toBeNull();ui.unmount();ui=render(<HelpCenterScreen/>);expect(ui.getByTestId('educational-sources')).toBeTruthy();
});
