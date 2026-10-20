export type SchoolCriteria = { specialistMemory?: { practitionerPreference?: 'female'|'male'|null; services: string[]; specialistSearch?: boolean }; specialistSearch?: boolean; practitionerPreference?: 'female'|'male'|null; disabilities: string[]; age: number|null; stage: string|null; governorate: string|null; area: string|null; services: string[] };
export type SchoolContext =
  | { category: 'awareness'; topicIds: string[]; intent?: 'explain'|'support'|'signs'|'evaluation'; categoryId?: 'autism'|'down'|'intellectual'|'adhd'|'learning'|'speech'|'hearing'|'vision'|'cerebralPalsy'|'physical'|'delay'|'multiple'|'sensory'; language?: 'ar'|'ar-KW'|'en' }
  | { category: 'school'|'doctor'|'rehabilitation'|'nursery'|'sports'; criteria: SchoolCriteria; language?: 'ar'|'ar-KW'|'en' }
  | { category: 'assessment'; language?: 'ar'|'ar-KW'|'en' }
  | { category: 'general'; topic: 'development'|'activities'|'plans'|'products'|'sessions'|'parenting'; language?: 'ar'|'ar-KW'|'en' };
export type DirectoryRecommendation = { category:'school'|'doctor'|'rehabilitation'|'nursery'|'sports'; id:string; branchIds:string[]; verification?: 'verified'|'inquiry'; evidence: {branchId:string;sourceId:string;page:number;needs:string;ages:string|null;stage:string|null;area:string|null;governorate:string|null;services:string[]; verification?:'verified'|'inquiry'; reasons?:string[]}[] };
