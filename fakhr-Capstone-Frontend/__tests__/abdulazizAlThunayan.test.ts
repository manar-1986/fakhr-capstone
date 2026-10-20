import { PUBLIC_DOCTORS } from "../constants/approvedDoctors";
import { ABDULAZIZ_AL_THUNAYAN as doctor } from "../constants/abdulazizAlThunayan";
import { filterDirectoryDoctors, doctorSpecialtyOptions } from "../utils/doctorSpecialtyFilters";
import { doctorImageAsset } from "../components/directory/DoctorVisuals";
import { directoryPhoneUrl } from "../utils/directoryCall";
test("Abdulaziz has one identity, bilingual search and all dental filters",()=>{
 expect(PUBLIC_DOCTORS.filter(d=>d.id===doctor.id)).toHaveLength(1);
 for(const id of ['dentistry','pediatric-dentistry','special-needs-dentistry']) {
 expect(doctorSpecialtyOptions().filter(o=>o.key===id)).toHaveLength(1);
 for(const name of [doctor.nameAr,doctor.nameEn]) expect(filterDirectoryDoctors(PUBLIC_DOCTORS,id,name)).toEqual([doctor]);
 }
 expect(doctorImageAsset(doctor)).toMatchObject({fit:'cover'});
});
test("Abdulaziz uses only supplied contacts",()=>{
 expect(directoryPhoneUrl(doctor.clinic?.phone)).toBe('tel:+96522070888');
 expect(doctor.clinic?.whatsapp).toEqual({phone:'+96569693010',url:'https://wa.me/96569693010'});
 expect(doctor.clinic?.instagram).toBe('https://www.instagram.com/icondentalcenter.kw/');
 expect(doctor.clinic?.website).toBe('https://iconkw.co/');
 expect(doctor.clinic?.mapUrl).toBe('https://maps.app.goo.gl/WkgqUaS32eN7YoVi9');
 expect(doctor.clinic?.address).toBeUndefined();expect(doctor.suppliedQualifications).toBeUndefined();
});
