import { INSTITUTIONS, filterInstitutions, institutionDirectoryCategory, backendInstitution, mergeInstitutions } from "../utils/institutionDirectory";
import { institutionImages } from "../components/directory/InstitutionImage";
import type { HealthCenter } from "../types/directory.types";
const center=INSTITUTIONS.find(i=>i.id==='center-communicate')!;
test("Communicate is one searchable center with its original logo and two services",()=>{
 expect(INSTITUTIONS.filter(i=>i.id===center.id)).toHaveLength(1);
 expect(institutionDirectoryCategory(center)).toBe('rehabilitation');
 for(const search of ['Communicate','كوميونيكيت']) expect(filterInstitutions(INSTITUTIONS,{search})).toContain(center);
 expect(center.mainImage).toBe('communicate');expect(institutionImages.communicate).toBeDefined();
 expect(center.publicProfile?.services).toEqual({ar:['علاج النطق واللغة','العلاج باللعب'],en:['Speech and Language Therapy','Play Therapy']});
 expect(center.publicProfile?.classification?.en).toBe('Speech and Language Therapy');
 const api=backendInstitution({id:'api-communicate',name:'Communicate'} as HealthCenter);
 expect(mergeInstitutions(INSTITUTIONS,[api]).filter(i=>(i.canonicalId||i.id)===center.id)).toHaveLength(1);
});
test("Communicate has exact URLs and no inferred phone or WhatsApp",()=>{
 expect(center.publicProfile?.website).toBe('http://www.communicatekw.com/');
 expect(center.publicProfile?.instagram).toBe('https://www.instagram.com/communicate_kw/');
 expect(center.publicProfile?.mapUrl).toBe('https://maps.app.goo.gl/M3Xnjooot4hS8gbd9');
 expect(center.publicProfile?.phone).toBeUndefined();expect(center.publicProfile?.whatsapp).toBeUndefined();
});
