import { categoryContent, hasApprovedCategoryLink, categoryServiceCards, CATEGORY_PRODUCT_TAGS, hasCategoryService, hasProfessionalCategoryService } from "../utils/disabilityContent";
import { INSTITUTIONS, institutionDirectoryCategory } from "../utils/institutionDirectory";
import { HOME_PRODUCTS } from "../constants/homeProducts";
test.each(Object.keys(CATEGORY_PRODUCT_TAGS))("%s contains only explicitly tagged records and real product IDs",id=>{
 const data=categoryContent(id);
 for(const item of [...data.centers,...data.education]) { expect(hasApprovedCategoryLink(item,id)).toBe(true); expect(INSTITUTIONS.find(x=>x.id===item.id)).toBe(item); }
 for(const item of data.centers) expect(institutionDirectoryCategory(item)).toBe("rehabilitation");
 for(const item of data.education) expect(institutionDirectoryCategory(item)).not.toBe("rehabilitation");
 for(const product of data.products) {expect(HOME_PRODUCTS.find(x=>x.id===product.id)).toBe(product);expect(product.supportCategories.some(tag=>CATEGORY_PRODUCT_TAGS[id].includes(tag))).toBe(true);}
});
test("category, search and location filters never substitute unrelated records",()=>{
 expect(categoryContent("speech").products.map(x=>x.id)).toContain("p-2");
 expect(categoryContent("motor").products.map(x=>x.id)).toContain("p-1");
 expect(categoryContent("autism").products.map(x=>x.id)).not.toContain("p-1");
 expect(categoryContent("missing").centers).toEqual([]);
 expect(categoryContent("speech","zzzz").products).toEqual([]);
 const data=categoryContent("autism");for(const area of data.areas){for(const item of categoryContent("autism","",area).centers)expect(item.observations.some(o=>o.areaAr===area)).toBe(true);}
 expect(categoryContent("motor","wheelchair").products.map(x=>x.id)).toEqual(["p-1"]);
 expect(categoryContent("motor","كرسي").products.map(x=>x.id)).toEqual(["p-1"]);
});

 test("professional links preserve public identities and category-specific evidence", () => {
  const { PUBLIC_DOCTORS } = require("../constants/approvedDoctors");
  for (const id of Object.keys(CATEGORY_PRODUCT_TAGS)) {
   for (const doctor of categoryContent(id).professionals) expect(PUBLIC_DOCTORS).toContain(doctor);
   expect(categoryContent(id,"unmatched-query").professionals).toEqual([]);
   expect(categoryContent(id,"","unknown-area").professionals).toEqual([]);
  }
  expect(categoryContent("vision").professionals.length).toBeGreaterThan(0);
  expect(categoryContent("missing").professionals).toEqual([]);
 });

test("service evidence cannot be inferred from disability tags or a provider name", () => {
 const item=INSTITUTIONS[0];
 expect(hasCategoryService({...item, nameAr:"مركز النطق",disabilityTags:["speech"],publicProfile:undefined},"speech")).toBe(false);
 expect(hasCategoryService({...item,publicProfile:{services:{ar:["العلاج الوظيفي"],en:["Occupational therapy"]}}},"ot")).toBe(true);
 expect(hasCategoryService({...item,publicProfile:{services:{ar:["العلاج الوظيفي"],en:["Occupational therapy"]}}},"speech")).toBe(false);
});

test("audit all category matches",()=>{
 for(const id of Object.keys(CATEGORY_PRODUCT_TAGS)){
 const d=categoryContent(id);
 expect(d.professionals.some(x=>["psychology","clinical-nutrition","child-adolescent-mental-health"].includes(x.group))).toBe(false);
 }
});

test("psychological counseling and CBT do not count as behavioral intervention",()=>{
 const item={...INSTITUTIONS[0],publicProfile:{services:{ar:["العلاج المعرفي السلوكي"],en:["Cognitive behavioral therapy","Psychological counseling"]}}};
 expect(hasCategoryService(item,"behavior")).toBe(false);
 expect(hasCategoryService({...item,publicProfile:{services:{ar:["تحليل السلوك التطبيقي"],en:["Applied behavior analysis"]}}},"behavior")).toBe(true);
 const providers=categoryContent("autism").professionals;
 expect(providers.filter(d=>d.group==="aba").length).toBeGreaterThan(0);
 for(const doctor of providers.filter(d=>d.group==="aba")) {
  expect(hasProfessionalCategoryService(doctor,"behavior")).toBe(true);
  expect(hasProfessionalCategoryService(doctor,"ot")).toBe(false);
  expect(hasProfessionalCategoryService(doctor,"speech")).toBe(false);
 }
 for(const id of Object.keys(CATEGORY_PRODUCT_TAGS)) {
  const d=categoryContent(id);
  expect(new Set([...d.centers,...d.professionals].map(x=>x.id)).size).toBe(d.centers.length+d.professionals.length);
 }
});

