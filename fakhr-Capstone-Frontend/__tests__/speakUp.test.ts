import { INSTITUTIONS, filterInstitutions, institutionDirectoryCategory } from "../utils/institutionDirectory";
import { institutionImages } from "../components/directory/InstitutionImage";
import { centerWhatsApp } from "../utils/centerPublicProfile";
const center=INSTITUTIONS.find(i=>i.id==="center-speak-up")!;
test("Speak Up is unique, bilingual, and classified as speech therapy",()=>{
 expect(INSTITUTIONS.filter(i=>i.nameEn==="Speak Up Consulting Center")).toHaveLength(1);
 expect(institutionDirectoryCategory(center)).toBe("rehabilitation");
 for(const search of ["Speak Up","سبيك أب"]) expect(filterInstitutions(INSTITUTIONS,{search})).toContain(center);
 expect(center.disabilityTags).toContain("speech");
 expect(center.publicProfile?.services).toEqual({ar:["النطق واللغة"],en:["Speech and Language Therapy"]});
 expect(institutionImages.speakup).toBeDefined();
});
test("preserves supplied contact destinations without inferring a WhatsApp number",()=>{
 expect(center.publicProfile?.phone).toBe("+96555566034");
 expect(centerWhatsApp(center.publicProfile?.whatsapp)).toEqual({url:"https://wa.me/message/MSKRS5DKDUHIK1"});
 expect(center.publicProfile?.instagram).toBe("https://www.instagram.com/speakupkw_/");
 expect(center.publicProfile?.mapUrl).toBe("https://maps.app.goo.gl/R5c7ZNy2Vm9dybzXA");
});
