import { expect, test } from "@jest/globals";
import { journeyProductSuggestions } from "../utils/journeyProducts";
import { HOME_PRODUCTS } from "../constants/homeProducts";
import type { Child } from "../api/children.api";
const child = (data: Partial<Child>): Child => ({ id: "test-child", name: "Test", parentId: "test-parent", ...data });
test("missing profile returns existing general products without modifying the catalog", () => {
  const result = journeyProductSuggestions();
  expect(result.personalized).toBe(false);
  expect(result.products).toEqual(HOME_PRODUCTS.slice(0, 4));
  expect(result.products.every(product => HOME_PRODUCTS.includes(product))).toBe(true);
});
test.each([
  [{ diagnosis: "التوحد" }, "autism-sensory"],
  [{ areasOfFocus: ["sensory"] }, "autism-sensory"],
  [{ supportGoals: ["comm"] }, "communication"],
  [{ diagnosis: "تأخر نمائي" }, "skills"],
  [{ diagnosis: "Fine motor needs" }, "skills"],
  [{ areasOfFocus: ["motor"] }, "mobility"],
  [{ diagnosis: "الإعاقة الحركية" }, "mobility"],
] as [Partial<Child>, string][])("prioritizes support categories for %p", (data, category) => {
  const result = journeyProductSuggestions(child(data as Partial<Child>));
  expect(result.personalized).toBe(true);
  expect(result.products[0].supportCategories).toContain(category);
});
test("multiple needs are ranked together and unsupported tags use general products", () => {
  const result = journeyProductSuggestions(child({ areasOfFocus: ["sensory"], diagnosis: ["developmental delay"] }));
  expect(result.products[0].id).toBe("p-7");
  expect(journeyProductSuggestions(child({ diagnosis: "unknown" })).personalized).toBe(false);
});
