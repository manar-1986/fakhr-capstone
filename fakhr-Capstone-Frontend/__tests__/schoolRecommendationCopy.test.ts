import {recommendationCopy,recommendationName} from '../utils/schoolRecommendationCopy';
import {INSTITUTIONS} from '../utils/institutionDirectory';
const ccet=INSTITUTIONS.find(r=>r.id==='kw-s-child')!;
const gulf=INSTITUTIONS.find(r=>r.id==='kw-s-gulf')!;
test('uses existing English name and description without Arabic source text appended',()=>{
 expect(recommendationName(ccet,false)).toEqual({name:ccet.nameEn,missing:false});
 expect(recommendationCopy(ccet,ccet.observations,false).info).toBe(ccet.publicProfile!.description!.en);
 expect(recommendationCopy(ccet,ccet.observations,false).info).not.toMatch(/[\u0600-\u06ff]/);
});
test('Arabic mode preserves original Arabic name and description',()=>{
 expect(recommendationName(ccet,true)).toEqual({name:ccet.nameAr,missing:false});
 expect(recommendationCopy(ccet,ccet.observations,true).info).toBe(ccet.publicProfile!.description!.ar);
});
test('missing English official name is never generated; description absence is explicit',()=>{
 expect(recommendationName(gulf,false)).toEqual({name:gulf.nameAr,missing:true});
 expect(recommendationCopy(gulf,gulf.observations,false).info).toContain('English description unavailable');
});
test('Arabic duplicated into English fields is not treated as translated content',()=>{
 const record={...gulf,nameEn:gulf.nameAr,publicProfile:{services:{ar:['خدمات'],en:['خدمات']}}};
 expect(recommendationName(record,false).missing).toBe(true);
 expect(recommendationCopy(record,record.observations,false).info).toContain('English description unavailable');
});
test('existing English services and locations are reused, with no mutation',()=>{
 const record={...gulf,publicProfile:{services:{ar:['خدمات'],en:['Existing English service']},area:{ar:'منطقة',en:'Existing area'}}};
 const before=JSON.stringify(record);
 expect(recommendationCopy(record,record.observations,false).info).toBe('Existing English service');
 expect(recommendationCopy(record,record.observations,false).location).toContain('Existing area');
 expect(JSON.stringify(record)).toBe(before);
});
