import { PUBLIC_DOCTORS } from "../constants/approvedDoctors";
import { NESMA_AL_ARIDI as specialist } from "../constants/nesmaAlAridi";
import { filterDirectoryDoctors, doctorVisibleSpecialtyOptions } from "../utils/doctorSpecialtyFilters";
import { doctorImageAsset } from "../components/directory/DoctorVisuals";

test("Nesma is unique and searchable in the bilingual Clinical Nutrition filter", () => {
 expect(PUBLIC_DOCTORS.filter(d => d.nameEn === specialist.nameEn)).toEqual([specialist]);
 expect(doctorVisibleSpecialtyOptions().filter(o => o.key === specialist.group)).toHaveLength(1);
 for (const name of [specialist.nameAr, specialist.nameEn]) expect(filterDirectoryDoctors(PUBLIC_DOCTORS, specialist.group, name)).toEqual([specialist]);
 expect(doctorImageAsset(specialist)).toMatchObject({fit:"cover"});
 expect(specialist.suppliedQualifications?.ar).toEqual(["ماجستير في التغذية العلاجية"]);
 expect(specialist.suppliedQualifications?.en).toEqual(["Master's Degree in Clinical Nutrition"]);
 expect(specialist.suppliedSpecializations?.ar).toHaveLength(4);
 expect(specialist.suppliedSpecializations?.en).toHaveLength(4);
});
test("Nesma has only the supplied Klinik contact destinations", () => {
 expect(specialist.clinic?.whatsapp?.url).toBe("https://wa.me/96522020404");
 expect(specialist.clinic?.instagram).toBe("https://www.instagram.com/klinik.kw/");
 expect(specialist.clinic?.website).toBe("https://www.klinik.com.kw/en/");
 expect(specialist.clinic?.phone).toBeUndefined();
 expect(specialist.clinic?.mapUrl).toBeFalsy();
 expect(specialist.clinic?.address).toBeUndefined();
});
