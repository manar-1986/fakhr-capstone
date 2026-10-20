import catalog from "../data/institutions/catalog.json";
import {INSTITUTIONS,findInstitution,filterInstitutions,institutionDirectoryCategory} from "../utils/institutionDirectory";
import {isListedCenter} from "../utils/centerVisibility";
test("only Qudrat is hidden from nursery listings, searches and filters, preserving stored data",()=>{
 const id="kw-n-qudrat",source=catalog.institutions.find(i=>i.id===id)!;const snapshot=JSON.stringify(catalog);
 expect(source.nameAr).toBe("حضانة قدرات لذوي الاحتياجات الخاصة");expect(findInstitution(id)).toEqual(source);
 const before=INSTITUTIONS.filter(i=>isListedCenter({...i,id:i.id===id?"baseline":i.id,nameEn:i.nameEn||undefined}));expect(INSTITUTIONS.filter(i=>isListedCenter({...i,nameEn:i.nameEn||undefined}))).toEqual(before.filter(i=>i.id!==id));
 const nurseries=INSTITUTIONS.filter(i=>institutionDirectoryCategory(i)==="nursery");expect(filterInstitutions(nurseries,{}).some(i=>i.id===id)).toBe(false);
 for(const search of [source.nameAr,"قدرات","Qudrat Nursery","Qudrat","Qudrat Special Needs Nursery"])expect(filterInstitutions([{...source,nameEn:"Qudrat Nursery"}] as any,{search})).toEqual([]);
 for(const filters of [{governorate:"حولي"},{area:"حطين"},{disability:"all-as-reported"},{stage:"nursery"}])expect(filterInstitutions([source] as any,filters)).toEqual([]);
 expect(isListedCenter({id})).toBe(false);expect(isListedCenter({id:"backend:"+id})).toBe(false);expect(isListedCenter({id:"api-row",canonicalId:id})).toBe(false);
 expect(isListedCenter({id:"different-nursery",nameAr:source.nameAr})).toBe(true);expect(JSON.stringify(catalog)).toBe(snapshot);
});

test("Qudrat Early Intervention Center remains unchanged and publicly listed",()=>{
 const center=findInstitution("center-qudrat-early-intervention")!;
 expect(center.nameAr).toBe("مركز قدرات للتدخل المبكر");expect(isListedCenter({...center,nameEn:center.nameEn||undefined})).toBe(true);
 expect(filterInstitutions(INSTITUTIONS,{search:"Qudrat Early Intervention Center"})).toEqual([center]);expect(filterInstitutions(INSTITUTIONS,{search:"مركز قدرات للتدخل المبكر"})).toEqual([center]);
 expect(center.publicProfile?.phone).toBe("22280108");expect(center.mainImage).toBe("qudrat");
});
