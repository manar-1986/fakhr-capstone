import { PUBLIC_DOCTORS } from "../constants/approvedDoctors";
import { AMAL_ASHOUR as doctor } from "../constants/amalAshour";
import { filterDirectoryDoctors, doctorSpecialtyOptions } from "../utils/doctorSpecialtyFilters";
import { doctorImageAsset } from "../components/directory/DoctorVisuals";

test("Amal appears once in bilingual search and the existing mental health filter", () => {
  expect(PUBLIC_DOCTORS.filter(d => d.nameEn === doctor.nameEn)).toEqual([doctor]);
  expect(doctorSpecialtyOptions().filter(o => o.key === doctor.group)).toHaveLength(1);
  for (const name of [doctor.nameAr, doctor.nameEn]) expect(filterDirectoryDoctors(PUBLIC_DOCTORS, doctor.group, name)).toEqual([doctor]);
  expect(doctorImageAsset(doctor)).toMatchObject({ fit: "cover" });
});

test("Amal retains supplied contacts without assuming a call number or qualifications", () => {
  expect(doctor.clinic?.whatsapp).toEqual({ phone: "+96599494181", url: "https://wa.me/96599494181" });
  expect(doctor.clinic?.instagram).toBe("https://www.instagram.com/dr.amalashour/");
  expect(doctor.clinic?.mapUrl).toBe("https://maps.app.goo.gl/Z2pP6RwSXvviPzaa6");
  expect(doctor.clinic?.phone).toBeUndefined();
  expect(doctor.clinic?.address).toBeUndefined();
  expect(doctor.suppliedQualifications).toBeUndefined();
  expect(doctor.suppliedSpecializations).toBeUndefined();
});
