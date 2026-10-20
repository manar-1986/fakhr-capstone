import catalog from "../data/institutions/catalog.json";
import {INSTITUTIONS,findInstitution,filterInstitutions,institutionDirectoryCategory} from "../utils/institutionDirectory";
import {isListedCenter} from "../utils/centerVisibility";
test("only Portage is hidden from nursery listings, searches and filters, preserving stored data",()=>{
 const id="kw-n-portage",source=catalog.institutions.find(i=>i.id===id)!;const snapshot=JSON.stringify(catalog);
 expect(source.nameAr).toBe("حضانة بورتج للاحتياجات الخاصة");expect(findInstitution(id)).toEqual(source);
 const before=INSTITUTIONS.filter(i=>isListedCenter({...i,id:i.id===id?"baseline":i.id,nameEn:i.nameEn||undefined}));expect(INSTITUTIONS.filter(i=>isListedCenter({...i,nameEn:i.nameEn||undefined}))).toEqual(before.filter(i=>i.id!==id));
 const nurseries=INSTITUTIONS.filter(i=>institutionDirectoryCategory(i)==="nursery");expect(filterInstitutions(nurseries,{}).some(i=>i.id===id)).toBe(false);
 for(const search of [source.nameAr,"بورتج","Portage Nursery","Portage","Portage Special Needs Nursery"])expect(filterInstitutions([{...source,nameEn:"Portage Nursery"}] as any,{search})).toEqual([]);
 for(const filters of [{governorate:"مبارك الكبير"},{area:"العدان"},{disability:"all-as-reported"},{stage:"nursery"}])expect(filterInstitutions([source] as any,filters)).toEqual([]);
 expect(isListedCenter({id})).toBe(false);expect(isListedCenter({id:"backend:"+id})).toBe(false);expect(isListedCenter({id:"api-row",canonicalId:id})).toBe(false);
 expect(isListedCenter({id:"different-nursery",nameAr:source.nameAr})).toBe(true);expect(JSON.stringify(catalog)).toBe(snapshot);
});

test("Unrelated Portage-program providers stay visible",()=>{

 expect(isListedCenter({id:"unrelated-provider",nameEn:"Portage educational program provider"})).toBe(true);
});
