import catalog from './inclusivePlanDraftCatalog.preview.json';

// Preview data only: no API, task-generation or persistence imports.
export const draftCatalog = catalog;
export type DraftActivity = typeof catalog.variants[number];
export type SyntheticActivityProfile = {
 age: number; goalIds: string[]; preferredIds: string[];
 communication: string; participation: 'direct' | 'partner' | 'unknown';
 accessIds: string[]; accessConfirmed: boolean;
 willing: boolean; safeMaterials: boolean; establishedStopMethod: boolean;
};
export const initialSyntheticProfile: SyntheticActivityProfile = {
 age:7, goalIds:['communication'], preferredIds:[], communication:'speech',
 participation:'direct', accessIds:[], accessConfirmed:true,
 willing:true, safeMaterials:true, establishedStopMethod:true,
};
export function eligibleDraftActivities(profile: SyntheticActivityProfile): DraftActivity[] {
 if(!Number.isFinite(profile.age) || !profile.goalIds.length || !profile.communication ||
 !profile.willing || !profile.safeMaterials || !profile.establishedStopMethod ||
 !profile.accessConfirmed || profile.participation==='unknown' ||
 profile.accessIds.some(id=>!catalog.accessibilityOptions.some(a=>a.id===id))) return [];
 return catalog.variants.filter(a=>a.status==='NEW_DRAFT_REQUIRES_APPROVAL' &&
 profile.age>=a.ageYears[0] && profile.age<=a.ageYears[1] &&
 profile.goalIds.includes(a.familyId) &&
 profile.accessIds.every(id=>a.accessibilityOptionRefs.includes(id)))
 .sort((a,b)=>Number(profile.preferredIds.includes(b.sourceActivityId))-Number(profile.preferredIds.includes(a.sourceActivityId)));
}

