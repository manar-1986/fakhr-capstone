import catalog from "../data/institutions/catalog.json";
import {INSTITUTIONS,findInstitution,filterInstitutions} from "../utils/institutionDirectory";
import {isPublicCenter,isListedCenter,doctorOnlyCenterNames} from "../utils/centerVisibility";
test("hide only international Nibras from listings, preserving both original records and details",()=>{
 const selected=findInstitution("kw-s-nebras-special")!;const hidden=findInstitution("kw-s-nebras-int")!;
 for(const item of [selected,hidden])expect(item).toEqual(catalog.institutions.find(i=>i.id===item.id));
 expect(filterInstitutions(INSTITUTIONS,{search:"النبراس"})).toEqual([selected]);
 expect(filterInstitutions(INSTITUTIONS,{search:hidden.nameAr})).toEqual([]);
 expect(isPublicCenter({...hidden,nameEn:undefined})).toBe(true);
 expect(isListedCenter({...hidden,nameEn:undefined})).toBe(false);
 expect(filterInstitutions([{...hidden,nameEn:"Al Nibras International Bilingual School"}],{search:"Nibras"})).toEqual([]);
 const previouslyListed=INSTITUTIONS.filter(i=>isPublicCenter({...i,nameEn:i.nameEn||undefined}) && i.id!=="center-blue-wing" && ![i.nameAr,i.nameEn].some(name=>!!name&&doctorOnlyCenterNames.some(pattern=>pattern.test(name))));
 expect(previouslyListed.filter(i=>[selected.id,hidden.id].includes(i.id)).filter(i=>!isListedCenter({...i,nameEn:i.nameEn||undefined})).map(i=>i.id)).toEqual([hidden.id]);
});
