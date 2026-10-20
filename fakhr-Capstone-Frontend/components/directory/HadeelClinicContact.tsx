import React from "react";
import FatmaClinicContact from "./FatmaClinicContact";
import type { ApprovedDoctor } from "../../constants/approvedDoctors";

const photos = [
  { source: require("../../assets/images/hadeel-clinic/reception.png"), ar: "استقبال العيادة", en: "Clinic reception" },
  { source: require("../../assets/images/hadeel-clinic/play-area.png"), ar: "منطقة انتظار ولعب الأطفال", en: "Children’s waiting/play area" },
];
export default function HadeelClinicContact({ doctor, ...props }: { doctor: ApprovedDoctor; mode?: "all" | "gallery" | "contact"; hideCalendar?: boolean }) {
  return <FatmaClinicContact doctor={doctor} photos={photos} {...props} />;
}
