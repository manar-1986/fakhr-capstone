import catalog from "../data/institutions/catalog.json";
import {INSTITUTIONS,findInstitution,filterInstitutions} from "../utils/institutionDirectory";
import {isListedCenter} from "../utils/centerVisibility";
const id="kw-s-jahra-academy";
test("hide exact Jahra Academy ID while preserving its stored record",()=>{
 const source=catalog.institutions.find(i=>i.id===id)!;
 expect(source.nameAr).toBe("أكاديمية الجهراء ثنائية اللغة الخاصة");
 expect(findInstitution(id)).toEqual(source);
 expect(INSTITUTIONS.filter(i=>i.id===id)).toHaveLength(1);
 expect(filterInstitutions(INSTITUTIONS,{}).some(i=>i.id===id)).toBe(false);
 for(const search of [source.nameAr,"الجهراء","Jahra Bilingual Academy"]){
  expect(filterInstitutions([{...source,nameEn:"Jahra Bilingual Academy"}] as any,{search})).toEqual([]);
 }
 expect(isListedCenter({id:"backend:"+id})).toBe(false);
 // Similar names and other Jahra institutions must not be suppressed.
 expect(isListedCenter({id:"another-school",nameAr:source.nameAr})).toBe(true);
 expect(isListedCenter({id:"kw-r-day-hawalli",nameAr:"الجمعية الكويتية لرعاية المعاقين"})).toBe(true);
});
