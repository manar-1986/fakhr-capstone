import { PUBLIC_DOCTORS } from "../constants/approvedDoctors";
import { NOUR_QAHFARANI } from "../constants/nourQahfarani";
import { doctorSpecialtyOptions, filterDirectoryDoctors } from "../utils/doctorSpecialtyFilters";
import { directoryPhoneUrl } from "../utils/directoryCall";
import { doctorImageAsset } from "../components/directory/DoctorVisuals";
test("Nour has one public record, bilingual ABA search, all supplied specialties and a photograph",()=>{
 expect(PUBLIC_DOCTORS.filter(d=>d.id===NOUR_QAHFARANI.id)).toHaveLength(1);
 expect(doctorSpecialtyOptions().filter(o=>o.key==='aba')).toHaveLength(1);
 for(const name of ['نور قهفراني','Nour Qahfarani']) expect(filterDirectoryDoctors(PUBLIC_DOCTORS,'aba',name)).toEqual([NOUR_QAHFARANI]);
 expect(doctorImageAsset(NOUR_QAHFARANI)).toMatchObject({fit:'cover'});
 expect(NOUR_QAHFARANI.suppliedSpecializations?.ar).toHaveLength(6);
 expect(NOUR_QAHFARANI.suppliedSpecializations?.en).toHaveLength(6);
 expect(NOUR_QAHFARANI.clinic?.nameEn).toBe('FSHN Health');
});
test("Nour uses only the exact supplied contacts",()=>{
 expect(directoryPhoneUrl(NOUR_QAHFARANI.clinic?.phone)).toBe('tel:18202');
 expect(NOUR_QAHFARANI.clinic?.instagram).toBe('https://www.instagram.com/fshnhealth/');
 expect(NOUR_QAHFARANI.clinic?.mapUrl).toBe('https://maps.app.goo.gl/cc8rBtyWqQyUiLdB9');
 expect(NOUR_QAHFARANI.clinic).not.toHaveProperty('whatsapp');
});
