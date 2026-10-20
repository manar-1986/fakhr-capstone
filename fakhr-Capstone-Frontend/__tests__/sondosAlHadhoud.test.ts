import { PUBLIC_DOCTORS } from "../constants/approvedDoctors";
import { SONDOS_AL_HADHOUD as doctor } from "../constants/sondosAlHadhoud";
import { filterDirectoryDoctors, doctorVisibleSpecialtyOptions } from "../utils/doctorSpecialtyFilters";
import { doctorImageAsset } from "../components/directory/DoctorVisuals";
import { directoryPhoneUrl } from "../utils/directoryCall";

test("Sondos is unique, searchable in both languages, and included in her three specialties", () => {
 expect(PUBLIC_DOCTORS.filter(d => d.nameEn === doctor.nameEn)).toEqual([doctor]);
 for (const group of ["pediatric-cardiology", "pediatrics", "fetal-cardiology"]) {
  expect(doctorVisibleSpecialtyOptions().filter(o => o.key === group)).toHaveLength(1);
  for (const name of [doctor.nameAr, doctor.nameEn]) expect(filterDirectoryDoctors(PUBLIC_DOCTORS, group, name)).toEqual([doctor]);
 }
 expect(doctorImageAsset(doctor)).toMatchObject({fit:"cover"});
 expect(doctor.suppliedSpecializations?.ar).toHaveLength(4);
 expect(doctor.suppliedSpecializations?.en).toHaveLength(4);
 expect(doctor.suppliedDiagnosticServices?.ar).toHaveLength(5);
 expect(doctor.suppliedDiagnosticServices?.en).toHaveLength(5);
 expect(doctor.suppliedQualifications).toBeUndefined();
});
test("Sondos preserves the hospital short call number and verified official WhatsApp destination", () => {
 expect(directoryPhoneUrl(doctor.clinic?.phone)).toBe("tel:1828282");
 expect(doctor.clinic?.whatsapp?.url).toBe("https://wa.me/%2B9651828282");
 expect(doctor.clinic?.instagram).toBe("https://www.instagram.com/hadiclinickw/");
 expect(doctor.clinic?.mapUrl).toBe("https://maps.app.goo.gl/RgrEpwok2pGMzUHj7");
});
