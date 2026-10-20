import { PUBLIC_DOCTORS } from "../constants/approvedDoctors";
import { FAJER_AL_MUNAIE } from "../constants/fajerAlMunaie";
import { doctorSpecialtyOptions, filterDirectoryDoctors } from "../utils/doctorSpecialtyFilters";
import { directoryPhoneUrl } from "../utils/directoryCall";
import { doctorImageAsset } from "../components/directory/DoctorVisuals";
test("Fajer has one public identity, ABA filtering, bilingual search and original photograph",()=>{
 expect(PUBLIC_DOCTORS.filter(d=>d.id===FAJER_AL_MUNAIE.id)).toHaveLength(1);
 expect(doctorSpecialtyOptions().filter(o=>o.key==='aba')).toHaveLength(1);
 for(const name of ['فجر المنيع','Fajer Al Munaie']) expect(filterDirectoryDoctors(PUBLIC_DOCTORS,'aba',name)).toEqual([FAJER_AL_MUNAIE]);
 expect(doctorImageAsset(FAJER_AL_MUNAIE)).toMatchObject({fit:'cover'});
 expect(FAJER_AL_MUNAIE.suppliedSpecializations?.ar).toHaveLength(6);
 expect(FAJER_AL_MUNAIE.suppliedSpecializations?.en).toHaveLength(6);
});
test("Fajer contact links preserve the exact supplied destinations",()=>{
 expect(directoryPhoneUrl(FAJER_AL_MUNAIE.clinic?.phone)).toBe('tel:18202');
 expect(FAJER_AL_MUNAIE.clinic?.instagram).toBe('https://www.instagram.com/fshnhealth/');
 expect(FAJER_AL_MUNAIE.clinic?.mapUrl).toBe('https://maps.app.goo.gl/cc8rBtyWqQyUiLdB9');
 expect(FAJER_AL_MUNAIE.clinic).not.toHaveProperty('whatsapp');
});
