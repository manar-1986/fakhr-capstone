import { topics as awarenessTopics, categories as awarenessCategories } from '../awarenessKnowledge/topics';
import { z } from 'zod';
import { directoryContextSchema } from '../directorySearch/criteria';
export const topics=['development','activities','plans','products','sessions','parenting'] as const;
export type GeneralTopic=typeof topics[number];
const language=z.enum(['ar','ar-KW','en']).optional();
export const conversationSchema=z.union([directoryContextSchema,
 z.object({category:z.literal('awareness'),intent:z.enum(['explain','support','signs','evaluation']).optional(),topicIds:z.array(z.string().refine(id=>Object.prototype.hasOwnProperty.call(awarenessTopics,id))).min(1).max(3),categoryId:z.enum(Object.keys(awarenessCategories) as [keyof typeof awarenessCategories,...(keyof typeof awarenessCategories)[]]).optional(),language}).strict(),
 z.object({category:z.literal('assessment'),language}).strict(),
 z.object({category:z.literal('general'),topic:z.enum(topics),language}).strict()]);
