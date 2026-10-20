import { PUBLIC_DOCTORS } from "../constants/approvedDoctors";
import { NOHA_AL_MUFARREH as doctor } from "../constants/nohaAlMufarreh";
import { filterDirectoryDoctors, doctorSpecialtyOptions } from "../utils/doctorSpecialtyFilters";
import { doctorImageAsset } from "../components/directory/DoctorVisuals";
import { directoryPhoneUrl } from "../utils/directoryCall";
test("Noha has one specialist identity, bilingual search and learning difficulties filter",()=>{
 expect(PUBLIC_DOCTORS.filter(d=>d.id===doctor.id)).toHaveLength(1);
 expect(doctorSpecialtyOptions().filter(o=>o.key===doctor.group)).toHaveLength(1);
 for(const name of [doctor.nameAr,doctor.nameEn]) expect(filterDirectoryDoctors(PUBLIC_DOCTORS,doctor.group,name)).toEqual([doctor]);
 expect(doctorImageAsset(doctor)).toMatchObject({fit:'cover'});
 expect(doctor.suppliedSpecializations?.en).toEqual(['Reading and Writing Learning Difficulties']);
});
test("Noha contacts belong to KCLD and retain exact supplied URLs",()=>{
 expect(doctor.clinic?.nameEn).toBe('Kuwait Center for Learning Difficulties (KCLD)');
 expect(directoryPhoneUrl(doctor.clinic?.phone)).toBe('tel:+96522233696');
 expect(directoryPhoneUrl(doctor.clinic?.additionalPhone)).toBe('tel:+96555975385');
 expect(doctor.clinic?.whatsapp?.url).toBe('https://wa.me/96555269262');
 expect(doctor.clinic?.instagram).toBe('https://www.instagram.com/kcld_support/');
 expect(doctor.clinic?.website).toBe('https://kcld-kw.com/arabic/index.html');
 expect(doctor.clinic?.mapUrl).toBe('https://maps.app.goo.gl/93FnN5o6wHvRq9Xa7');
 expect(doctor.suppliedQualifications).toBeUndefined();expect(doctor.clinic?.address).toBeUndefined();
});
