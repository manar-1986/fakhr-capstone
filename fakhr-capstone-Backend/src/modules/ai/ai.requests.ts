import { publicPrompt, AwarenessContext } from '../awarenessKnowledge/retrieval';
import { GeneralTopic, conversationSchema } from './conversation';
const FAKHR_INSTRUCTIONS = `You are Fakhr AI, an AI assistant inside the Fakhr application.

Fakhr supports parents and caregivers of children with disabilities.

Rules:
- Be supportive, clear, and practical.
- Answer in Arabic when the user writes in Arabic.
- Answer in English when the user writes in English.
- Do not provide medical diagnoses.
- Do not replace doctors, therapists, or qualified specialists.
- Do not claim that a child has a specific condition based on symptoms alone.
- For emergencies or serious health concerns, advise the user to contact an appropriate healthcare professional.
- Keep responses concise and suitable for a mobile application.`;
export const generalPrompts:Record<GeneralTopic,string>={
 development:'Explain child development and disability support in general, including the limits of developmental milestones and when to seek professional guidance. Do not infer any individual diagnosis.',
 activities:'Suggest several adaptable, low-risk play and educational activities with simple steps and options for different abilities. Do not assume a particular child age or diagnosis.',
 plans:'Provide an adaptable example weekly activity plan for families, balancing learning, play, rest and flexibility. It is not a treatment plan or a confirmed schedule.',
 products:'Explain how families can choose educational resources and accessible learning products. Give selection criteria without inventing products, availability, prices or providers.',
 sessions:'Explain how parents can prepare questions for therapy sessions and appointments and organize follow-up notes. Do not claim to book or confirm any appointment.',
 parenting:'Offer practical general parent and caregiver guidance, supportive communication and everyday routines without assuming private family circumstances.'
};
export function buildAIRequest(config: unknown) {
 const parsed=conversationSchema.parse(config);
 const locale=parsed.language||'en';
 const language=locale==='en'?'English':locale==='ar-KW'?'natural Kuwaiti Arabic':'Arabic';
 if(parsed.category==='general'){const topic=parsed.topic;return {...{model:'gpt-6-luna',store:false,
   instructions:FAKHR_INSTRUCTIONS+' Respond in '+language+'. Give general educational guidance only. Never recommend named institutions, invent contacts, determine admission eligibility, provide diagnoses or claim government accreditation. Do not ask for personal records. Do not add a Fakhr platform disclaimer; it is appended separately by the server when applicable.',
   input:generalPrompts[topic]},max_output_tokens:8000};}
 if(parsed.category==='awareness'){const ctx:AwarenessContext=parsed;return {...{model:'gpt-6-luna',store:false,
   instructions:FAKHR_INSTRUCTIONS+' Respond in '+(locale==='en'?'English':locale==='ar-KW'?'natural Kuwaiti Arabic':'Arabic')+'. Use only supplied evidence. Direct answer first, practical low-risk guidance next, referral advice last. Never claim all children behave alike, diagnose, prescribe drugs or doses, recommend forced exposure or individualized treatment. Never name or invent providers, contacts or qualifications. No links, sources, platform disclaimer or personal-data requests; the server adds sources and disclaimer.',
   input:publicPrompt(ctx,locale)},max_output_tokens:8000};}
 throw new Error('PUBLIC_TOPIC_REQUIRED');
}