const expectedServiceCounts: Record<string, number> = {autism:4,adhd:4,intellectual:1,learning:4,motor:2,hearing:4,vision:2,speech:4,multiple:1,down:1,developmental:4,mental:1};
test.each(Object.keys(expectedServiceCounts))("%s service count reflects real evidence, not a four-card quota", id => {
 const data=categoryContent(id);const cards=categoryServiceCards(id,data);
 expect(cards.length+(data.education.length?1:0)).toBe(expectedServiceCounts[id]);
 expect(new Set(cards.map(c=>c.query)).size).toBe(cards.length);
 expect(categoryServiceCards(id,categoryContent(id,"unmatched-query"))).toEqual([]);
 for(const area of data.areas) for(const card of categoryServiceCards(id,categoryContent(id,"",area))) {
  const filtered=categoryContent(id,"",area);
  expect(filtered.centers.some(i=>hasCategoryService(i,card.query))||filtered.professionals.some(i=>hasProfessionalCategoryService(i,card.query))).toBe(true);
 }
});
test("category-specific support uses documented qualifications and service descriptions",()=>{
 expect(categoryServiceCards("learning",categoryContent("learning")).map(c=>c.query)).toContain("early");
 expect(categoryServiceCards("hearing",categoryContent("hearing")).map(c=>c.query)).toEqual(["hearing","speech","ot"]);
 expect(categoryServiceCards("vision",categoryContent("vision")).map(c=>c.query)).toEqual(["vision"]);
 expect(categoryServiceCards("motor",categoryContent("motor")).map(c=>c.query)).toEqual(["mobility"]);
 expect(hasCategoryService({...INSTITUTIONS[0],publicProfile:undefined},"early")).toBe(false);
});

test("approved links preserve source identities, eligibility and deferred exclusions",()=>{
 const expected: Record<string,string[]>={developmental:["center-qudrat-early-intervention","center-kcld","center-first-step"],intellectual:["kw-n-insan-1","kw-r-integrated"],motor:["kw-n-insan-1","kw-r-day-hawalli"],multiple:["kw-n-nada"],mental:["kw-n-basma"]};
 for(const [category,ids] of Object.entries(expected)){
  const data=categoryContent(category);
  for(const id of ids){const record=[...data.centers,...data.education].find(i=>i.id===id);expect(record).toBe(INSTITUTIONS.find(i=>i.id===id));}
  expect(data.centers.some(i=>["center-kdc","center-roa-childhood","center-special-reem"].includes(i.id))).toBe(false);
 }
 expect(categoryContent("mental").education.map(i=>i.id)).toEqual(["kw-n-basma"]);
 expect(categoryContent("mental").centers).toEqual([]);expect(categoryContent("mental").professionals).toEqual([]);
 const d=categoryContent("developmental");expect(d.professionals.map(i=>i.id)).toContain("doctor-hadeel-yassin-faras");
 const hadeel=d.professionals.find(i=>i.id==="doctor-hadeel-yassin-faras")!;
 for(const service of ["speech","ot","behavior"])expect(hasProfessionalCategoryService(hadeel,service)).toBe(false);
 expect(categoryServiceCards("down",categoryContent("down"))).toEqual([]);
});
test("approved links cannot bypass visibility, branch identity, search or location",()=>{
 const source=INSTITUTIONS.find(i=>i.id==="kw-r-day-hawalli")!;
 expect(hasApprovedCategoryLink({...source,id:"unapproved-branch",disabilityTags:[]},"motor")).toBe(false);
 expect(categoryContent("motor","","unrecorded area").education).toEqual([]);
 expect(categoryContent("motor","zzzz").education).toEqual([]);
 const hidden={...source,id:"kw-r-day-jahra",disabilityTags:["motor"]};
 expect(categoryContent("motor","","",[hidden]).education).toEqual([]);
 for(const id of ["intellectual","motor","multiple","mental"]){for(const record of categoryContent(id).education.filter(i=>["kw-n-insan-1","kw-r-integrated","kw-r-day-hawalli","kw-n-nada","kw-n-basma"].includes(i.id))){expect(categoryContent(id).centers).not.toContain(record);}}
});
