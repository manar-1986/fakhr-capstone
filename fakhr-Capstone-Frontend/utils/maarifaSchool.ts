import type { Institution } from "../types/institution";
export const MAARIFA_ID = "kw-s-maarifa";
export const MAARIFA_SOURCE_IDS = ["kw-s-marifa-girls", "kw-s-marifa-boys"];
/** Public projection only: retain the original records and branch observations unchanged. */
export function unifyMaarifaSchools(items: Institution[]): Institution[] {
 const sources=MAARIFA_SOURCE_IDS.map(id=>items.find(item=>item.id===id)).filter((item): item is Institution=>!!item);
 if(sources.length!==2)return items;
 const first=sources[0];
 const unified: Institution={...first,mainImage:"maarifa",publicProfile:{...first.publicProfile,instagram:"https://www.instagram.com/al_marefa_b_s/"},id:MAARIFA_ID,nameAr:"مدرسة المعرفة النموذجية",nameEn:"Al Maarifa Model School",identityAliases:[...sources.map(i=>i.nameAr),"Al Maarifa"],observations:sources.flatMap(i=>i.observations),reviewNotesAr:sources.flatMap(i=>i.reviewNotesAr),stageTags:[...new Set(sources.flatMap(i=>i.stageTags))],disabilityTags:[...new Set(sources.flatMap(i=>i.disabilityTags))],branches:sources};
 return items.flatMap(item=>item.id===first.id?[unified]:MAARIFA_SOURCE_IDS.includes(item.id)?[]:[item]);
}

const branchEnglish: Record<string, string> = {
  "المنقف: قطعة 55": "Mangaf, Block 55",
  "المنقف: قطعة 63": "Mangaf, Block 63",
  "المنقف – قطعة 4 – شارع 21": "Mangaf, Block 4, Street 21",
  "رياض أطفال + ابتدائي (مختلط)؛ متوسط + ثانوي (بنات)": "Kindergarten and primary (coeducational); middle and secondary (girls)",
  "روضة وابتدائي (مختلط)؛ متوسط وثانوي (بنات)": "Kindergarten and primary (coeducational); middle and secondary (girls)",
  "متوسط + ثانوي (بنين)": "Middle and secondary (boys)",
  "متوسط وثانوي (بنين)": "Middle and secondary (boys)",
  "دمج؛ احتياجات": "Inclusive education; special needs",
  "دمج": "Inclusive education",
  "احتياجات خاصة": "Special needs"
};
export function maarifaBranchText(value: string, isRTL: boolean): string {
  return isRTL ? value : branchEnglish[value] || value;
}
