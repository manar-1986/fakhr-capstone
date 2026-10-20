import { PUBLIC_DOCTORS } from "../constants/approvedDoctors";
import { RAWAN_AL_KHUWAITEM as doctor } from "../constants/rawanAlKhuwaitem";
import { filterDirectoryDoctors, doctorSpecialtyOptions } from "../utils/doctorSpecialtyFilters";
import { doctorImageAsset } from "../components/directory/DoctorVisuals";
test("Rawan has one identity, bilingual search and three dental filters",()=>{
 expect(PUBLIC_DOCTORS.filter(d=>d.id===doctor.id)).toHaveLength(1);
 for(const id of ['dentistry','pediatric-dentistry','special-needs-dentistry']) {
 expect(doctorSpecialtyOptions().filter(o=>o.key===id)).toHaveLength(1);
 for(const name of [doctor.nameAr,doctor.nameEn]) expect(filterDirectoryDoctors(PUBLIC_DOCTORS,id,name)).toEqual([doctor]);
 }
 expect(doctorImageAsset(doctor)).toMatchObject({fit:'cover'});
});
test("Both branches retain their own exact WhatsApp and Maps pair",()=>{
 expect(doctor.branches).toEqual([
 {id:'avenues',nameAr:'الأفنيوز',nameEn:'The Avenues',whatsapp:{phone:'+96551528694',url:'https://wa.me/96551528694'},mapUrl:'https://maps.app.goo.gl/e5ozm9Vh8ToZamdj9'},
 {id:'jahra',nameAr:'الجهراء',nameEn:'Jahra',whatsapp:{phone:'+96522200073',url:'https://wa.me/96522200073'},mapUrl:'https://maps.app.goo.gl/Tep8eFDLUyc9NV3M9'},
 ]);
 expect(doctor.clinic).toBeUndefined();expect(doctor.suppliedQualifications).toBeUndefined();
});
