import catalog from "../data/institutions/catalog.json";
import { INSTITUTIONS, findInstitution, filterInstitutions } from "../utils/institutionDirectory";
import { isPublicCenter } from "../utils/centerVisibility";
test("hide only Future girls while retaining both records and unchanged original",()=>{
 const girls=INSTITUTIONS.find(i=>i.id==="kw-s-future-girls")!;
 const original=findInstitution("kw-s-future")!;
 expect(girls.nameAr).toBe("مدرسة المستقبل ثنائية اللغة الخاصة - بنات");
 expect(girls).toEqual(catalog.institutions.find(i=>i.id===girls.id));
 expect(original).toEqual(catalog.institutions.find(i=>i.id===original.id));
 expect(findInstitution(girls.id)).toBeUndefined();
 for(const search of ["", "المستقبل", "Future", "بنات"]){expect(filterInstitutions(INSTITUTIONS,{search})).not.toContain(girls);}
 expect(filterInstitutions(INSTITUTIONS,{search:"Future Bilingual School"})).toEqual([original]);
 expect(filterInstitutions(INSTITUTIONS,{search:"مدرسة المستقبل ثنائية اللغة الخاصة"})).toEqual([original]);
 expect(isPublicCenter({name:girls.nameAr})).toBe(false);
 expect(isPublicCenter({name:original.nameAr})).toBe(true);
 expect(isPublicCenter({name:"مدرسة أجيال المستقبل الأهلية (عربية)"})).toBe(true);
});
