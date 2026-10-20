import {z} from 'zod';
import {objectId,time,timezone} from '../dailyCare/contracts';
export const companionInput=z.object({childId:objectId,enabled:z.boolean(),quietStart:time,quietEnd:time,timezone,revision:z.number().int().min(-1),snoozes:z.array(z.object({key:z.string().regex(/^(activity|meal|care):[a-f0-9]{24}(?::\d{4}-\d{2}-\d{2})?$/i),scheduled:z.number().int().nonnegative().max(8640000000000000),until:z.number().int().nonnegative().max(8640000000000000)}).strict()).max(100)}).strict().refine(p=>new Set(p.snoozes.map(x=>x.key)).size===p.snoozes.length);
