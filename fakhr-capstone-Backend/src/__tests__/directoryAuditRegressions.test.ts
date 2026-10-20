import catalog from '../modules/directorySearch/providers.snapshot.json';
import {directoryIntent,localCriteria} from '../modules/directorySearch/criteria';
import {conversationLanguage} from '../modules/directorySearch/recommendations';
import {searchProviders} from '../modules/directorySearch/providers';

test.each([['والدكاترة؟','doctor'],['والمراكز؟','rehabilitation'],['والحضانات؟','nursery'],['والمدارس؟','school'],['والنوادي؟','sports']])('Kuwaiti category continuation %s preserves explicit criteria',(q,category)=>{
 const previous=localCriteria('autism age 8 occupational therapy in Salmiya');
 expect(directoryIntent(q)).toBe(category);
 expect(localCriteria(q,previous)).toEqual(previous);
});
test.each(['محافظة حولي','Hawalli governorate','Hawalli','حولي'])('governorate does not silently also constrain area: %s',place=>{
 expect(localCriteria('autism in '+place)).toMatchObject({governorate:'حولي',area:null});
});
test.each(['منطقة حولي','Hawalli area'])('explicit area is distinct: %s',place=>{
 expect(localCriteria('autism in '+place)).toMatchObject({governorate:null,area:'حولي'});
});
test.each([['Centers for autism in السالمية','en'],['Schools in محافظة حولي','en'],['أبي مركز في Salmiya','ar-KW'],['مدارس في Hawalli','ar']])('mixed place names retain question language: %s',(q,language)=>expect(conversationLanguage(q)).toBe(language));
test.each(['My child has speech and language difficulties','طفلي لديه صعوبات النطق','ولدي عنده تأخر لغوي'])('condition does not impose speech therapy: %s',q=>{
 expect(localCriteria(q).disabilities).toContain('speech');expect(localCriteria(q).services).not.toContain('speech');
});
test.each(['speech therapy','language therapy','speech therapist','وين ألقى دكتور نطق','أخصائي علاج النطق','جلسات تخاطب'])('explicit speech service: %s',q=>expect(localCriteria(q).services).toContain('speech'));
test('explicit service persists through follow-ups and negation removes it',()=>{
 const c=localCriteria('speech therapy for autism age 8 in Salmiya');
 expect(localCriteria('والمراكز؟',c)).toEqual(c);
 expect(localCriteria('without speech therapy',c).services).not.toContain('speech');
});
test('Dima unknown age remains inquiry only, never an invented limit',()=>{
 const dima=catalog.records.filter(r=>r.id.includes('dima'));
 expect(dima).toHaveLength(1);
 const result=searchProviders({category:'nursery',criteria:localCriteria('autism age 25')},dima);
 expect(result).toHaveLength(1);
 for(const r of result.filter(r=>r.id.includes('dima'))){expect(r.verification).toBe('inquiry');expect(r.evidence.some(e=>e.reasons.includes('age_unknown'))).toBe(true);}
});
