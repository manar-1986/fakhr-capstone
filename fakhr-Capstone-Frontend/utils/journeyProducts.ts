import type { Child } from "../api/children.api";
import { asIdList } from "../constants/childProfileOptions";
import { HOME_PRODUCTS, type ProductSupportCategory } from "../constants/homeProducts";

/** Browsing relevance only: no clinical scores or treatment recommendations. */
export function journeyProductSuggestions(child?: Child) {
  const needs = [...asIdList(child?.areasOfFocus), ...asIdList(child?.diagnosis ?? child?.diagnoses), ...asIdList(child?.supportGoals)]
    .map(value => value.toLowerCase().replace(/[\u064B-\u065F]/g, "").replace(/[أإآ]/g, "ا"));
  const categories = new Set<ProductSupportCategory>();
  for (const need of needs) {
    if (/autism|asd|sensory|توحد|حسي/.test(need)) categories.add("autism-sensory");
    if (/speech|communication|^comm$|aac|نطق|تواصل/.test(need)) categories.add("communication");
    if (/mobility|physical|^motor$|حرك/.test(need)) categories.add("mobility");
    if (/development|delay|fine.?motor|skills|rehabilitation|نمائي|نمو|مهارات|دقيقة|تاهيل/.test(need)) categories.add("skills");
    if (/hearing|سمع/.test(need)) categories.add("hearing");
    if (/visual|بصر/.test(need)) categories.add("visual");
  }
  const score = (product: (typeof HOME_PRODUCTS)[number]) => product.supportCategories.filter(category => categories.has(category)).length;
  const personalized = HOME_PRODUCTS.some(product => score(product) > 0);
  const products = [...HOME_PRODUCTS].sort((a, b) => score(b) - score(a)).slice(0, 4);
  return { products, personalized };
}
