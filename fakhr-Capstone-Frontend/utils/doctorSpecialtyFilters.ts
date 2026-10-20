import { DOCTOR_GROUPS, PUBLIC_DOCTORS, type ApprovedDoctor, type DoctorGroup } from "../constants/approvedDoctors";
import { directorySpecialty } from "../components/directory/DoctorVisuals";
import { normalizeInstitutionSearch } from "./institutionDirectory";

type SpecialtyDoctor = ApprovedDoctor & { specialtyIds?: readonly DoctorGroup[] };
// IDs are independent of locale. Never infer extra medical specialties from prose.
export const doctorSpecialtyIds = (doctor: SpecialtyDoctor): DoctorGroup[] =>
  [...new Set([directorySpecialty(doctor), ...(doctor.specialtyIds || [])])];
export function doctorSpecialtyOptions(doctors: readonly SpecialtyDoctor[] = PUBLIC_DOCTORS) {
  const ids = new Set(doctors.flatMap(doctorSpecialtyIds));
  return [...ids].map(id => DOCTOR_GROUPS.find(group => group.key === id)!);
}
// Filter-bar visibility only; retain all specialty IDs for records and listing groups.
export function doctorVisibleSpecialtyOptions(doctors: readonly SpecialtyDoctor[] = PUBLIC_DOCTORS) {
  return doctorSpecialtyOptions(doctors).filter(option => option.key !== "orthopedic-surgery");
}
export function filterDirectoryDoctors(doctors: readonly SpecialtyDoctor[], specialty: string, search: string) {
  const query = normalizeInstitutionSearch(search);
  return doctors.filter(doctor => (specialty === "all" || doctorSpecialtyIds(doctor).includes(specialty as DoctorGroup)) &&
    normalizeInstitutionSearch([doctor.nameAr, doctor.nameEn, doctor.clinic?.nameAr, doctor.clinic?.nameEn].filter(Boolean).join(" ")).includes(query));
}
