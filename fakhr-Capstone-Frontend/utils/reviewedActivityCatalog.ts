export type ReviewedActivity = {id:string;titleAr:string;titleEn:string;goalAr:string;goalEn:string;descriptionAr:string;descriptionEn:string;instructionsAr:string;instructionsEn:string;durationAr:string;durationEn:string;goalIds:string[];minAge:number;maxAge:number;preferenceIds:string[]};
// No complete approved catalog was found. Never promote preview titles into approved content.
export const reviewedActivities:ReviewedActivity[]=[];
export function suitableActivities(catalog:ReviewedActivity[],profile:{goalIds:string[];age?:number;preferenceIds:string[]}) {
 if(profile.age===undefined||!Number.isFinite(profile.age)||!profile.goalIds.length)return [];
 return catalog.filter(a=>a.goalIds.some(g=>profile.goalIds.includes(g))&&profile.age!>=a.minAge&&profile.age!<=a.maxAge&&(!a.preferenceIds.length||a.preferenceIds.some(p=>profile.preferenceIds.includes(p))));
}
export const previewActivityTitles=[
 {id:'preview-choice',titleAr:'أختار ما أحب',titleEn:'I choose what I like'},
 {id:'preview-book',titleAr:'نكتشف كتابًا معًا',titleEn:'We explore a book together'},
 {id:'preview-help',titleAr:'أطلب المساعدة أو الاستراحة',titleEn:'I ask for help or a break'},
];
