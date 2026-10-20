import catalog from './inclusivePlanDraftCatalog.preview.json';
export function previewActivities(age?:number){return catalog.variants.filter(a=>age!==undefined&&a.ageYears[0]<=age&&a.ageYears[1]>=age).map(a=>({...a,activityId:a.id,duration:catalog.timingPolicy.duration,adaptations:catalog.accessibilityOptions.filter(x=>a.accessibilityOptionRefs.includes(x.id)).map(x=>x.content)}))}
