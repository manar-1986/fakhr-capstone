import { PUBLIC_DOCTORS } from "../constants/approvedDoctors";
import { SALMAN_BIN_NAKHI as doctor } from "../constants/salmanBinNakhi";
import { filterDirectoryDoctors, doctorSpecialtyOptions } from "../utils/doctorSpecialtyFilters";
import { doctorImageAsset } from "../components/directory/DoctorVisuals";
import { directoryPhoneUrl } from "../utils/directoryCall";
test("Salman has one identity, bilingual search and three dental filters",()=>{
 expect(PUBLIC_DOCTORS.filter(d=>d.id===doctor.id)).toHaveLength(1);
 for(const id of ['dentistry','pediatric-dentistry','special-needs-dentistry']) {
 expect(doctorSpecialtyOptions().filter(o=>o.key===id)).toHaveLength(1);
 for(const name of [doctor.nameAr,doctor.nameEn]) expect(filterDirectoryDoctors(PUBLIC_DOCTORS,id,name)).toEqual([doctor]);
 }
 expect(doctorImageAsset(doctor)).toMatchObject({fit:'cover'});
});
test("Salman has only supplied contact details",()=>{
 expect(directoryPhoneUrl(doctor.clinic?.phone)).toBe('tel:+96525360084');
 expect(doctor.clinic?.instagram).toBe('https://www.instagram.com/royalehayatdentalclinic/');
 expect(doctor.clinic?.mapUrl).toBe('https://maps.app.goo.gl/koaARYW5sBJ39KxP6');
 expect(doctor.clinic?.whatsapp).toBeUndefined();expect(doctor.clinic?.address).toBeUndefined();
 expect(doctor.suppliedQualifications).toBeUndefined();
});
