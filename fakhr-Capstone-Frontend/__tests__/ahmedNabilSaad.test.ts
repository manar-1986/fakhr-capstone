import { PUBLIC_DOCTORS } from "../constants/approvedDoctors";
import { AHMED_NABIL_SAAD as doctor } from "../constants/ahmedNabilSaad";
import { filterDirectoryDoctors, doctorSpecialtyOptions } from "../utils/doctorSpecialtyFilters";
import { doctorImageAsset } from "../components/directory/DoctorVisuals";
import { directoryPhoneUrl } from "../utils/directoryCall";
test("Ahmed has one identity, bilingual search and the mental health filter",()=>{
 expect(PUBLIC_DOCTORS.filter(d=>d.id===doctor.id)).toHaveLength(1);
 expect(doctorSpecialtyOptions().filter(o=>o.key===doctor.group)).toHaveLength(1);
 for(const name of [doctor.nameAr,doctor.nameEn]) expect(filterDirectoryDoctors(PUBLIC_DOCTORS,doctor.group,name)).toEqual([doctor]);
 expect(doctorImageAsset(doctor)).toMatchObject({fit:'cover'});
 expect(doctor.suppliedSpecializations?.ar).toEqual(["اضطراب طيف التوحد","فرط الحركة وتشتت الانتباه (ADHD)","صعوبات التعلم","التبول والتبرز اللاإراديين","العجز الفكري","الأزمات العصبية","اضطرابات السلوك","اضطرابات النوم","التوتر العصبي والفوبيا والاكتئاب عند الأطفال","اضطرابات الأكل"]);
 expect(doctor.suppliedSpecializations?.en).toEqual(["Autism Spectrum Disorder (ASD)","Attention Deficit Hyperactivity Disorder (ADHD)","Learning Difficulties","Enuresis and Encopresis","Intellectual Disability","Nervous Crises","Behavioral Disorders","Sleep Disorders","Anxiety, Phobias, and Depression in Children","Eating Disorders"]);
});
test("Ahmed has only the exact supplied contact information",()=>{
 expect(directoryPhoneUrl(doctor.clinic?.phone)).toBe('tel:+96599566112');
 expect(doctor.clinic?.instagram).toBe('https://www.instagram.com/alhammadi_center/');
 expect(doctor.clinic?.mapUrl).toBe('https://maps.app.goo.gl/F1dJe5F6Bzc3gZKK8');
 expect(doctor.clinic?.whatsapp).toBeUndefined();expect(doctor.clinic?.address).toBeUndefined();expect(doctor.suppliedQualifications).toBeUndefined();
});
