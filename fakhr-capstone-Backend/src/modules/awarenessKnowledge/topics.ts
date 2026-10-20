// Public educational summaries; source-checked 2026-10-14, not clinically reviewed.
// No accounts, records, environment variables or network access belong in this module.
export const knowledgeVersion = '2026-10-14.awareness.3';
export const sources = {
hairCare:["NHS Humber — hair care","https://connect.humber.nhs.uk/service/humber-sensory-processing-hub/hair-care/"],
hairWashing:["NHS Devon — hair washing","https://childrenandfamilyhealthdevon.nhs.uk/resources/hairwashing-for-children-tips-and-advice/"],
hairBrushing:["NHS Oxford — hair washing, cutting and brushing","https://www.oxfordhealth.nhs.uk/wp-content/uploads/2014/05/Sensory-Hair-Washing-Cutting-Brushing.pdf"],
nailCare:["NHS Humber — nail cutting","https://connect.humber.nhs.uk/service/humber-sensory-processing-hub/nail-cutting/"],
toothbrushing:["NHS Humber — brushing teeth","https://connect.humber.nhs.uk/service/humber-sensory-processing-hub/brushing-teeth/"],
clothing:["NHS Humber — dressing","https://connect.humber.nhs.uk/service/humber-sensory-processing-hub/dressing/"],
skin:["NHS — contact dermatitis","https://www.nhs.uk/conditions/contact-dermatitis/"],
toothache:["NHS — toothache","https://www.nhs.uk/symptoms/toothache/"],
eyePain:["NHS — eye pain","https://www.nhs.uk/symptoms/eye-pain/"],
noiseSensitivity:["NHS — noise sensitivity","https://www.nhs.uk/conditions/hyperacusis/"],
 communicationSupport:['NHS Cambridgeshire — communication','https://cambspborochildrenshealth.nhs.uk/services/cambridgeshire-community-paediatrics/after-assessment-of-autism/communication-and-play/communication/'],
 sensoryNeeds:['NHS Lancashire and South Cumbria — sensory processing needs','https://www.lancashireandsouthcumbria.icb.nhs.uk/our-work/special-educational-needs-and-disabilities-send/sensory-processing-needs-information'],
 behaviour:['NHS Devon — support with behaviour','https://childrenandfamilyhealthdevon.nhs.uk/resources/support-with-behaviour-guide-for-parents/'],
 reversals:['Somerset NHS — letter and number reversals','https://www.somersetft.nhs.uk/children-and-young-peoples-therapy-service/letter-and-number-reversals/'],
 toes:['Gateshead NHS — idiopathic toe walking','https://www.gatesheadhealth.nhs.uk/resources/idiopathic-toe-walking/'],
 seizures:['NHS — epilepsy and seizure symptoms','https://www.nhs.uk/conditions/epilepsy/'],
 headInjury:['NHS — head injury and concussion','https://www.nhs.uk/conditions/head-injury-and-concussion/'],
 sensory: ['NHS Autism Central — sensory differences','https://www.autismcentral.nhs.uk/guidance/sensory-differences'],
 support: ['NHS — supporting an autistic child','https://www.nhs.uk/conditions/autism/supporting-a-child/'],
 signs: ['NHS — signs of autism in children','https://www.nhs.uk/conditions/autism/signs-in-children/'],
 speech: ['NIDCD — speech and language development','https://www.nidcd.nih.gov/health/speech-and-language'],
 attention: ['CDC — ADHD symptoms','https://www.cdc.gov/adhd/signs-symptoms/index.html'],
 reading: ['NHS — dyslexia in children','https://www.nhs.uk/conditions/dyslexia-in-children/'],
 motor: ['CDC — cerebral palsy','https://www.cdc.gov/cerebral-palsy/about/index.html'],
 down: ['NHS — supporting children with Down syndrome','https://www.nhs.uk/conditions/downs-syndrome/how-to-help-children-and-young-people/'],
 intellectual: ['NHS — learning disabilities (intellectual disability terminology)','https://www.nhs.uk/conditions/learning-disabilities/'],
 hearing: ['WHO — deafness and hearing loss','https://www.who.int/news-room/fact-sheets/detail/deafness-and-hearing-loss'],
 vision: ['WHO — vision impairment','https://www.who.int/news-room/fact-sheets/detail/blindness-and-visual-impairment'],
 development: ['CDC — Learn the Signs. Act Early.','https://www.cdc.gov/act-early/about/index.html'],
 feeding: ['Kingston and Richmond NHS — selective eating','https://www.kingstonandrichmond.nhs.uk/patients-and-families/patient-leaflets/selective-eating-children'],
 sleep: ['NHS — sleep and young children','https://www.nhs.uk/baby/health/sleep-and-young-children/'],
 urgent: ['NHS — urgent help for young children','https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/']
} as const;
export type SourceId=keyof typeof sources;
export type Topic={aliases:string[]; question:{ar:string;en:string}; facts:{ar:string;en:string}; support:{ar:string;en:string}; referral:{ar:string;en:string}; sources:SourceId[]};
// These need-based packs deliberately do not assert or transmit an individual diagnosis.
export const topics:Record<string,Topic>={
 sound:{aliases:['يصك اذونه','يسكر اذونه','يغطي اذنه','يغطي اذنيه','يغطي اذونه','cover ears','covers ears','covering ears','sound','noise','الصوت','الاصوات','اصوات عاليه','حساسيه صوت','حساسيه للصوت','يغطي اذانيه','يغطي اذانه','sensory overload'],question:{ar:'ليش بعض الأطفال يغطون آذانهم؟',en:'Why might children cover their ears?'},facts:{ar:'قد يكون الصوت مزعجاً أو شديداً بالنسبة لهم. هذا السلوك وحده لا يحدد التشخيص أو السبب.',en:'Sounds may feel uncomfortable or overwhelming. Ear-covering alone does not establish a diagnosis or its cause.'},support:{ar:'لاحظوا الأصوات المزعجة وخففوا الضوضاء وخلّوا مكان هادئ متاحاً دون إجبار الطفل على تحملها.',en:'Notice triggering sounds, reduce avoidable noise and offer a quiet space without forcing exposure.'},referral:{ar:'ناقشوا استمرار الانزعاج مع المختص، ومع ألم الأذن أو تغير السمع راجعوا الطبيب.',en:'Discuss persistent distress with a professional; ear pain or hearing changes warrant medical review.'},sources:['sensory','support','speech']},
 sensory:{aliases:['sensory','حسي','حسيه','ملمس','ملابس','textures','touch','light sensitivity','حساسيه الضوء','لمس'],question:{ar:'شنو الاختلافات الحسية وشلون ندعم الطفل؟',en:'What are sensory differences and how can families help?'},facts:{ar:'الإحساس بالضوء واللمس والروائح والأصوات يختلف؛ بعضها قد يكون شديداً أو غير ملحوظ. الاحتياجات تتغير حسب البيئة.',en:'Responses to light, touch, smells and sound vary; some input can feel intense or be less noticeable. Needs can vary with the setting.'},support:{ar:'لاحظوا ما يريح الطفل، خففوا المثيرات المزعجة وقدموا خيارات مريحة وفترات راحة.',en:'Observe preferences, reduce distressing input and offer comfortable choices and breaks.'},referral:{ar:'إذا أثرت الصعوبات على الأكل أو النوم أو المشاركة اليومية، ناقشوها مع المختص.',en:'Seek professional advice when difficulties affect eating, sleep or daily participation.'},sources:['sensory','support']},
 stimming:{aliases:['يرفرف','رفرفه','stimming','flapping','repetitive movement','حركات متكرره'],question:{ar:'ليش بعض الأطفال يرفرفون بإيدينهم؟',en:'Why might children flap their hands or repeat movements?'},facts:{ar:'الحركات المتكررة قد تكون مريحة أو ممتعة أو تساعد على التعامل مع الإحساس بالمحيط، وليست وحدها تشخيصاً.',en:'Repetitive movements can be enjoyable, calming or help manage sensory experiences; alone they are not a diagnosis.'},support:{ar:'لا توقفوا حركة آمنة لمجرد اختلافها. لاحظوا متى تحدث ووفروا الراحة إذا كان الطفل منزعجاً.',en:'Do not stop a safe movement merely because it looks different. Notice its context and offer comfort when distressed.'},referral:{ar:'اطلبوا مساعدة إذا سببت إصابة أو ضيقاً أو تغيرت بشكل مقلق.',en:'Seek help if movements cause injury, distress or a concerning change.'},sources:['support']},
 eyeContact:{aliases:['eye contact','عيوني','عيونه','تواصل بصري','يناظرني','يطالعني'],question:{ar:'هل اختلاف التواصل البصري يعني تشخيصاً محدداً؟',en:'Does different eye contact establish a diagnosis?'},facts:{ar:'التواصل البصري يختلف بين الأطفال. لا يمكن تحديد التشخيص من سلوك واحد؛ التقييم ينظر إلى نمط النمو والتواصل كاملاً.',en:'Eye contact varies. One behavior cannot establish a diagnosis; assessment considers the broader developmental and communication pattern.'},support:{ar:'تواصلوا بطريقة مريحة، وراقبوا الإشارات والكلمات دون إجبار الطفل على النظر.',en:'Use comfortable communication and attend to gestures and words without forcing eye contact.'},referral:{ar:'إذا توجد مخاوف مستمرة بالتواصل أو النمو، اطلبوا تقييماً متخصصاً.',en:'Ask for professional assessment for persistent communication or developmental concerns.'},sources:['signs','support']},
 echolalia:{aliases:['تكرر الكلام','يكرر الكلام','ترديد الكلام','echolalia','repeats words','repeat words','repeating words'],question:{ar:'شنو يعني تكرار الكلام؟',en:'What does repeating words mean?'},facts:{ar:'قد يكرر الطفل كلمات أو عبارات سمعها. التكرار وحده لا يثبت تشخيصاً، ويحتاج فهم التواصل في سياقه.',en:'A child may repeat words or phrases heard before. Repetition alone does not establish a diagnosis; communication needs to be understood in context.'},support:{ar:'اسمعوا الرسالة المحتملة وراء الكلام، واستخدموا عبارات واضحة واتركوا وقتاً للرد.',en:'Attend to the possible message, use clear phrases and allow time to respond.'},referral:{ar:'إذا كان فهم الكلام أو التعبير صعباً، استفسروا عن تقييم النطق واللغة والسمع.',en:'If understanding or expressing language is difficult, ask about speech-language and hearing assessment.'},sources:['signs','speech','down']},
 communication:{aliases:['تاخر الكلام','يتاخر بالكلام','تاخر بالكلام','speech delay','speech disorder','language disorder','language delay','نطق','تخاطب','لغوي','communication','التواصل','ما يتكلم'],question:{ar:'شلون ندعم تطور الكلام والتواصل؟',en:'How can families support speech and communication development?'},facts:{ar:'صعوبات نطق الأصوات تختلف عن صعوبات فهم اللغة أو التعبير بها. السمع قد يؤثر على تطور الكلام ولا نحدد السبب من الرسالة وحدها.',en:'Speech-sound difficulties differ from difficulties understanding or expressing language. Hearing can affect speech development; a message alone cannot establish the cause.'},support:{ar:'تكلموا بوضوح، شاركوا اللعب والقراءة، واستجيبوا لمحاولات التواصل مع وقت كافٍ للرد.',en:'Speak clearly, share play and reading, and respond to communication attempts with time for a reply.'},referral:{ar:'عند القلق على الكلام راجعوا طبيب الطفل، وقد يلزم تقييم السمع والنطق واللغة.',en:'Discuss speech concerns with a clinician; hearing and speech-language assessment may be appropriate.'},sources:['speech','down']},
 attention:{aliases:['attention','hyperactiv','adhd','فرط الحركه','فرط حركه','تشتت','ما يقدر يقعد','بمكانه','impulsiv'],question:{ar:'ليش يصعب التركيز أو الجلوس بهدوء؟',en:'Why can attention or sitting still be difficult?'},facts:{ar:'الانتباه والنشاط وضبط الاندفاع تختلف، والسلوك الواحد لا يكفي للتشخيص. تُراجع استمرارية الصعوبات وتأثيرها وفي أكثر من بيئة.',en:'Attention, activity and impulse control vary. One behavior is insufficient for diagnosis; persistence, impact and different settings matter.'},support:{ar:'خلّوا التعليمات قصيرة، قسموا المهمة لخطوات وقدموا فترات راحة وروتيناً واضحاً.',en:'Keep instructions brief, break tasks into steps and offer breaks and a predictable routine.'},referral:{ar:'إذا أثرت الصعوبات باستمرار على التعلم أو الحياة اليومية، ناقشوها مع المختص والمدرسة.',en:'Discuss persistent effects on learning or daily life with a professional and school.'},sources:['attention','down']},
 learning:{aliases:['dyslexia','reading','writing','memory','learning','عسر القراءه','قراءه','كتابه','ذاكره','تعلم','يحفظ'],question:{ar:'شنو صعوبات القراءة والتعلم وشلون نساعد؟',en:'What can learning and reading difficulties look like?'},facts:{ar:'عسر القراءة يرتبط بصعوبات القراءة والتهجئة؛ لا يعني انخفاض الذكاء. تختلف صعوبات التعلم عن الإعاقة الذهنية.',en:'Dyslexia involves reading and spelling difficulties; it does not mean low intelligence. Specific learning difficulties differ from intellectual disability.'},support:{ar:'قسموا التعلم لخطوات صغيرة وكرروا بهدوء واستخدموا وسائل واضحة حسب احتياج الطفل.',en:'Use manageable steps, patient repetition and accessible materials suited to the learner.'},referral:{ar:'ناقشوا صعوبة القراءة أو الكتابة المستمرة مع المدرسة ومختص التقييم للحصول على دعم مناسب.',en:'Discuss persistent reading or writing difficulty with school and an assessment professional.'},sources:['reading','intellectual','down']},
 movement:{aliases:['movement','motor','mobility','coordination','cerebral palsy','شلل دماغي','حركيه','جسديه','توازن','مشي','يمشي'],question:{ar:'شلون ندعم الحركة والمشاركة اليومية؟',en:'How can families support movement and daily participation?'},facts:{ar:'قد تختلف الحركة والتوازن والتناسق واحتياجات الدعم كثيراً. صعوبة الحركة وحدها لا تحدد القدرة على الفهم أو التواصل.',en:'Movement, balance, coordination and support needs can differ substantially. Movement difficulty alone does not establish understanding or communication ability.'},support:{ar:'سهّلوا الوصول للأنشطة وأعطوا وقتاً للمشاركة. التمارين والأجهزة المتخصصة يحددها الفريق المعالج.',en:'Make activities accessible and allow time to participate. Specialist exercises and equipment need individual professional guidance.'},referral:{ar:'راجعوا الطبيب عند القلق على النمو الحركي، ولا تعتمدوا برنامج تمارين علاجي من محادثة.',en:'Seek assessment for motor-development concerns; do not use a chat as an individualized exercise prescription.'},sources:['motor']},
 feeding:{aliases:['feeding','eating','food','texture food','اكل','ياكل','الطعام','انتقائي'],question:{ar:'شلون نتعامل مع صعوبات الأكل والانتقائية؟',en:'How can families respond to selective eating?'},facts:{ar:'قد تؤثر الروائح والملمس وشكل الطعام على تقبله. الأكل المحدود يحتاج انتباهاً إذا أثر على الصحة أو النمو.',en:'Smell, texture and presentation may affect food acceptance. Restricted eating needs attention if health or growth is affected.'},support:{ar:'خففوا الضغط أثناء الوجبة، قدموا طعاماً مألوفاً وفرصاً هادئة لاستكشاف الطعام دون إجبار.',en:'Reduce mealtime pressure, offer familiar food and calm opportunities to explore food without force.'},referral:{ar:'اطلبوا تقييماً عند صعوبة البلع أو نقص النمو أو الحمية شديدة المحدودية. الاختناق وصعوبة التنفس يحتاجان مساعدة عاجلة.',en:'Seek assessment for swallowing difficulty, poor growth or a very restricted diet. Choking or breathing difficulty needs urgent help.'},sources:['feeding']},
 sleep:{aliases:['sleep','bedtime','at night','نوم','ينام','يسهر','روتين'],question:{ar:'شلون نساعد على النوم والروتين؟',en:'How can families support sleep and routines?'},facts:{ar:'النوم قد يتأثر بالروتين والبيئة، ولا نفترض أن كل صعوبة سببها الإعاقة.',en:'Sleep can be affected by routines and the environment; difficulties should not automatically be attributed to disability.'},support:{ar:'جربوا روتيناً هادئاً ومتوقعاً قبل النوم وبيئة مريحة، وسجلوا نمط النوم لمناقشته.',en:'Try a calm predictable bedtime routine and comfortable setting; note sleep patterns to discuss.'},referral:{ar:'إذا استمرت المشكلة أو أثرت على الحياة اليومية، ناقشوها مع الطبيب. لا نوصي بأدوية نوم من المحادثة.',en:'Discuss persistent or disruptive sleep problems with a clinician. Sleep medication is not recommended through this chat.'},sources:['sleep']},
 regulation:{aliases:['meltdown','regulation','tantrum','emotion','سلوك','عصبي','انفعال','يبكي','يبجي','social','اجتماعي'],question:{ar:'شلون نفهم الانفعال والتواصل الاجتماعي؟',en:'How can families understand distress and social communication?'},facts:{ar:'قد يزداد الانزعاج عندما تكون البيئة مرهقة أو يصعب التعبير عن الاحتياج. لا نفترض تعمد السلوك أو تشخيصه.',en:'Distress may increase when surroundings are overwhelming or needs are hard to communicate. Do not assume deliberate misbehavior or a diagnosis.'},support:{ar:'خففوا المطالب وقت الضيق، وفروا الهدوء والأمان وراقبوا ما سبق الانفعال.',en:'Reduce demands during distress, offer calm and safety, and notice what preceded it.'},referral:{ar:'استعينوا بمختص إذا كان الضيق متكرراً أو يوجد إيذاء للنفس أو للآخرين؛ الخطر الفوري يحتاج مساعدة عاجلة.',en:'Seek help for recurrent distress or harm to self or others; immediate danger needs urgent assistance.'},sources:['support']},
 hearing:{aliases:['hearing','deaf','ضعف السمع','ضعف سمع','فقدان السمع','صعوبات السمع','صعوبه السمع','سمعيه','اصم','الصمم'],question:{ar:'شلون تؤثر صعوبات السمع على التواصل؟',en:'How can hearing difficulties affect communication?'},facts:{ar:'ضعف السمع قد يؤثر على الوصول للكلام والتعلم والتواصل، ووسيلة التواصل المناسبة تختلف.',en:'Hearing loss can affect access to speech, learning and communication; suitable communication methods vary.'},support:{ar:'قللوا ضوضاء الخلفية وتأكدوا أن طريقة التواصل واضحة ومتاحة للطفل.',en:'Reduce background noise and make communication accessible to the child.'},referral:{ar:'اطلبوا تقييم السمع عند القلق بدلاً من افتراض تجاهل الطفل للكلام.',en:'Ask for hearing assessment rather than assuming a child is ignoring speech.'},sources:['hearing','speech']},
 vision:{aliases:['vision','visual','blind','بصر','بصريه','مكفوف'],question:{ar:'شلون ندعم الطفل مع صعوبات البصر؟',en:'How can families support children with vision difficulties?'},facts:{ar:'صعوبات البصر قد تؤثر على التعلم والتنقل، والدعم يعتمد على التقييم والقدرات الفعلية.',en:'Vision difficulties can affect learning and mobility; support depends on assessment and actual abilities.'},support:{ar:'حافظوا على وضوح وترتيب البيئة وقدموا المعلومات بطرق يمكن للطفل الوصول لها.',en:'Keep the environment predictable and information accessible.'},referral:{ar:'اطلبوا تقييم البصر عند القلق؛ التغير المفاجئ يحتاج مراجعة طبية عاجلة.',en:'Arrange assessment for vision concerns; sudden changes need urgent medical review.'},sources:['vision']},
 development:{aliases:['development','milestone','delay','نمو','نمائي','تطوري','علامات','متاخر'],question:{ar:'متى نطلب تقييماً للنمو؟',en:'When should families seek developmental assessment?'},facts:{ar:'النمو يشمل اللعب والتعلم والكلام والحركة. متابعة المهارات تساعد على ملاحظة القلق لكنها ليست تشخيصاً.',en:'Development includes play, learning, speech and movement. Monitoring skills helps identify concerns but is not a diagnosis.'},support:{ar:'سجلوا المهارات والأسئلة وشاركوها مع المختص، ووفروا فرص لعب وتواصل مناسبة.',en:'Note skills and questions to discuss with a professional, and offer accessible play and communication opportunities.'},referral:{ar:'عند فقدان مهارات مكتسبة أو القلق على النمو تواصلوا مع الطبيب دون انتظار تشخيص من التطبيق.',en:'Contact a clinician for lost skills or developmental concerns rather than waiting for an app diagnosis.'},sources:['development','speech']}
};

