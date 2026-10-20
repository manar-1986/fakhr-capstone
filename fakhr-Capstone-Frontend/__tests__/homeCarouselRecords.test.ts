import {buildHomeCarouselRecords} from '../utils/homeCarouselRecords';
import {findInstitution,INSTITUTIONS} from '../utils/institutionDirectory';
import {findApprovedDoctor} from '../constants/approvedDoctors';
import {findHomeServiceProvider} from '../constants/homeServiceProviders';
import type {HealthCenter} from '../types/directory.types';
test('all slides have real images, unique public identities and correct routes',()=>{
 const slides=buildHomeCarouselRecords();expect(slides.length).toBeGreaterThan(30);expect(new Set(slides.map(s=>s.id)).size).toBe(slides.length);
 expect(new Set(slides.slice(0,5).map(s=>s.category)).size).toBe(5);
 for(const slide of slides){expect(slide.image).toBeDefined();expect(findInstitution(slide.id)||findApprovedDoctor(slide.id)||findHomeServiceProvider(slide.id)).toBeDefined();expect((slide.href as any).params.id).toBe(slide.id);}
 for(const id of ['kw-n-blue-sky','kw-n-jwan','kw-n-qudrat','kw-n-sabah','kw-n-big-wish','kw-n-salam','kw-n-portage','kw-n-tabarak','home-provider-al-shifa','kw-n-insan-2'])expect(slides.some(s=>s.id===id)).toBe(false);
 expect(slides.filter(s=>s.id==='center-speak-clinic').map(s=>s.category)).toEqual(['service']);
});
test('new catalog images are included automatically, while missing references are omitted',()=>{
 const source=INSTITUTIONS.find(i=>i.mainImage && i.categories.includes('nursery'))!;
 const future={...source,id:'future-nursery',nameAr:'Future nursery'};
 expect(buildHomeCarouselRecords([], [future]).some(s=>s.id===future.id)).toBe(true);
 expect(buildHomeCarouselRecords([], [{...future,mainImage:undefined}]).some(s=>s.id===future.id)).toBe(false);
});
test('remote API images require valid public identities, and aliases do not duplicate local slides',()=>{
 const remote={id:'123456789012345678901234',name:'Remote center',image:'https://example.org/logo.png'} as unknown as HealthCenter;
 const slides=buildHomeCarouselRecords([remote,remote]);expect(slides.filter(s=>s.id==='backend:'+remote.id)).toHaveLength(1);
 expect(buildHomeCarouselRecords([{...remote,isActive:false} as HealthCenter]).some(s=>s.id==='backend:'+remote.id)).toBe(false);
 expect(buildHomeCarouselRecords([{...remote,image:'invalid'} as HealthCenter]).some(s=>s.id==='backend:'+remote.id)).toBe(false);
 expect(buildHomeCarouselRecords([{...remote,name:'Speak Clinic'}]).filter(s=>s.id==='center-speak-clinic')).toHaveLength(1);
});
