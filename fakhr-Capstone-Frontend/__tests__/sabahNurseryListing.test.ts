import catalog from "../data/institutions/catalog.json";
import {INSTITUTIONS,findInstitution,filterInstitutions,institutionDirectoryCategory} from "../utils/institutionDirectory";
import {isListedCenter} from "../utils/centerVisibility";
test("only Al Sabah Model is hidden from nursery listings, searches and filters, preserving stored data",()=>{
 const id="kw-n-sabah",source=catalog.institutions.find(i=>i.id===id)!;const snapshot=JSON.stringify(catalog);
 expect(source.nameAr).toBe("حضانة الصباح النموذجية");expect(findInstitution(id)).toEqual(source);expect(source.observations[0].areaAr).toBe("بيان");expect(source.observations[0].addressAr).toBe("بيان – قطعة 3 – شارع 4 – منزل 38");
 const before=INSTITUTIONS.filter(i=>isListedCenter({...i,id:i.id===id?"baseline":i.id,nameEn:i.nameEn||undefined}));expect(INSTITUTIONS.filter(i=>isListedCenter({...i,nameEn:i.nameEn||undefined}))).toEqual(before.filter(i=>i.id!==id));
 const nurseries=INSTITUTIONS.filter(i=>institutionDirectoryCategory(i)==="nursery");expect(filterInstitutions(nurseries,{}).some(i=>i.id===id)).toBe(false);
 for(const search of [source.nameAr,"الصباح النموذجية","Al Sabah Model Nursery","Al Sabah Model","Al Sabah Ideal Nursery"])expect(filterInstitutions([{...source,nameEn:"Al Sabah Model Nursery"}] as any,{search})).toEqual([]);
 for(const filters of [{governorate:"حولي"},{area:"بيان"},{disability:"all-as-reported"},{stage:"nursery"}])expect(filterInstitutions([source] as any,filters)).toEqual([]);
 expect(isListedCenter({id})).toBe(false);expect(isListedCenter({id:"backend:"+id})).toBe(false);expect(isListedCenter({id:"api-row",canonicalId:id})).toBe(false);
 expect(isListedCenter({id:"different-nursery",nameAr:source.nameAr})).toBe(true);expect(JSON.stringify(catalog)).toBe(snapshot);
});