// Behavior-specific packs take priority over broad developmental domains.
Object.assign(topics, {
  "staring": {
    "aliases": [
      "يطالع فوق",
      "تطالع فوق",
      "مكان فاضي",
      "مكان فارغ",
      "staring",
      "stares",
      "looks upward",
      "looking up",
      "يحدق",
      "تحدق",
      "يسرح",
      "تسرح"
    ],
    "question": {
      "ar": "ليش الطفل يطالع فوق أو يحدق؟",
      "en": "Why might a child look upward or stare?"
    },
    "facts": {
      "ar": "النظر للأعلى أو التحديق وصف لسلوك، مو تشخيص. بعض الأطفال ينجذبون للضوء أو المثيرات البصرية؛ أما التحديق مع فقدان الاستجابة فقد يحتاج تقييماً طبياً، ولا نقدر نحدد السبب من الوصف وحده.",
      "en": "Looking upward or staring describes a behavior, not a diagnosis. Some children seek visual input such as light. Staring with impaired responsiveness can need medical assessment; this description alone cannot establish the cause."
    },
    "support": {
      "ar": "لاحظوا مدة التحديق وهل يستجيب الطفل لكلامكم المعتاد، وسجلوا ما يحدث قبله وبعده لمناقشته مع الطبيب. خففوا الإضاءة إذا كانت تزعجه.",
      "en": "Note how long staring lasts, whether the child responds to normal communication, and what happens before and after it to discuss with a clinician. Reduce lighting if it is uncomfortable."
    },
    "referral": {
      "ar": "راجعوا الطبيب عند تكرر نوبات التحديق أو تغير الاستجابة. إذا الطفل فاقد الاستجابة الحين أو عنده صعوبة بالتنفس اطلبوا الطوارئ فوراً؛ لا تفترضون أن السبب توحد أو شرود عادي.",
      "en": "Seek medical review for recurring episodes or altered responsiveness. If the child is unresponsive now or has breathing difficulty, seek emergency help immediately; do not assume autism or ordinary distraction."
    },
    "sources": [
      "sensoryNeeds",
      "seizures",
      "urgent"
    ]
  },
  "spinning": {
    "aliases": [
      "يلف حول نفسه",
      "تلف حول نفسها",
      "يدور حول نفسه",
      "تدور حول نفسها",
      "spinning",
      "spins in circles",
      "turns in circles"
    ],
    "question": {
      "ar": "ليش الطفل يلف حول نفسه؟",
      "en": "Why might a child spin in circles?"
    },
    "facts": {
      "ar": "اللف حول النفس قد يوفر إحساساً بالحركة يستمتع به بعض الأطفال، مثل الحركات المتكررة الأخرى. ما يثبت تشخيصاً، والسبب يختلف حسب الموقف.",
      "en": "Spinning may provide movement sensations that some children enjoy, like other repetitive movements. It does not establish a diagnosis; the context matters."
    },
    "support": {
      "ar": "خلّوا المكان آمناً وراقبوا الراحة والتوازن، ووفروا استراحة إذا الطفل منزعج. لا تفرضون اللف كتمرين علاجي.",
      "en": "Keep the surroundings safe, observe comfort and balance, and offer a break if distressed. Do not prescribe spinning as a therapeutic exercise."
    },
    "referral": {
      "ar": "ناقشوا الحركة مع المختص إذا سببت سقوطاً أو إصابة أو ضيقاً أو عطلت المشاركة اليومية. فقدان الاستجابة يحتاج مساعدة عاجلة.",
      "en": "Discuss movements that cause falls, injury, distress or interfere with daily participation with a professional. Loss of responsiveness needs urgent help."
    },
    "sources": [
      "sensoryNeeds",
      "support",
      "urgent"
    ]
  },
  "selfInjury": {
    "aliases": [
      "يعض نفسه",
      "تعض نفسها",
      "يضرب راسه",
      "تضرب راسها",
      "يضرب رأسه",
      "head banging",
      "head-banging",
      "hits his head",
      "hits her head",
      "bites himself",
      "bites herself",
      "self injury",
      "self-injury"
    ],
    "question": {
      "ar": "ليش الطفل يعض نفسه أو يضرب راسه؟",
      "en": "Why might a child bite themselves or bang their head?"
    },
    "facts": {
      "ar": "عض النفس أو ضرب الرأس ممكن يكون مرتبطاً بألم أو انزعاج أو صعوبة بالتعبير عن الاحتياج. ما نقدر نعرف السبب من السلوك وحده، ولا نفترض أنه متعمد أو بسبب إعاقة معينة.",
      "en": "Self-biting or head-banging may relate to pain, distress or difficulty communicating a need. The behavior alone cannot identify the cause; do not assume deliberate misbehavior or a particular disability."
    },
    "support": {
      "ar": "ركزوا على سلامة الطفل وخففوا المطالب والمثيرات المزعجة، وسجلوا متى يحدث وما سبقه. اطلبوا دعماً مهنياً لفهم السبب، ولا تعاقبوا الطفل أو تستخدموا التقييد كحل منزلي.",
      "en": "Focus on safety, reduce demands and distressing input, and note when it happens and what preceded it. Seek professional support to understand the cause; do not use punishment or restraint as a home solution."
    },
    "referral": {
      "ar": "اطلبوا تقييماً إذا تكرر السلوك أو سبب جرحاً. بعد ضربة الرأس، صعوبة البقاء مستيقظاً أو التشنج أو ضعف جديد يحتاج مساعدة طارئة؛ القيء يحتاج تقييماً عاجلاً.",
      "en": "Seek assessment for repeated behavior or injury. After a head impact, difficulty staying awake, a seizure or new weakness needs emergency help; vomiting needs urgent medical assessment."
    },
    "sources": [
      "behaviour",
      "support",
      "headInjury"
    ]
  },
  "letterReversal": {
    "aliases": [
      "الحروف بالعكس",
      "حروف بالعكس",
      "يعكس الحروف",
      "تعكس الحروف",
      "letter reversal",
      "reverses letters",
      "writes letters backwards",
      "mirror writing",
      "الارقام بالعكس"
    ],
    "question": {
      "ar": "ليش الطفل يكتب الحروف بالعكس؟",
      "en": "Why might a child reverse letters?"
    },
    "facts": {
      "ar": "قلب اتجاه الحروف ممكن يصير أثناء تعلم الكتابة. وحده ما يكفي لتشخيص عسر القراءة؛ التقييم ينظر أيضاً للقراءة والتهجئة والتقدم مع التعليم.",
      "en": "Letter reversals can occur while learning to write. Reversal alone is not enough to diagnose dyslexia; assessment also considers reading, spelling and progress with teaching."
    },
    "support": {
      "ar": "استخدموا نموذجاً واضحاً ونقطة بداية وسهماً لاتجاه الحرف، وتدربوا بهدوء لفترات قصيرة بالتنسيق مع المعلم.",
      "en": "Use a clear letter model, a starting point and a direction arrow, with brief calm practice coordinated with the teacher."
    },
    "referral": {
      "ar": "ناقشوا استمرار الصعوبة رغم الدعم مع المدرسة أو مختص التقييم، خصوصاً إذا صاحبها تعثر بالقراءة أو التهجئة.",
      "en": "Discuss persistent difficulty despite support with school or an assessment professional, especially when reading or spelling is also difficult."
    },
    "sources": [
      "reversals",
      "reading"
    ]
  },
  "toeWalking": {
    "aliases": [
      "اطراف اصابعه",
      "اطراف اصابعها",
      "رؤوس اصابعه",
      "روس اصابعه",
      "tiptoe",
      "tip toe",
      "toe walking",
      "toe-walking",
      "walks on toes"
    ],
    "question": {
      "ar": "ليش الطفل يمشي على أطراف أصابعه؟",
      "en": "Why might a child walk on their toes?"
    },
    "facts": {
      "ar": "المشي على أطراف الأصابع له أسباب مختلفة؛ قد يرتبط بنمط مشي معتاد أو الإحساس بالسطح أو مرونة العضلات. لا نقدر نحدد السبب أو نشخص حالة من هذا السلوك.",
      "en": "Toe-walking has different possible reasons, including a habitual gait, sensations from surfaces or muscle flexibility. This behavior cannot establish its cause or a diagnosis."
    },
    "support": {
      "ar": "لاحظوا متى يصير وهل يقدر الطفل ينزل كعبيه براحة، وناقشوا الملاحظات مع الطبيب. لا تجبروا القدم أو تطبقوا تمارين شد أو أجهزة من المحادثة.",
      "en": "Notice when it happens and whether the child can comfortably lower the heels, and discuss observations with a clinician. Do not force the feet or apply stretching exercises or devices from a chat."
    },
    "referral": {
      "ar": "اطلبوا تقييماً إذا استمر المشي على الأصابع أو كان مؤلماً أو ما يقدر الطفل ينزل كعبيه. فقدان مهارة مشي مكتسبة يحتاج مراجعة دون تأخير.",
      "en": "Seek assessment if toe-walking persists, is painful or the child cannot lower the heels. Loss of an acquired walking skill needs prompt review."
    },
    "sources": [
      "toes",
      "development"
    ]
  },
  "motorDelay": {
    "aliases": [
      "يتاخر بالمشي",
      "تتاخر بالمشي",
      "تاخر المشي",
      "تاخر الحركه",
      "delayed walking",
      "late walking",
      "not walking yet",
      "motor delay",
      "late to walk"
    ],
    "question": {
      "ar": "ليش الطفل يتأخر بالمشي أو الحركة؟",
      "en": "Why might walking or movement develop later?"
    },
    "facts": {
      "ar": "تطور المشي والحركة يختلف، وقد تتأثر المهارات بالتناسق أو شد العضلات واحتياجات النمو. التأخر يحتاج النظر لبقية المهارات والفحص؛ لا يثبت وحده شللاً دماغياً أو سبباً محدداً.",
      "en": "Walking and movement develop at different rates; coordination, muscle tone and developmental needs can affect skills. Delay needs consideration of other skills and an examination; it does not establish cerebral palsy or a specific cause."
    },
    "support": {
      "ar": "وفروا فرص حركة آمنة ومناسبة لقدرة الطفل، وسجلوا المهارات والأسئلة للطبيب. لا تستخدموا برنامج تمارين علاجي دون تقييم.",
      "en": "Offer safe movement opportunities suited to the child’s abilities and note skills and questions for the clinician. Do not use an individualized exercise program without assessment."
    },
    "referral": {
      "ar": "تواصلوا مع طبيب الطفل عند القلق على تطور الحركة، وخاصة عند فقدان مهارات مكتسبة. لا تنتظروا تشخيصاً من التطبيق.",
      "en": "Contact the child’s clinician for motor-development concerns, especially lost skills. Do not wait for an app diagnosis."
    },
    "sources": [
      "development",
      "motor",
      "down"
    ]
  },
  "dailyLiving": {
    "aliases": [
      "يلبس",
      "تلبس",
      "dressing",
      "brush teeth",
      "brushing teeth",
      "يغسل اسنانه",
      "تنظيف الاسنان",
      "toileting",
      "الحمام",
      "daily living",
      "self care",
      "self-care"
    ],
    "question": {
      "ar": "شلون ندعم مهارات العناية اليومية؟",
      "en": "How can families support daily living skills?"
    },
    "facts": {
      "ar": "اللبس والنظافة واستخدام الحمام يحتاجون مهارات حركة وفهم وتسلسل، وقد تؤثر الأحاسيس المزعجة على المشاركة. الاحتياج يختلف بين الأطفال ولا يثبت تشخيصاً.",
      "en": "Dressing, hygiene and toileting involve movement, understanding and sequencing; uncomfortable sensations can affect participation. Support needs vary and do not establish a diagnosis."
    },
    "support": {
      "ar": "ورّوا الطفل خطوة بسيطة كل مرة، حافظوا على روتين مريح وخلّوا له وقت للمحاولة مع المساعدة اللازمة. اختاروا أدوات وملابس مريحة.",
      "en": "Demonstrate one manageable step at a time, use a comfortable routine and allow time to try with needed help. Choose comfortable tools and clothing."
    },
    "referral": {
      "ar": "ناقشوا الصعوبات المستمرة أو الألم أو التراجع بالمهارات مع الطبيب أو مختص مناسب. لا تفسروا الألم على أنه مجرد سلوك.",
      "en": "Discuss persistent difficulty, pain or loss of skills with a clinician or appropriate professional. Do not dismiss pain as merely behavior."
    },
    "sources": [
      "down",
      "sensoryNeeds",
      "development"
    ]
  }
} satisfies Record<string,Topic>);
topics.stimming.aliases.push(...["ترفرف","تهز ايديها","يهز ايديه","hand flapping","flaps hands","flaps her hands"]);
topics.sound.aliases.push(...["تصك اذونها","تسكر اذونها","تغطي اذنيها","تغطي اذونها","covers her ears"]);
topics.attention.aliases.push(...["ما يركز","ما تركز","لا يركز","لا تركز","cannot concentrate","cannot focus","can't focus","poor concentration","صعوبه التركيز","التركيز"]);
topics.echolalia.aliases.push(...["تعيد الكلام","يعيد الكلام","repeats phrases","repeating speech","تردد الكلام"]);
topics.communication.aliases.push(...["تتاخر بالكلام","متاخره بالكلام","متاخر بالكلام","تأخر النطق","delayed speech","late talking"]);
topics.eyeContact.aliases.push(...["ما تطالع بعيوني","لا ينظر في عيني","لا تنظر في عيني","avoids eye contact"]);
topics.feeding.aliases.push(...["ترفض الاكل","يرفض الاكل","refuses food","picky eating","selective eating"]);
topics.sleep.aliases.push(...["صعوبه بالنوم","صعوبه النوم","difficulty sleeping","trouble sleeping","ما تنام","ما ينام"]);
topics.sensory.aliases.push(...["تتضايق من لمس","يتضايق من لمس","tactile sensitivity","sensitive to touch"]);
topics.regulation.aliases.push(...["تنفعل","ينهار","تنهار","نوبات غضب","emotional regulation","daily routines"]);
topics.learning.aliases.push(...["نسيان","ينسى","تنسى","remembering","spelling","الكتابه","القراءه"]);
topics.sound.sources=['sensoryNeeds','support','speech'];
topics.sensory.sources=['sensoryNeeds','support'];
topics.attention.facts={ar:'صعوبة التركيز قد ترتبط بصعوبات الانتباه، لكن النوم والقلق وصعوبات التعلم قد تعطي مظاهر مشابهة. السلوك الواحد لا يشخص فرط الحركة؛ الاستمرار والتأثير وفي أكثر من بيئة مهم.',en:'Difficulty focusing may relate to attention difficulties, but sleep problems, anxiety and learning difficulties can look similar. One behavior does not diagnose ADHD; persistence, impact and different settings matter.'};

