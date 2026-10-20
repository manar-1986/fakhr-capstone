import schools from './schools.snapshot.json';
import providers from './providers.snapshot.json';
type Normalizer=(text:string)=>string;
const governors=Object.entries(schools.governorateLabels).map(([ar,en])=>({ar,en}));
const areas=[...schools.records.flatMap(r=>r.observations.map(o=>({ar:o.areaAr||'',en:''}))),...providers.records.flatMap(r=>r.branches.map(b=>(b.profile as any).area||{ar:'',en:''}))].filter(p=>p.ar);
function present(text:string,alias:string,n:Normalizer){
 const term=n(alias).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 return !!term&&new RegExp('(?:^|[\\s،,])(?:و|ب|بال)?'+term+'(?=$|[\\s،,.?!؟])','i').test(text);
}
export function extractLocation(text:string,n:Normalizer):{governorate?:string|null;area?:string|null}{
 const out:{governorate?:string|null;area?:string|null}={};
 for(const g of governors){
  if(![g.ar,g.en].some(a=>present(text,a,n)))continue;
  const areaExplicit=[g.ar,g.en].some(a=>text.includes('منطقه '+n(a))||text.includes(n(a)+' area'));
  if(areaExplicit){out.area=g.ar;out.governorate=null;}
  else {out.governorate=g.ar;out.area=null;}
 }
 for(const a of areas){
  if(![a.ar,a.en].filter(Boolean).some(alias=>present(text,alias,n)))continue;
  if(governors.some(g=>n(g.ar)===n(a.ar))&&out.governorate)continue;
  out.area=a.ar;
 }
 return out;
}
// Place names do not determine the language of an otherwise English/Arabic question.
export function withoutKnownPlaces(question:string,n:Normalizer){
 let text=n(question);
 const aliases=[...governors,...areas].flatMap(p=>[p.ar,p.en]).filter(Boolean).sort((a,b)=>b.length-a.length);
 for(const alias of aliases){const place=n(alias);for(const phrase of ['محافظه '+place,'منطقه '+place,place+' governorate',place+' area',place])text=text.split(phrase).join(' ');}
 return text;
}
