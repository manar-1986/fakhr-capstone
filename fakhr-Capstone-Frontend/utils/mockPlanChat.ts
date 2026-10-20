/** Local canned replies only. Input is never added to the Plan context or sent to a server. */
export function mockChatReply(enabled:boolean,input:string,ar:boolean):string{
 if(!enabled)throw Error('MOCK_DISABLED');
 if(typeof input!=='string'||!input.trim()||input.length>500)throw Error('INVALID_MESSAGE');
 const q=input.trim().toLowerCase();
 if(/دواء|جرعة|تشخيص|medicat|dosage|diagnos/.test(q))return ar?'هذه محاكاة تعليمية ولا تقدم تشخيصًا أو جرعات أدوية. راجع المختص بشأن الأسئلة الطبية.':'This educational simulation cannot diagnose or provide medication doses. Ask a qualified professional about medical questions.';
 if(/خطة|أسبوع|plan|week/.test(q))return ar?'افتح «إنشاء خطة ذكية»، واختر الأهداف وخيارات الوصول، ثم راجع أنشطة الأسبوع وأوقاتها. لا تُحفظ أي إضافة قبل موافقتك، والحفظ هنا في ذاكرة المعاينة فقط.':'Open Create Smart Plan, select goals and accessibility preferences, then review weekly activities and times. Nothing is added before your approval; saves here are preview-memory only.';
 if(/تقدم|مشاركة|progress|complet/.test(q))return ar?'ملخص الأسبوع يعرض المشاركة المسجلة في بيانات الاختبار فقط. إكمال نشاط لا يثبت تحسنًا نمائيًا. راجع الملخص داخل إنشاء الخطة دون افتراض نتائج غير مسجلة.':'The weekly summary reports fixture participation only. Completing an activity does not prove developmental improvement. Review the summary in Smart Plan without assuming unrecorded results.';
 if(/وصول|تواصل|حسي|access|sensory|communicat|aac/.test(q))return ar?'اختر خيارات الوصول في إنشاء الخطة، ثم راجع التكييفات المكتوبة لكل نشاط. يمكنك اختيار بديل أو التخطي أو رفض المقترح. لن تتغير الخطة تلقائيًا.':'Select accessibility preferences in Smart Plan, then review the written adaptations for each activity. You can choose an alternative, skip, or decline. The plan never changes automatically.';
 return ar?'أنا محاكاة محلية بإجابات محدودة، ولست متصلًا بالذكاء الاصطناعي. أستطيع شرح إنشاء خطة ومراجعة المشاركة وخيارات الوصول. لا أقرأ ملف طفلك أو أغير خطته.':'I am a local simulation with limited replies, not a connected AI. I can explain plan creation, participation review, and accessibility options. I do not read your child’s profile or change their plan.';
}
