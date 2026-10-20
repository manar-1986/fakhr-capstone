import { isPublicCenter } from "../utils/centerVisibility";
import { BILINGUAL_CENTERS } from "../constants/directoryBilingual";
import { LEGACY_INSTITUTIONS, findInstitution, filterInstitutions } from "../utils/institutionDirectory";
test("only the explicitly requested centers are deactivated and their records remain intact",()=>{
 const record=BILINGUAL_CENTERS.find(c=>c.id==="center-khatwa")!;
 expect(record.isActive).toBe(false);expect(record.nameAr).toBe("مركز خطوة للتأهيل");
 expect(BILINGUAL_CENTERS.filter(c=>!isPublicCenter(c)).map(c=>c.id)).toEqual(["center-khatwa","center-kayan","center-funoon","center-child-dev","center-amal","center-noor","center-bidaya"]);
 for(const id of ["center-khatwa","center-kayan","center-funoon","center-child-dev","center-amal","center-noor","center-bidaya"]) {expect(BILINGUAL_CENTERS.find(c=>c.id===id)?.isActive).toBe(false);expect(findInstitution(id)).toBeUndefined();}
 expect(LEGACY_INSTITUTIONS.some(c=>c.id===record.id)).toBe(false);expect(findInstitution(record.id)).toBeUndefined();
});
test.each(["مركز خطوة للتأهيل","مركز خطوه للتاهيل","Khatwa Rehabilitation Center","Khutwa Rehabilitation Center","Khotwa Rehabilitation Centre","مركز االخطوه للتاهيل","مركز الخطوة للتأهيل","Al Khatwa Rehabilitation Center","Al-Khutwa Rehabilitation Centre","مركز فنون","Funoon Center","مركز تنمية الطفل","Child Development Center","مركز كيان","Kayan Center","Kayaan Centre","مركز الأمل للتنمية","مركز الامل للتنميه","Al Amal Development Center","Al-Amal Development Centre","مركز نور الحياة","Noor Al Hayat Center","Nour Al-Hayat Centre","مركز بداية","مركز بدايه","Bidaya Center","Bedayah Centre"])("blocks API spelling %s and cached results",name=>{
 expect(isPublicCenter({id:"remote-id",name})).toBe(false);
 const cached={...LEGACY_INSTITUTIONS[0],id:"backend:remote-id",nameAr:name};
 expect(filterInstitutions([cached],{})).toEqual([]);
});
test("does not suppress similarly named unrelated centers",()=>{
 expect(isPublicCenter({name:"Khatwa Children's Services"})).toBe(true);
 expect(isPublicCenter({nameAr:"مركز خطوات للتأهيل"})).toBe(true);
 expect(isPublicCenter({name:"Child Development Services"})).toBe(true);
});

test("other institutions retain public visibility",()=>{ for(const item of LEGACY_INSTITUTIONS) expect(isPublicCenter(item)).toBe(true); expect(isPublicCenter({id:"center-blue-wing",name:"Blue Wing Center"})).toBe(true); expect(isPublicCenter({nameAr:"مدرسة الأمل الشاملة"})).toBe(true); });
