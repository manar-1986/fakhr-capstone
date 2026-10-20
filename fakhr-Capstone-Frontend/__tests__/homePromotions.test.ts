import {buildHomePromotions} from '../utils/homePromotions';
import {HOME_ACTIVITY_VIDEOS} from '../constants/homeActivityLibrary';
test('five distinct mapped campaigns with bilingual copy and preserved image proportions',()=>{
 const rows=buildHomePromotions();expect(rows.map(r=>r.category)).toEqual(['doctor','rehabilitation','school','activity','product']);
 expect(new Set(rows.map(r=>r.id)).size).toBe(5);
 for(const row of rows){expect(row.image).toBeTruthy();expect(row.fit).toBe('contain');for(const lang of ['ar','en'] as const){expect(row.name[lang]).toBeTruthy();expect(row.note[lang]).toBeTruthy();}}
});
test('existing profile destinations remain exact',()=>{
 const rows=buildHomePromotions();expect(rows[0].href).toEqual({pathname:'/(tabs)/directory/professional-details',params:{id:'doctor-hadeel-yassin-faras'}});
 expect(rows[1].href).toEqual({pathname:'/(tabs)/directory/institution-details',params:{id:'center-abc-kuwait'}});
 expect(rows[2].href).toEqual({pathname:'/(tabs)/directory/institution-details',params:{id:'kw-s-hope'}});
});
test('activity retains approved source copy and links to the library',()=>{
 const row=buildHomePromotions()[3],source=HOME_ACTIVITY_VIDEOS[0];expect(row.image).toEqual(require("../assets/images/activities/crit-easy-grip.jpg"));expect(row.note.en).toBe(source.descriptionEn);expect(row.href).toBe('/(tabs)/activity-library');
});

test('product uses existing labelled artwork and existing detail destination',()=>{
 const row=buildHomePromotions()[4];expect(row.id).toBe('p-3');expect(row.image).toEqual(require('../assets/images/product-3.png'));expect(row.href).toEqual({pathname:'/(tabs)/products/product-details',params:{id:'p-3'}});
});

test('banner-only artwork preserves source records and original activity people',()=>{
 const {promotionArtwork}=require('../utils/promotionArtwork');
 const rows=buildHomePromotions(),before=JSON.stringify(rows);
 expect(promotionArtwork(rows[0])).toEqual(require('../assets/images/hadeel-clinic/portrait-cutout-review.png'));
 expect(promotionArtwork(rows[1])).toEqual(rows[1].image);
 expect(promotionArtwork(rows[2])).toEqual(require('../assets/images/schools/hope-banner-cutout.png'));
 expect(promotionArtwork(rows[3])).toEqual(rows[3].image);
 expect(promotionArtwork(rows[4])).toEqual(require('../assets/images/product-3-banner-cutout.png'));
 expect(JSON.stringify(rows)).toBe(before);
});
