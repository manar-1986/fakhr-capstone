import type { ApprovedDoctor } from "./approvedDoctors";

// User-provided profile and original portrait; no independent credential verification asserted.
export const ESSA_AL_MASHMOUM: ApprovedDoctor = {
  id: "doctor-essa-habib-al-mashmoum",
  nameAr: "د. عيسى حبيب المشموم", nameEn: "Dr. Essa Habib Al-Mashmoum",
  englishVerified: false, group: "neurology", sources: [],
  suppliedSpecialty: { ar: "استشاري أمراض أعصاب الأطفال والصرع وتخطيط وتحفيز الدماغ", en: "Consultant Pediatric Neurology, Epilepsy, EEG & Brain Stimulation", provenance: "user-provided", independentlyVerified: false },
  suppliedBiography: { ar: "استشاري أمراض أعصاب الأطفال والصرع وتخطيط وتحفيز الدماغ.", en: "Consultant Pediatric Neurology, Epilepsy, EEG & Brain Stimulation.", provenance: "user-provided", independentlyVerified: false },
  // No clinic name was supplied; label the contact card with the doctor's own name.
  clinic: { nameAr: "د. عيسى حبيب المشموم", nameEn: "Dr. Essa Habib Al-Mashmoum",
    phone: "+96567754444", address: "حولي، مجمع الأندلس، الدور الثالث",
    addressEn: "Hawally, Al-Andalus Complex, third floor",
    mapUrl: "https://maps.app.goo.gl/bNAsciu6VGFf64JC7" },
};
