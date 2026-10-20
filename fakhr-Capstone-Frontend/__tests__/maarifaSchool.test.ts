import catalog from "../data/institutions/catalog.json";
import { INSTITUTIONS, findInstitution, filterInstitutions } from "../utils/institutionDirectory";
import { MAARIFA_ID, MAARIFA_SOURCE_IDS, unifyMaarifaSchools } from "../utils/maarifaSchool";
import type { Institution } from "../types/institution";
test("unifies only Maarifa public cards while preserving both branch source records",()=>{
 const source=catalog.institutions as Institution[];const snapshot=JSON.stringify(source);const result=unifyMaarifaSchools(source);expect(JSON.stringify(source)).toBe(snapshot);
 expect(result).toHaveLength(source.length-1);expect(result.filter(i=>!i.branches)).toEqual(source.filter(i=>!MAARIFA_SOURCE_IDS.includes(i.id)));
 const school=findInstitution(MAARIFA_ID)!;expect(school.branches).toEqual(MAARIFA_SOURCE_IDS.map(id=>source.find(i=>i.id===id)));expect(school.observations).toHaveLength(4);
 expect(school.nameAr).toBe("مدرسة المعرفة النموذجية");expect(school.nameEn).toBe("Al Maarifa Model School");
 for(const search of ["المعرفة","Al Maarifa"])expect(filterInstitutions(INSTITUTIONS,{search})).toEqual([school]);
 for(const id of MAARIFA_SOURCE_IDS){expect(INSTITUTIONS.some(i=>i.id===id)).toBe(false);expect(findInstitution(id)).toBe(school);}
});
