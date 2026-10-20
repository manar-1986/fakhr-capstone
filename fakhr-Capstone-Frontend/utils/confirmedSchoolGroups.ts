import type { Institution } from "../types/institution";
export const CONFIRMED_SCHOOL_GROUPS = [
 {ids:["kw-n-insan-1","kw-n-insan-2"],ar:"حضانة إنسان لذوي الاحتياجات الخاصة",en:"Insan Nursery for Special Needs"},
 {ids:["kw-n-maha","kw-n-maha-2"],ar:"حضانة المها لذوي الاحتياجات الخاصة",en:"Al Maha Nursery for Special Needs"},
 {ids:["kw-n-heba","kw-n-heba-2"],ar:"حضانة الهبة لذوي الاحتياجات الخاصة",en:null},
 {ids:["kw-n-nasser","kw-n-nasser-2","kw-n-nasser-3"],ar:"حضانة بيت ناصر",en:"Bait Nasser Nursery"},
 {ids:["kw-r-integrated","kw-r-integrated-2"],ar:"مؤسسة الرعاية المتكاملة",en:"Integrated Care Institution"},
 {ids:["kw-s-riyada-boys","kw-s-riyada-girls"],ar:"مدرسة الريادة النموذجية",en:"Al Reyada Model School"},
 {ids:["kw-s-modern-girls","kw-s-modern-boys"],ar:"مدرسة الكويت الأهلية الحديثة",en:"Modern Kuwait Private School"},
];
export function canonicalSchoolId(id: string): string {
 return CONFIRMED_SCHOOL_GROUPS.find(group=>group.ids.includes(id))?.ids[0] || id;
}
/** Public grouping only. Keep original branch objects and source records intact. */
export function consolidateConfirmedSchools(items: Institution[]): Institution[] {
 let result=items;
 for(const group of CONFIRMED_SCHOOL_GROUPS){
  const branches=group.ids.map(id=>items.find(item=>item.id===id));
  if(branches.some(item=>!item))continue;
  const records=branches as Institution[];
  const primary=records[0];
  const commonPhone=primary.observations.flatMap(o=>o.phones).find(phone=>records.every(record=>record.observations.some(o=>o.phones.includes(phone))));
  const unified:Institution={...primary,nameAr:group.ar,nameEn:group.en ?? primary.nameEn,
   publicProfile:{...primary.publicProfile,phone:primary.publicProfile?.phone || primary.publicContact?.phone || commonPhone},
   mainImage:records.find(item=>item.mainImage)?.mainImage,
   identityAliases:[...new Set(records.flatMap(item=>[item.nameAr,item.nameEn||"",...(item.identityAliases||[]) ]).filter(Boolean))],
   observations:records.flatMap(item=>item.observations),
   stageTags:[...new Set(records.flatMap(item=>item.stageTags))],
   disabilityTags:[...new Set(records.flatMap(item=>item.disabilityTags))],
   branches:records,
  };
  if (primary.id === "kw-n-insan-1") {
   unified.mainImage="insan";
   unified.publicProfile={...unified.publicProfile,phone:"52226632",instagram:"https://www.instagram.com/insan_kuw/",instagramLabel:{ar:"إنستقرام",en:"Instagram"},branchLocations:[
    {branchId:"kw-n-insan-1",name:{ar:"الفنطاس",en:"Fintas"},address:{ar:"الفنطاس الزراعي، قطعة 4، شارع 2، منزل 291",en:"Fintas Agricultural, Block 4, Street 2, House 291"},mapUrl:"https://maps.app.goo.gl/SBwhg6hjmAsMGnmh8"},
    {branchId:"kw-n-insan-2",name:{ar:"صباح الأحمد",en:"Sabah Al Ahmad"},address:{ar:"صباح الأحمد، قطعة D4، شارع 427، قسيمة 394، منزل 18",en:"Sabah Al Ahmad, Block D4, Street 427, Plot 394, House 18"},mapUrl:"https://maps.app.goo.gl/PDFoXyqmrarNgdE5A"}
   ]};
  }
  if (primary.id === "kw-n-maha") {
   const phones=[...new Set(records.flatMap(record=>record.observations.flatMap(o=>o.phones)))];
   unified.mainImage="almaha";
   const note={ar:"تعيين الواتساب للفرع مقدم من المستخدم ويختلف عن ارتباط الهاتف بالعنوان في المصادر؛ يحتاج إلى تحقق.",en:"WhatsApp branch assignment supplied by the user differs from the source phone-to-address association; verification needed."};
   unified.publicProfile={...unified.publicProfile,phone:phones[0],extraPhones:phones.slice(1).map(phone=>({phone,label:records[1].observations.some(o=>o.phones.includes(phone))?{ar:"قطعة 8 — حسب المصادر",en:"Block 8 — source record"}:{ar:"قطعة 4 — حسب المصادر",en:"Block 4 — source record"}})),
    branchLocations:[
     {branchId:"kw-n-maha-2",name:{ar:"الفنيطيس، قطعة 8",en:"Funaitees, Block 8"},address:{ar:"فنيطيس، قطعة 8، شارع 815، منزل 114",en:"Funaitees, Block 8, Street 815, House 114"},whatsapp:{phone:"+96550999405",url:"https://wa.me/96550999405"},verificationNote:note},
     {branchId:"kw-n-maha",name:{ar:"الفنيطيس، قطعة 4",en:"Funaitees, Block 4"},address:{ar:"فنيطيس، قطعة 4، شارع 407، منزل 354",en:"Funaitees, Block 4, Street 407, House 354"},whatsapp:{phone:"+96560484449",url:"https://wa.me/96560484449"},verificationNote:{ar:note.ar+" رابط الموقع المقدم يشير إلى قسيمة 354 / منزل 59، وليس منزل 354؛ لم يتم تفعيل زر الموقع.",en:note.en+" The supplied location refers to plot 354 / house 59, rather than house 354; no Location button is enabled."}},
    ]};
  }
  if (primary.id === "kw-n-heba") {
   unified.mainImage = "alheba";
   const phones = [...new Set(records.flatMap(record=>record.observations.flatMap(o=>o.phones)))];
   unified.publicProfile = {...unified.publicProfile,
    instagram:"https://www.instagram.com/alheba_nursery/",instagramLabel:{ar:"إنستقرام",en:"Instagram"},
    branchLocations:[
     {branchId:"kw-n-heba",name:{ar:"مبارك الكبير",en:"Mubarak Al-Kabeer"},mapUrl:"https://kwfinder.page.link/13XZn",whatsapp:{phone:"+96597446577",url:"https://wa.me/96597446577"}},
     {branchId:"kw-n-heba-2",name:{ar:"الأندلس",en:"Al Andalus"},mapUrl:"https://kwfinder.page.link/Mpj8M",whatsapp:{phone:"+96551142276",url:"https://wa.me/96551142276"}},
    ],phone:phones[0],extraPhones:phones.slice(1).map(phone=>({phone,
    label:records[1].observations.some(o=>o.phones.includes(phone)) ? {ar:"الأندلس",en:"Andalus"} : {ar:"عبد الله المبارك",en:"Abdullah Al Mubarak"}}))};
  }
  if (primary.id === "kw-n-nasser") {
   const phones = [...new Set(records.flatMap(record => record.observations.flatMap(o => o.phones)))];
   const labels = [{ar:"النسيم",en:"Al Naseem"},{ar:"جابر الأحمد",en:"Jaber Al Ahmad"},{ar:"غرب عبد الله المبارك",en:"West Abdullah Al Mubarak"}];
   unified.mainImage = "baitnasser";
   unified.publicProfile = {...unified.publicProfile, phone:phones[0],
    extraPhones:phones.slice(1).map(phone=>({phone,label:records.every(r=>r.observations.some(o=>o.phones.includes(phone)))
     ? {ar:"رقم مشترك بين السجلات الثلاثة",en:"Shared by all three records"}
     : labels[records.findIndex(r=>r.observations.some(o=>o.phones.includes(phone)))]})),
    branchLocations:[
     {branchId:"kw-n-nasser",name:{ar:"النسيم",en:"Al Naseem"},mapUrl:"https://maps.app.goo.gl/et9tdWmXJTQXBtsZ9"},
     {branchId:"kw-n-nasser-2",name:{ar:"جابر الأحمد",en:"Jaber Al Ahmad"},mapUrl:"https://maps.app.goo.gl/FrMyArr6fREqscKd7"},
     {branchId:"kw-n-nasser-3",name:{ar:"غرب عبدالله المبارك",en:"West Abdullah Al Mubarak"},mapUrl:"https://maps.app.goo.gl/AkZ2cNjhLStsPBFt5"},
    ],
    instagram:"https://www.instagram.com/bnkuw/",instagramLabel:{ar:"إنستقرام",en:"Instagram"},
   };
  }
  if (primary.id === "kw-r-integrated") {
   // User-confirmed grouping. Keep both source records as branches, with one shared contact card.
   const phones = [...new Set(records.flatMap(record => [record.publicProfile?.phone, record.publicContact?.phone,
    record.publicProfile?.additionalPhone, ...(record.publicProfile?.extraPhones || []).map(contact => contact.phone),
    ...record.observations.flatMap(observation => observation.phones)].filter((phone): phone is string => !!phone)))];
   unified.publicProfile = {...unified.publicProfile, phone:phones[0],
    extraPhones:phones.slice(1).map(phone=>({phone,label:records[1].observations.some(o=>o.phones.includes(phone))
     ? {ar:"فرع المهبولة",en:"Mahboula branch"} : {ar:"فرع غرناطة",en:"Granada branch"}})),
    email:primary.publicProfile?.email || primary.sourceExtras?.email,
   };
  }
  if (primary.id === "kw-s-riyada-boys") {
   unified.mainImage = "reyada";
   unified.publicProfile = {...unified.publicProfile,
    instagram: "https://www.instagram.com/alreyadamodelschool/",
    instagramLabel: {ar:"إنستقرام",en:"Instagram"},
    mapUrl: "https://maps.app.goo.gl/RRBM2qRsMnvSdspA7",
   };
  }
  if (primary.id === "kw-s-modern-girls") {
   unified.mainImage = "modernkuwait";
   unified.publicProfile = {...unified.publicProfile, mapUrl: "https://maps.app.goo.gl/3cBbTGinUniwbadL7"};
  }
  result=result.flatMap(item=>item.id===primary.id?[unified]:group.ids.includes(item.id)?[]:[item]);
 }
 return result;
}