// Category descriptions stay on the server; only need-based packs go to OpenAI.
export const categories={
 autism:{aliases:['autism','autistic','توحد'],topics:['sensory','communication','regulation'],ar:'التوحد يختلف من شخص لآخر في التواصل والاحتياجات الحسية والروتين؛ لا يُشخّص من سلوك واحد.',en:'Autism varies in communication, sensory needs and routines; a single behavior cannot diagnose it.',sources:['signs','support']},
 down:{aliases:['down syndrome','داون'],topics:['communication','movement','development'],ar:'الأطفال مع متلازمة داون يختلفون في قدراتهم واحتياجاتهم؛ الدعم ينطلق من مهارات الطفل الفعلية.',en:'Children with Down syndrome differ in strengths and support needs; support should start with actual skills.',sources:['down']},
 intellectual:{aliases:['intellectual','ذهنيه','عقليه'],topics:['development','communication'],ar:'الإعاقة الذهنية قد تؤثر على التعلم والمهارات اليومية بدرجات مختلفة، وهي ليست مرادفاً لعسر القراءة.',en:'Intellectual disability can affect learning and everyday skills to different degrees; it is not synonymous with dyslexia.',sources:['intellectual']},
 adhd:{aliases:['adhd','فرط الحركه','فرط حركه','تشتت الانتباه'],topics:['attention','regulation'],ar:'صعوبات الانتباه والنشاط تحتاج تقييماً للسياق والتأثير، وليست دليلاً على سوء التربية.',en:'Attention and activity difficulties need assessment of context and impact, not assumptions about parenting.',sources:['attention']},
 learning:{aliases:['dyslexia','learning disabil','learning difficult','عسر القراءه','صعوبات تعلم','صعوبات التعلم'],topics:['learning'],ar:'صعوبات التعلم المحددة قد تشمل القراءة والكتابة؛ لا تعني تلقائياً إعاقة ذهنية.',en:'Specific learning difficulties can involve reading and writing; they do not automatically mean intellectual disability.',sources:['reading','intellectual']},
 speech:{aliases:['speech disorder','language disorder','speech delay','تاخر الكلام','نطق','لغوي','تخاطب'],topics:['communication'],ar:'الكلام واللغة مجالان مختلفان، وقد يلزم تقييم السمع وفهم اللغة والتعبير.',en:'Speech and language are distinct; assessment may include hearing, understanding and expression.',sources:['speech']},
 hearing:{aliases:['hearing','deaf','سمعيه','ضعف سمع'],topics:['hearing','communication'],ar:'احتياجات التواصل مع ضعف السمع تختلف ولا يمكن تحديدها من وصف قصير.',en:'Communication needs with hearing loss vary and cannot be determined from a short description.',sources:['hearing']},
 vision:{aliases:['visual','vision impairment','blind','بصريه','مكفوف'],topics:['vision'],ar:'ضعف البصر يحتاج دعماً يناسب الرؤية الوظيفية وطرق الوصول للتعلم.',en:'Vision impairment needs support suited to functional vision and access to learning.',sources:['vision']},
 cerebralPalsy:{aliases:['cerebral palsy','شلل دماغي'],topics:['movement'],ar:'الشلل الدماغي يؤثر على الحركة والوضعية، وتختلف الاحتياجات كثيراً بين الأشخاص.',en:'Cerebral palsy affects movement and posture, with widely varying support needs.',sources:['motor']},
 physical:{aliases:['physical disabil','motor disabil','حركيه','جسديه'],topics:['movement'],ar:'الإعاقات الحركية والجسدية متنوعة؛ لا نفترض صعوبة في الفهم بسبب صعوبة الحركة.',en:'Physical and motor disabilities vary; movement difficulties do not establish difficulties with understanding.',sources:['motor']},
 delay:{aliases:['developmental delay','تاخر نمائي','تاخر تطوري'],topics:['development','communication'],ar:'التأخر النمائي وصف لمهارات تحتاج تقييماً وليس سبباً أو تشخيصاً محدداً بحد ذاته.',en:'Developmental delay describes skills needing assessment rather than establishing a specific cause.',sources:['development']},
 multiple:{aliases:['multiple disabil','اعاقات متعدده','اعاقه متعدده','اعاقه مزدوجه'],topics:['development','communication'],ar:'مع الإعاقات المتعددة نركز على الاحتياجات الفعلية وننسق الدعم؛ لا نفترض مزيجاً معيناً من التشخيصات.',en:'With multiple disabilities, focus on actual needs and coordinated support; do not assume a particular combination of diagnoses.',sources:['development','hearing','vision']},
 sensory:{aliases:['sensory processing','sensory differences','معالجه حسيه','اختلافات حسيه'],topics:['sensory'],ar:'الاختلافات الحسية تصف استجابات مختلفة للمحيط ولا تثبت وحدها تشخيصاً.',en:'Sensory differences describe different responses to surroundings, not a diagnosis on their own.',sources:['sensoryNeeds']}
} satisfies Record<string,{aliases:string[];topics:string[];ar:string;en:string;sources:SourceId[]}>;

