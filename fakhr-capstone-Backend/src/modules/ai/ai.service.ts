import { AwarenessContext, localIntroduction, sourceFooter, clearlyIrrelevantAwareness, prohibitedOutput, safeEducationalFallback } from '../awarenessKnowledge/retrieval';
import { GeneralTopic } from './conversation';
import { normalize } from '../directorySearch/recommendations';
import { localCriteria } from '../directorySearch/criteria';
import { withMedicalDisclaimer, stripMedicalDisclaimer } from '../assessmentKnowledge/assessment';
import { Criteria } from "../directorySearch/recommendations";
import { runBudgetedAI } from "./ai.transport";
import { ApiError } from "../../middlewares/apiError";

// The outbound payload contains only reviewed constants. Never interpolate user text,
// directory criteria, child data, identifiers, headers, or conversation history here.
export { generalPrompts } from "./ai.requests";
export function generalTopic(message:string):GeneralTopic|undefined {
 const q=normalize(message);
 if(/weekly|plan|خطه|جدول/.test(q))return 'plans';
 if(/activit|play|نشاط|انشط|لعب/.test(q))return 'activities';
 if(/product|resource|منتج|موارد|مصادر تعليميه/.test(q))return 'products';
 if(/session|appointment|جلس|موعد|مواعيد/.test(q))return 'sessions';
 if(/development|disabilit|نمو|تطور|اعاق/.test(q))return 'development';
 if(/parent|caregiv|guidance|اهل|والدين|ارشاد/.test(q))return 'parenting';
}
export function privacyLimitation(locale:string){return withMedicalDisclaimer(locale==='en'
 ? 'I cannot safely interpret this personal or unrecognized question without sharing its details. Please choose a general topic: development, activities, weekly plans, educational resources, sessions or parent guidance. Personal assessment requires a qualified specialist.'
 : 'لا أستطيع تفسير هذا السؤال الشخصي أو غير الواضح بأمان دون مشاركة تفاصيله. اختر موضوعاً عاماً: النمو، الأنشطة، الخطط الأسبوعية، الموارد التعليمية، الجلسات أو إرشاد الأهل. التقييم الشخصي يحتاج مختصاً.',locale);}
export async function askFakhrAI(topic:GeneralTopic, locale:string='en'):Promise<string>{
 try {
  const response=await runBudgetedAI({category:'general',topic,language:locale});
  const reply=response.output_text?.trim();
  if(!reply)throw ApiError.internal('AI assistant returned an empty response');
  const notice=locale==='en'?'Privacy: only a general topic was sent to AI; personal details were not shared. This guidance is not personalized.':'للخصوصية: أرسلنا موضوعاً عاماً فقط للذكاء الاصطناعي دون التفاصيل الشخصية. هذه إرشادات عامة غير مخصصة.';
  const answer=stripMedicalDisclaimer(reply)+'\n\n'+notice;
  return topic==='development'||topic==='sessions'?withMedicalDisclaimer(answer,locale):answer;
 }catch(error){
  if(error instanceof ApiError)throw error;
  // Never expose provider errors, request bodies or credentials.
  throw ApiError.internal('AI assistant is temporarily unavailable. Please try again.');
 }
}
export async function extractSchoolCriteria(question:string,previous?:Criteria){
 return {intent:'school' as const,criteria:localCriteria(question,previous)};
}

/** Selected public educational evidence only; never accepts a user narrative. */
export async function askAwarenessAI(ctx:AwarenessContext,locale:string):Promise<string>{
 try {
  const response=await runBudgetedAI({...ctx,language:locale});
  const reply=response.output_text?.trim();
  if(!reply)throw ApiError.internal('AI assistant returned an empty response');
  // URLs are supplied by the source registry, never accepted from generated prose.
  const clean=stripMedicalDisclaimer(prohibitedOutput(reply)||clearlyIrrelevantAwareness(stripMedicalDisclaimer(reply),ctx)?safeEducationalFallback(ctx,locale):reply).replace(/https?:\/\/[^\s)]+/g,'');
  return withMedicalDisclaimer([clean,localIntroduction(ctx,locale),sourceFooter(ctx,locale)].filter(Boolean).join('\n\n'),locale);
 }catch(error){if(error instanceof ApiError)throw error;throw ApiError.internal('AI assistant is temporarily unavailable. Please try again.');}
}
