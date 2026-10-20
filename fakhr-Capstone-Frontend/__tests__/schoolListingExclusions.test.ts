import catalog from "../data/institutions/catalog.json";
import {INSTITUTIONS,findInstitution,filterInstitutions,institutionDirectoryCategory} from "../utils/institutionDirectory";
import {isListedCenter} from "../utils/centerVisibility";
const ids=["kw-r-day-jahra","kw-r-day-ahmadi","kw-r-umm-qura","kw-s-tarbiya","kw-s-gulf-american"];
const english=["Day Care Center Jahra Branch","Day Care Center Ahmadi Branch","Umm Al Qura Rehabilitation Center","Al Tarbiya Model Private Bilingual School","Gulf American Bilingual Private School"];
test("only the five exact IDs are excluded; source data and detail access remain intact",()=>{
 const snapshot=JSON.stringify(catalog);
 const schools=INSTITUTIONS.filter(i=>institutionDirectoryCategory(i)==="school");
 const before=schools.filter(i=>isListedCenter({...i,id:ids.includes(i.id)?"visibility-baseline":i.id,nameEn:i.nameEn||undefined}));
 expect(filterInstitutions(schools,{})).toEqual(before.filter(i=>!ids.includes(i.id)));
 for(const [index,id] of ids.entries()){
  const source=catalog.institutions.find(i=>i.id===id)!;expect(source).toBeTruthy();expect(findInstitution(id)).toEqual(source);
  expect(INSTITUTIONS.filter(i=>i.id===id)).toHaveLength(1);
  for(const search of [source.nameAr,english[index]])expect(filterInstitutions([{...source,nameEn:english[index]}] as any,{search})).toEqual([]);
  expect(isListedCenter({id})).toBe(false);expect(isListedCenter({id:"backend:"+id})).toBe(false);expect(isListedCenter({id:"api-record",canonicalId:id})).toBe(false);
  expect(isListedCenter({id:"different-record",nameAr:source.nameAr})).toBe(true);
 }
 for(const id of ["kw-r-day-hawalli","kw-s-umm-qura","kw-s-gulf","kw-r-integrated","kw-r-dyslexia"])expect(isListedCenter({id})).toBe(true);
 expect(JSON.stringify(catalog)).toBe(snapshot);
});
