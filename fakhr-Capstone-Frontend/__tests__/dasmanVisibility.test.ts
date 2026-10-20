import catalog from "../data/institutions/catalog.json";
import { INSTITUTIONS, findInstitution, filterInstitutions } from "../utils/institutionDirectory";
import { isPublicCenter, isListedCenter } from "../utils/centerVisibility";
test("only exact Dasman duplicate is hidden; original and source records are retained",()=>{
 const duplicate=INSTITUTIONS.find(i=>i.id==="kw-s-dasman-2")!;
 const original=INSTITUTIONS.find(i=>i.id==="kw-s-dasman-1")!;
 expect(duplicate.nameAr).toBe("مدرسة دسمان ثنائية اللغة الخاصة (2)");
 expect(duplicate.observations).toHaveLength(2);
 expect(original).toEqual(catalog.institutions.find(i=>i.id===original.id));
 expect(findInstitution(duplicate.id)).toBeUndefined();expect(findInstitution(original.id)).toBe(original);
 expect(isListedCenter({...duplicate,nameEn:duplicate.nameEn||undefined})).toBe(false);
 expect(isPublicCenter({name:"مدرسة دسمان ثنائية اللغة الخاصة (2)"})).toBe(false);
 for(const name of ["مدرسة دسمان ثنائية اللغة","Dasman Bilingual School","مدرسة دسمان ثنائية اللغة الخاصة (1)"])expect(isPublicCenter({name})).toBe(true);
 for(const search of ["", "دسمان", "مدرسة دسمان ثنائية اللغة الخاصة (2)", "Dasman"]){expect(filterInstitutions(INSTITUTIONS,{search})).not.toContain(duplicate);}
 expect(filterInstitutions(INSTITUTIONS,{search:"دسمان"})).toContain(original);
 expect(filterInstitutions([{...duplicate,nameEn:"Dasman Bilingual School (2)"}],{search:"Dasman"})).toEqual([]);
});

test("original Dasman has supplied profile while duplicate remains hidden",()=>{
 const school=findInstitution("kw-s-dasman-1")!;
 expect(school.publicProfile?.phone).toBe("+96522277377");expect(school.publicProfile?.phoneExtension).toBe("101");
 expect(school.publicProfile?.services?.ar).toHaveLength(7);expect(school.publicProfile?.services?.en).toHaveLength(7);
 expect(school.publicProfile?.whatsapp).toBeUndefined();expect(school.mainImage).toBe("dasman");
 expect(filterInstitutions(INSTITUTIONS,{search:"Dasman"})).toEqual([school]);
});
