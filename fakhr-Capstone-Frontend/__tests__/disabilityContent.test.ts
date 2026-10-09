import { categoryContent, CATEGORY_PRODUCT_TAGS } from "../utils/disabilityContent";
import { INSTITUTIONS, institutionDirectoryCategory } from "../utils/institutionDirectory";
import { HOME_PRODUCTS } from "../constants/homeProducts";
test.each(["autism","adhd","intellectual","learning","motor","hearing","vision","speech","multiple"])("%s contains only explicitly tagged records and real product IDs",id=>{
 const data=categoryContent(id);
 for(const item of [...data.centers,...data.education]) { expect(item.disabilityTags).toContain(id); expect(INSTITUTIONS.find(x=>x.id===item.id)).toBe(item); }
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
