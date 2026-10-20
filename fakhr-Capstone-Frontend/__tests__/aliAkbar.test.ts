import { PUBLIC_DOCTORS } from "../constants/approvedDoctors";
import { ALI_AKBAR as doctor } from "../constants/aliAkbar";
import { filterDirectoryDoctors, doctorSpecialtyOptions } from "../utils/doctorSpecialtyFilters";
import { doctorImageAsset } from "../components/directory/DoctorVisuals";
test("Ali Akbar has one identity, bilingual search and all supplied dental categories",()=>{
 expect(PUBLIC_DOCTORS.filter(d=>d.id===doctor.id)).toHaveLength(1);
 for(const id of ['dentistry','pediatric-dentistry','special-needs-dentistry']) {
 expect(doctorSpecialtyOptions().filter(o=>o.key===id)).toHaveLength(1);
 for(const name of [doctor.nameAr,doctor.nameEn]) expect(filterDirectoryDoctors(PUBLIC_DOCTORS,id,name)).toEqual([doctor]);
 }
 expect(doctorImageAsset(doctor)).toMatchObject({fit:'cover'});
 expect(doctor.suppliedSpecializations?.ar).toHaveLength(2);
 expect(doctor.suppliedSpecializations?.en).toHaveLength(2);
});
test("Ali Akbar preserves exact supplied links without inferred phone or address",()=>{
 expect(doctor.clinic?.whatsapp).toEqual({url:'https://wa.link/w6qo4o'});
 expect(doctor.clinic?.instagram).toBe('https://www.instagram.com/bayandental/');
 expect(doctor.clinic?.mapUrl).toBe('https://maps.app.goo.gl/ToHzMwuhZRprinyH7?g_st=ic');
 expect(doctor.clinic?.phone).toBeUndefined();
 expect(doctor.clinic?.address).toBeUndefined();
});