// Inflected and separated formulations used in ordinary parent questions.
topics.stimming.aliases.push('flap her hands','flap his hands','يرفرف طفلي','ترفرف طفلتي');
topics.spinning.aliases.push('spin in circles','يدور طفلي حول نفسه');
topics.selfInjury.aliases.push('bite herself','bite himself','bang her head','bang his head','يعض طفلي نفسه');
topics.attention.aliases.push('not concentrate','not focus','لا يركز طفلي');
topics.letterReversal.aliases.push('write letters backwards');
topics.toeWalking.aliases.push('walk on toes');

topics.feeding.aliases.push('foods');
topics.eyeContact.aliases.push('لا ينظر في عيني','لا تنظر في عيني');

topics.development.aliases=topics.development.aliases.filter(a=>a!=='علامات');


topics.eyeContact.facts={ar:'بعض الأطفال يجدون النظر المباشر للعيون صعباً أو غير مريح، وقلة التواصل البصري ما تعني بالضرورة أنهم ما يسمعونكم. هذا السلوك وحده ما يشخص أي إعاقة.',en:'Some children find direct eye contact difficult or uncomfortable; less eye contact does not necessarily mean they are not listening. This behavior alone does not diagnose a disability.'};
topics.eyeContact.sources=['communicationSupport','signs'];
topics.echolalia.facts={ar:'قد يكرر الطفل كلاماً سمعه وهو يحتاج وقتاً لفهمه أو معالجته؛ تكرار العبارة لا يعني دائماً أنه فهم معناها. لازم نفهم التواصل في سياقه، والتكرار وحده ما يثبت تشخيصاً.',en:'A child may repeat heard words while needing more time to understand or process them; repeating a phrase does not always mean its meaning is understood. Communication needs to be understood in context, and repetition alone does not establish a diagnosis.'};
topics.echolalia.sources=['communicationSupport','speech'];

