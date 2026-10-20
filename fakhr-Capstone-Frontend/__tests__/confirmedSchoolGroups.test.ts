import catalog from "../data/institutions/catalog.json";
import type {Institution} from "../types/institution";
import {consolidateConfirmedSchools,CONFIRMED_SCHOOL_GROUPS} from "../utils/confirmedSchoolGroups";
import {findInstitution,filterInstitutions,INSTITUTIONS,institutionPhoneUrl} from "../utils/institutionDirectory";
test("only confirmed groups consolidate, with immutable exact branch data and working old IDs",()=>{
 const source=catalog.institutions as Institution[];const snapshot=JSON.stringify(source);const result=consolidateConfirmedSchools(source);
 expect(JSON.stringify(source)).toBe(snapshot);expect(result).toHaveLength(source.length-CONFIRMED_SCHOOL_GROUPS.reduce((count,group)=>count+group.ids.length-1,0));
 const ids=CONFIRMED_SCHOOL_GROUPS.flatMap(g=>g.ids);
 expect(result.filter(i=>!ids.includes(i.id))).toEqual(source.filter(i=>!ids.includes(i.id)));
 for(const group of CONFIRMED_SCHOOL_GROUPS){const merged=findInstitution(group.ids[0])!;
 expect(merged.nameAr).toBe(group.ar);expect(merged.nameEn).toBe(group.en);
 expect(merged.branches).toEqual(group.ids.map(id=>source.find(i=>i.id===id)));
 expect(findInstitution(group.ids[1])).toBe(merged);
 expect(filterInstitutions(INSTITUTIONS,{search:group.ar})).toEqual([merged]);if(group.en)expect(filterInstitutions(INSTITUTIONS,{search:group.en})).toEqual([merged]);
 expect(institutionPhoneUrl(merged.publicProfile!.phone!)).toMatch(/^tel:/);
 }
 for(const id of ["kw-s-nebras-special","kw-s-nebras-int","kw-s-gulf","kw-s-gulf-american"])expect(findInstitution(id)).toEqual(source.find(i=>i.id===id));
});

test("Bait Nasser keeps all seven numbers, three source records and historical references",()=>{
 const ids=["kw-n-nasser","kw-n-nasser-2","kw-n-nasser-3"];const raw=(catalog.institutions as Institution[]).filter(i=>ids.includes(i.id));const merged=findInstitution(ids[0])!;
 expect(raw).toHaveLength(3);expect(merged.categories).toEqual(["nursery"]);expect(merged.branches).toEqual(ids.map(id=>raw.find(i=>i.id===id)));
 for(const id of ids)expect(findInstitution(id)).toBe(merged);
 expect(INSTITUTIONS.filter(i=>ids.includes(i.id))).toEqual([merged]);
 expect([merged.publicProfile!.phone,...merged.publicProfile!.extraPhones!.map(p=>p.phone)]).toEqual(["22259590","60050735","96926826","55081912","62220012","55916205","64445953"]);
 expect(new Set(merged.observations.flatMap(o=>o.phones))).toEqual(new Set(raw.flatMap(i=>i.observations.flatMap(o=>o.phones))));
 for(const query of ["بيت ناصر","بيت ناصر 2","بيت ناصر 3","Bait Nasser"])expect(filterInstitutions(INSTITUTIONS,{search:query})).toEqual([merged]);
});

test("Al Heba retains both complete records, all contacts and old references",()=>{
 const primary=(catalog.institutions as Institution[]).find(i=>i.id==="kw-n-heba")!;const secondary=(catalog.institutions as Institution[]).find(i=>i.id==="kw-n-heba-2")!;const merged=findInstitution(primary.id)!;
 expect(merged.nameEn).toBe(primary.nameEn);expect(merged.branches).toEqual([primary,secondary]);expect(findInstitution(secondary.id)).toBe(merged);expect(merged.categories).toEqual(["nursery"]);
 expect(INSTITUTIONS.filter(i=>[primary.id,secondary.id].includes(i.id))).toEqual([merged]);expect(filterInstitutions(INSTITUTIONS,{search:"الهبة"})).toEqual([merged]);expect(filterInstitutions(INSTITUTIONS,{search:"الهبة 2"})).toEqual([merged]);
 expect([merged.publicProfile!.phone,...merged.publicProfile!.extraPhones!.map(p=>p.phone)]).toEqual(["97446577","97446477","51142276"]);
 expect(merged.observations).toEqual([...primary.observations,...secondary.observations]);expect(merged.branches![1].sourceExtras?.email).toBe("Alheba2nursery@gmail.com");
});

test("Al Maha retains exact original records and every phone with canonical references",()=>{
 const primary=(catalog.institutions as Institution[]).find(i=>i.id==="kw-n-maha")!;const secondary=(catalog.institutions as Institution[]).find(i=>i.id==="kw-n-maha-2")!;const merged=findInstitution(primary.id)!;
 expect(merged.branches).toEqual([primary,secondary]);expect(merged.observations).toEqual([...primary.observations,...secondary.observations]);expect(findInstitution(secondary.id)).toBe(merged);expect(INSTITUTIONS.filter(i=>[primary.id,secondary.id].includes(i.id))).toEqual([merged]);
 for(const search of ["المها","المها 2","Al Maha"])expect(filterInstitutions(INSTITUTIONS,{search})).toEqual([merged]);
 expect([merged.publicProfile!.phone,...merged.publicProfile!.extraPhones!.map(p=>p.phone)]).toEqual(["50999405","66569293","60484449"]);expect(merged.publicProfile!.branchLocations!.every(b=>!b.mapUrl&&!!b.verificationNote)).toBe(true);
});

test("Insan retains both complete source records and resolves the hidden ID",()=>{
 const raw=(catalog.institutions as Institution[]).filter(i=>i.id.startsWith("kw-n-insan"));const merged=findInstitution("kw-n-insan-1")!;
 expect(raw).toHaveLength(2);expect(merged.branches).toEqual(raw);expect(merged.observations).toEqual(raw.flatMap(i=>i.observations));expect(findInstitution("kw-n-insan-2")).toBe(merged);
 expect(INSTITUTIONS.filter(i=>i.id.startsWith("kw-n-insan"))).toEqual([merged]);for(const search of ["إنسان","انسان 2","Insan"])expect(filterInstitutions(INSTITUTIONS,{search})).toEqual([merged]);
 expect(new Set(merged.observations.flatMap(o=>o.phones))).toEqual(new Set(["60041147","60031132","65502770","23908080","52226632","99721356"]));
 expect(merged.mainImage).toBe("insan");expect(merged.publicProfile!.branchLocations!.map(b=>b.mapUrl)).toEqual(["https://maps.app.goo.gl/SBwhg6hjmAsMGnmh8","https://maps.app.goo.gl/PDFoXyqmrarNgdE5A"]);
});
