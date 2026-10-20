import { PUBLIC_DOCTORS } from "../constants/approvedDoctors";
import { ALI_ADEL_SALEH as doctor } from "../constants/aliAdelSaleh";
import { filterDirectoryDoctors, doctorSpecialtyOptions } from "../utils/doctorSpecialtyFilters";
import { doctorImageAsset } from "../components/directory/DoctorVisuals";
test("Ali has one identity reachable by both orthopedic filters and bilingual search",()=>{
 expect(PUBLIC_DOCTORS.filter(d=>d.id===doctor.id)).toHaveLength(1);
 for(const id of ['pediatric-orthopedics','orthopedic-surgery']) {
  expect(doctorSpecialtyOptions().filter(o=>o.key===id)).toHaveLength(1);
  for(const name of [doctor.nameAr,doctor.nameEn]) expect(filterDirectoryDoctors(PUBLIC_DOCTORS,id,name)).toEqual([doctor]);
 }
 expect(doctorImageAsset(doctor)).toMatchObject({fit:'cover'});
 expect(doctor.suppliedSpecializations?.ar).toHaveLength(5);
 expect(doctor.suppliedSpecializations?.en).toHaveLength(5);
 expect(doctor.clinic?.whatsapp?.url).toBe('https://wa.me/9651830003');
 expect(doctor.clinic?.mapUrl).toBe('https://maps.app.goo.gl/4xEnUoCt7wJmevRR9');
 expect(doctor.clinic?.phone).toBeUndefined();
 expect(doctor.clinic?.address).toBeUndefined();
});