// Specific concerns reuse the evidence-only prompt and fallback pipeline.
Object.assign(topics, {
  "haircut": {
    "aliases": [
      "قص شعر",
      "قص الشعر",
      "اقص شعر",
      "يقص شعر",
      "حلاق",
      "haircut",
      "haircuts",
      "hair cutting"
    ],
    "question": {
      "ar": "ليش قص الشعر يضايق بعض الأطفال؟",
      "en": "Why can haircuts be distressing?"
    },
    "facts": {
      "ar": "قص الشعر يجمع لمس الرأس والشعر المتساقط وصوت الأدوات؛ قد تكون مزعجة، وقد يخاف الطفل من الأدوات قربه. هذا وحده ما يثبت تشخيصاً.",
      "en": "Haircuts combine head touch, loose hair and tool sounds; these may feel unpleasant, or tools nearby may feel threatening. This alone establishes no diagnosis."
    },
    "support": {
      "ar": "وضحوا الخطوة القادمة، خففوا الصوت، واتفقوا على عدد قصات قليل ثم استراحة. خلوا الطفل يشوف بالمراية ويختار بين خيارات آمنة مع البالغ.",
      "en": "Explain the next step, reduce noise and agree a small number of snips before a break. Offer a mirror and safe choices with an adult."
    },
    "referral": {
      "ar": "إذا استمر الضيق أو ظهرت حكة أو تهيج متكرر، راجعوا الطبيب؛ لا تفترضون أنه مجرد حساسية حسية.",
      "en": "Seek medical advice for persistent distress or recurrent itching or skin irritation; do not assume it is only sensory."
    },
    "sources": [
      "hairCare",
      "skin"
    ]
  },
  "hairWashing": {
    "aliases": [
      "غسل شعر",
      "غسل الشعر",
      "اغسل شعر",
      "يغسل شعر",
      "غسيل شعر",
      "hair washing",
      "washing hair",
      "wash hair",
      "wash her hair",
      "wash his hair"
    ],
    "question": {
      "ar": "ليش غسل الشعر صعب؟",
      "en": "Why can hair washing be difficult?"
    },
    "facts": {
      "ar": "غسل الشعر قد يزعج بسبب الماء على الوجه أو وضعية الرأس أو إحساس الشامبو. تهيج الجلد من المنتجات احتمال آخر، مو دليل على تشخيص معين.",
      "en": "Hair washing may be uncomfortable because of water on the face, head position or shampoo sensations. Product-related skin irritation is another possibility, not evidence of a particular diagnosis."
    },
    "support": {
      "ar": "جربوا كوب للشطف بعيداً عن الوجه، ووضحوا الخطوات مع استراحات وخيارات مريحة. تجنبوا المنتج اللي يهيج الجلد.",
      "en": "Try a rinse cup keeping water away from the face, explain steps and offer breaks and comfortable choices. Avoid products that irritate the skin."
    },
    "referral": {
      "ar": "إذا استمر الضيق أو ظهرت حكة أو تهيج متكرر، راجعوا الطبيب؛ لا تفترضون أنه مجرد حساسية حسية.",
      "en": "Seek medical advice for persistent distress or recurrent itching or skin irritation; do not assume it is only sensory."
    },
    "sources": [
      "hairWashing",
      "skin"
    ]
  },
  "hairBrushing": {
    "aliases": [
      "تمشيط",
      "امشط",
      "تمشط",
      "يمشط",
      "تسريح الشعر",
      "hair brushing",
      "brush hair",
      "brushing hair",
      "comb hair",
      "combing hair"
    ],
    "question": {
      "ar": "ليش تمشيط الشعر يضايق الطفل؟",
      "en": "Why can hair brushing upset a child?"
    },
    "facts": {
      "ar": "تمشيط الشعر قد يزعج من لمس فروة الرأس أو شد الشعر المتشابك. مو كل رفض سببه اختلاف حسي، ولا يحدد تشخيصاً.",
      "en": "Hair brushing may be unpleasant because of scalp touch or pulling tangled hair. Not every refusal is sensory, and it does not establish a diagnosis."
    },
    "support": {
      "ar": "استخدموا فرشاة مريحة وتمشيطاً لطيفاً، ووضحوا البداية والنهاية وخذوا استراحات. لا تشدون الشعر بالقوة.",
      "en": "Use a comfortable brush and gentle brushing, explain the start and finish and take breaks. Do not pull forcefully."
    },
    "referral": {
      "ar": "إذا استمر الضيق أو ظهرت حكة أو تهيج متكرر، راجعوا الطبيب؛ لا تفترضون أنه مجرد حساسية حسية.",
      "en": "Seek medical advice for persistent distress or recurrent itching or skin irritation; do not assume it is only sensory."
    },
    "sources": [
      "hairCare",
      "hairBrushing",
      "skin"
    ]
  },
  "nailCare": {
    "aliases": [
      "قص اظافر",
      "قص الاظافر",
      "اقص اظافر",
      "تقليم الاظافر",
      "تقليم اظافر",
      "nail cutting",
      "nail clipping",
      "trim nails",
      "cut nails"
    ],
    "question": {
      "ar": "ليش قص الأظافر يضايق الطفل؟",
      "en": "Why can nail cutting be distressing?"
    },
    "facts": {
      "ar": "قص الأظافر يجمع اللمس والضغط والصوت وقرب الأداة؛ قد يحس الطفل بعدم الراحة. وجود ألم أو تهيج يحتاج اهتماماً، مو افتراض تشخيص حسي.",
      "en": "Nail cutting combines touch, pressure, sound and a nearby tool, which may feel uncomfortable. Pain or irritation needs attention rather than an assumed sensory diagnosis."
    },
    "support": {
      "ar": "خلوا الطفل يختار ترتيب الأظافر وعدد قليل ثم توقفوا حسب الاتفاق. استخدموا جلسة ثابتة ومريحة وأدوات يتحكم فيها البالغ.",
      "en": "Let the child choose the nail order and a small number, then stop as agreed. Use a stable comfortable seat with tools controlled by an adult."
    },
    "referral": {
      "ar": "إذا استمر الضيق أو ظهرت حكة أو تهيج متكرر، راجعوا الطبيب؛ لا تفترضون أنه مجرد حساسية حسية.",
      "en": "Seek medical advice for persistent distress or recurrent itching or skin irritation; do not assume it is only sensory."
    },
    "sources": [
      "nailCare",
      "skin"
    ]
  },
  "toothbrushing": {
    "aliases": [
      "تفرش اسنان",
      "يفرش اسنان",
      "تفريش",
      "فرشاة الاسنان",
      "تنظيف الاسنان",
      "يغسل اسنانه",
      "brush teeth",
      "brushing teeth",
      "toothbrushing",
      "tooth brushing"
    ],
    "question": {
      "ar": "ليش تنظيف الأسنان صعب؟",
      "en": "Why can toothbrushing be difficult?"
    },
    "facts": {
      "ar": "تنظيف الأسنان قد يزعج من لمس الفرشاة أو طعم المعجون، وقد يصعب تنسيق الحركة. ألم الأسنان سبب آخر يحتاج فحصاً؛ الرفض مو تشخيص.",
      "en": "Toothbrushing may be difficult because of brush touch, toothpaste taste or coordination. Tooth pain is another reason needing assessment; refusal is not a diagnosis."
    },
    "support": {
      "ar": "جربوا فرشاة ناعمة ومراية وروتين واضح، وساعدوا الطفل حسب حاجته. ناقشوا صعوبة التنظيف المستمرة مع طبيب الأسنان.",
      "en": "Try a soft brush, mirror and predictable routine, helping as needed. Discuss persistent cleaning difficulty with a dentist."
    },
    "referral": {
      "ar": "راجعوا طبيب الأسنان للألم المستمر أو التورم. تورم الفم أو الرقبة مع صعوبة التنفس أو البلع يحتاج طوارئ فوراً.",
      "en": "See a dentist for persistent pain or swelling. Mouth or neck swelling with difficulty breathing or swallowing needs emergency help immediately."
    },
    "sources": [
      "toothbrushing",
      "toothache"
    ]
  },
  "clothing": {
    "aliases": [
      "ملابس",
      "تيكت",
      "بطاقة الملابس",
      "ملصق الملابس",
      "clothing labels",
      "clothing textures",
      "clothes tags",
      "clothing tags",
      "seams"
    ],
    "question": {
      "ar": "ليش ملمس الملابس والتيكت يضايق الطفل؟",
      "en": "Why can clothing textures and labels bother a child?"
    },
    "facts": {
      "ar": "ملمس القماش والخياطة والتيكت قد يزعج اللمس. تهيج الجلد أو الحكة من مواد ملامسة احتمال آخر؛ ما نقدر نحدد السبب من الرفض وحده.",
      "en": "Fabric, seams and labels can feel uncomfortable. Skin irritation or itching from contacting substances is another possibility; refusal alone cannot identify the cause."
    },
    "support": {
      "ar": "خلوا الطفل يختار قماشاً مريحاً، وافحصوا التيكت والخياطة المزعجة. جربوا غسل الملابس الجديدة وتجنبوا المواد المهيجة.",
      "en": "Offer comfortable fabric choices and check irritating labels and seams. Try prewashing new clothing and avoiding irritating products."
    },
    "referral": {
      "ar": "إذا استمر الضيق أو ظهرت حكة أو تهيج متكرر، راجعوا الطبيب؛ لا تفترضون أنه مجرد حساسية حسية.",
      "en": "Seek medical advice for persistent distress or recurrent itching or skin irritation; do not assume it is only sensory."
    },
    "sources": [
      "clothing",
      "skin"
    ]
  },
  "brightLight": {
    "aliases": [
      "الضوء الساطع",
      "ضوء ساطع",
      "الضوء القوي",
      "الليت القوي",
      "ليت قوي",
      "الاضاءة القوية",
      "bright lights",
      "bright light",
      "light sensitivity",
      "حساسية الضوء"
    ],
    "question": {
      "ar": "ليش الضوء القوي يضايق الطفل؟",
      "en": "Why can bright light bother a child?"
    },
    "facts": {
      "ar": "الضوء القوي قد يكون مزعجاً حسياً، لكن ألم العين أو تغير النظر يحتاج تقييماً وما يصح نعتبره مجرد اختلاف حسي. ما نقدر نشخص من هالوصف.",
      "en": "Bright light may feel overwhelming, but eye pain or vision changes need assessment rather than being dismissed as sensory. This description cannot establish a diagnosis."
    },
    "support": {
      "ar": "خففوا الإضاءة المزعجة وخلوا للطفل خيار مكان أريح. لاحظوا متى يصير الانزعاج وناقشوه مع المختص.",
      "en": "Reduce uncomfortable lighting and offer a more comfortable place. Notice when discomfort occurs and discuss it with a professional."
    },
    "referral": {
      "ar": "ألم العين مع حساسية الضوء أو تغير النظر يحتاج فحصاً عاجلاً. فقدان النظر أو إصابة العين يحتاج طوارئ فوراً.",
      "en": "Eye pain with light sensitivity or vision changes needs urgent assessment. Loss of sight or an eye injury needs emergency help immediately."
    },
    "sources": [
      "sensoryNeeds",
      "eyePain"
    ]
  }
});
topics.sound.aliases.push('sounds','noises','loud noises');
topics.sensory.aliases.push('حساس للمس','حساسة للمس');
topics.sound.facts={"ar":"الأصوات العالية قد تزعج الطفل، وبعض الأصوات اليومية قد تبدو أعلى أو تسبب خوفاً. الحساسية للصوت لها أسباب مختلفة وليست وحدها تشخيصاً.","en":"Loud sounds may upset a child, and everyday sounds may seem unusually loud or cause fear. Noise sensitivity has different possible causes and alone is not a diagnosis."};
topics.sound.sources.push('noiseSensitivity');
topics.sensory.sources.push('skin');
topics.sensory.facts={"ar":"اللمس والملمس قد يحسون مزعجين لبعض الأطفال. الحكة أو تهيج الجلد احتمال آخر، فلا نفترض أن كل انزعاج سببه اختلاف حسي أو تشخيص معين.","en":"Touch and textures may feel uncomfortable for some children. Itching or skin irritation is another possibility; not every discomfort implies sensory differences or a particular diagnosis."};
