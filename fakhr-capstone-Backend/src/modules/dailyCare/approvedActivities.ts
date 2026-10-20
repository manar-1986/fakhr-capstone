import {z} from 'zod';
import mongoose from 'mongoose';
import Child from '../../models/Child.model';
const text=z.object({ar:z.string().min(1),en:z.string().min(1)}).strict();
// Publication is explicit and independently reviewed; missing bilingual fields fail closed.
export const approvedActivity=z.object({
 activityId:z.string().min(1).max(80),title:text,goal:text,description:text,
 steps:z.array(text).min(1),duration:text,adaptations:z.array(text).min(1),
 safety:text,participationObservation:text,skills:text.optional(),materials:text.optional(),
 ageYears:z.tuple([z.number().int().min(0),z.number().int().max(120)]),
 goalIds:z.array(z.string()).min(1),
}).strict();
export async function approvedForChild(parentId:string,childId:string){
 const child=await Child.findOne({_id:childId,parentId}).select('age dateOfBirth supportGoals');
 if(!child)return [];
 let goals:string[]=[];try{const value=JSON.parse(child.supportGoals||'[]');if(Array.isArray(value)&&value.every(v=>typeof v==='string'))goals=value}catch{/* Unstructured goals need explicit mapping; never guess. */}
 let age=child.age;
 if(child.dateOfBirth){const birth=new Date(child.dateOfBirth),now=new Date();if(!isNaN(+birth))age=now.getUTCFullYear()-birth.getUTCFullYear()-Number(now.getUTCMonth()<birth.getUTCMonth()||(now.getUTCMonth()===birth.getUTCMonth()&&now.getUTCDate()<birth.getUTCDate()))}
 if(age===undefined||!goals.length)return [];
 const templates=await mongoose.connection.collection('carepathtemplates').find({publicationStatus:'approved'},{projection:{catalogVersion:1,approvedActivities:1}}).limit(51).maxTimeMS(5000).toArray();
 if(templates.length>50)throw new Error('CATALOG_LIMIT');
 return templates.flatMap(t=>{
  if(typeof t.catalogVersion!=='string'||!Array.isArray(t.approvedActivities)||t.approvedActivities.length>100)return [];
  return t.approvedActivities.flatMap((a:any)=>{
   const p=approvedActivity.safeParse(a);if(!p.success)return [];
   const v=p.data;if(age!<v.ageYears[0]||age!>v.ageYears[1]||!v.goalIds.some(g=>goals.includes(g)))return [];
   return [{...v,templateId:String(t._id),catalogVersion:t.catalogVersion}];
  });
 });
}
