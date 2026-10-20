import {STORED_HOME_SERVICE_PROVIDERS,HOME_SERVICE_PROVIDERS,findHomeServiceProvider,filterHomeServiceProviders} from '../constants/homeServiceProviders';
import {isHiddenAlShifa,isListedCenter} from '../utils/centerVisibility';
import {buildHomeSearchRecords,searchHomeRecords} from '../utils/homeSearch';
import {backendInstitution,filterInstitutions} from '../utils/institutionDirectory';
import type {HealthCenter} from '../types/directory.types';
const id='home-provider-al-shifa';
test('Al Shifa stored data is retained unchanged and only its public projection is hidden',()=>{
 const stored=STORED_HOME_SERVICE_PROVIDERS.find(p=>p.id===id)!;
 expect(stored.phone).toBe('51003780');expect(stored.name).toEqual({ar:'الشفاء للرعاية الصحية المنزلية',en:'Al Shifa Home Healthcare'});
 expect(stored.categories).toEqual(['home-healthcare']);expect(stored.sources).toEqual([{title:'Al Shifa — special needs care',url:'https://alshifa.health/special-needs-care/'}]);
 expect(stored.description.en).toBe('Home healthcare and support. The exact services for children have not been confirmed; this is not listed as pediatric therapy.');
 expect(HOME_SERVICE_PROVIDERS.filter(p=>p.id!=="center-speak-clinic")).toEqual(STORED_HOME_SERVICE_PROVIDERS.filter(p=>p.id!==id));
 expect(findHomeServiceProvider(id)).toBeUndefined();expect(filterHomeServiceProviders('home-healthcare')).toEqual([]);
});
test.each(['الشفاء للرعاية الصحية المنزلية','الشفاء للرعاية المنزلية','Al Shifa Home Healthcare','Al Shifa Home Care'])('exact identity %s cannot return from API or search',name=>{
 const api={id:'123456789012345678901234',name,phone:'51003780'} as HealthCenter;
 const item=backendInstitution(api);expect(isListedCenter({...item,nameEn:item.nameEn || undefined})).toBe(false);expect(filterInstitutions([item],{search:name})).toEqual([]);
 expect(searchHomeRecords(buildHomeSearchRecords([api]),name)).toEqual([]);
});
test('unrelated Shifa providers and exact ID variants are handled safely',()=>{
 for(const name of ['Dar Al Shifa','Al Shifa Hospital','مستشفى دار الشفاء','Al Shifa Physiotherapy Center'])expect(isHiddenAlShifa({name})).toBe(false);
 expect(isHiddenAlShifa({id:'backend:'+id})).toBe(true);expect(isListedCenter({canonicalId:id})).toBe(false);
});
