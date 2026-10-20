import { PUBLIC_DOCTORS } from "../constants/approvedDoctors";
import { MAITHAM_AL_ALI as doctor } from "../constants/maithamAlAli";
import { filterDirectoryDoctors, doctorSpecialtyOptions } from "../utils/doctorSpecialtyFilters";
import { doctorImageAsset } from "../components/directory/DoctorVisuals";
test("Maitham has one identity, ophthalmology filtering and bilingual search",()=>{
 expect(PUBLIC_DOCTORS.filter(d=>d.id===doctor.id)).toHaveLength(1);
 expect(doctorSpecialtyOptions().filter(o=>o.key==='ophthalmology')).toHaveLength(1);
 for(const name of [doctor.nameAr,doctor.nameEn]) expect(filterDirectoryDoctors(PUBLIC_DOCTORS,'ophthalmology',name)).toEqual([doctor]);
 expect(doctorImageAsset(doctor)).toMatchObject({fit:'cover'});
});
test("Only the three supplied services and exact location are present",()=>{
 expect(doctor.suppliedSpecializations?.ar).toEqual(['فحص وعلاج مشاكل العيون لدى الأطفال.','فحص وعلاج مشاكل العيون لدى الأطفال ذوي الاحتياجات الخاصة.','علاج طول النظر وقصر النظر لدى الأطفال.']);
 expect(doctor.suppliedSpecializations?.en).toEqual(['Eye examinations and treatment for children.','Eye examinations and treatment for children with special needs.','Treatment of farsightedness and nearsightedness in children.']);
 expect(doctor.clinic).toEqual({nameAr:doctor.nameAr,nameEn:doctor.nameEn,mapUrl:'https://maps.app.goo.gl/3UyMZJrF6b7XvqsM9'});
});
