import { PUBLIC_DOCTORS } from "../constants/approvedDoctors";
import { ANOUD_AL_JASSER_AL_RAJHI as doctor } from "../constants/anoudAlJasserAlRajhi";
import { filterDirectoryDoctors, doctorSpecialtyOptions } from "../utils/doctorSpecialtyFilters";
import { doctorImageAsset } from "../components/directory/DoctorVisuals";
test("Anoud has one identity, bilingual search and three dental filters",()=>{
 expect(PUBLIC_DOCTORS.filter(d=>d.id===doctor.id)).toHaveLength(1);
 for(const id of ['dentistry','pediatric-dentistry','special-needs-dentistry']) {
 expect(doctorSpecialtyOptions().filter(o=>o.key===id)).toHaveLength(1);
 for(const name of [doctor.nameAr,doctor.nameEn]) expect(filterDirectoryDoctors(PUBLIC_DOCTORS,id,name)).toEqual([doctor]);
 }
 expect(doctorImageAsset(doctor)).toMatchObject({fit:'cover'});
});
test("Anoud has only the supplied hospital and two contact links",()=>{
 expect(doctor.clinic).toEqual({nameAr:'مستشفى رويال حياة',nameEn:'Royale Hayat Hospital',instagram:'https://www.instagram.com/royalehayat/',mapUrl:'https://maps.app.goo.gl/koaARYW5sBJ39KxP6'});
 expect(doctor.suppliedQualifications).toBeUndefined();
});
