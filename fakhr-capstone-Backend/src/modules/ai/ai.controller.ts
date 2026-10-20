import { selectAwareness, educationalQuestion, urgentResponse, evidenceFor, asksForProvider, awarenessLimitation } from '../awarenessKnowledge/retrieval';
import { conversationSchema } from './conversation';
import { conversationLanguage, schoolResponse, schoolDisclaimer } from "../directorySearch/recommendations";
import { Response, NextFunction } from "express";
import { ApiError } from "../../middlewares/apiError";
import { HTTP_STATUS } from "../../config/constants";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { askFakhrAI, askAwarenessAI, generalTopic, privacyLimitation } from "./ai.service";
import { directoryIntent, categoryCriteria, localCriteria, ambiguousCriteria, disabilityAliases, matches, directoryFollowUp } from '../directorySearch/criteria';
import { providerResponse, providerEligibilityNotice } from '../directorySearch/providers';
import { assessmentIntent, assessmentFollowUp, assessmentResponse, withMedicalDisclaimer } from '../assessmentKnowledge/assessment';

const MAX_QUESTION_LENGTH = 2000;

function readQuestion(body: { question?: unknown; message?: unknown }): string {
  const raw = body.question ?? body.message;

  if (raw === undefined || raw === null || raw === "") {
    throw ApiError.badRequest("Question is required");
  }

  if (typeof raw !== "string") {
    throw ApiError.badRequest("Question must be a string");
  }

  const question = raw.trim();

  if (!question) {
    throw ApiError.badRequest("Question must be a non-empty string");
  }

  if (question.length > MAX_QUESTION_LENGTH) {
    throw ApiError.badRequest(
      `Question is too long. Maximum ${MAX_QUESTION_LENGTH} characters allowed`
    );
  }

  return question;
}

/**
 * Ask the Fakhr AI assistant
 * POST /api/ai/ask
 */
export const askAI = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized("User not authenticated");
    }

    const question = readQuestion(req.body);
    const parsedContext = req.body.schoolContext === undefined ? undefined : conversationSchema.safeParse(req.body.schoolContext);
    if(parsedContext && !parsedContext.success)throw ApiError.badRequest("Invalid directory search context");
    const context=parsedContext?.success?parsedContext.data:undefined;
    const locale=conversationLanguage(question,context?.language,req.body.locale);
    const send=(data:any)=>res.status(200).json({success:true,data:{...data,language:locale,timestamp:new Date().toISOString()}});
    const urgent=urgentResponse(question,locale);
    if(urgent){send({answer:urgent,status:'urgent_guidance',schoolContext:null});return;}
    const awareness=selectAwareness(question,context?.category==='awareness'?context:undefined);
    const explicitDirectory=directoryIntent(question);
    const generalIntent=generalTopic(question);
    // Explicit provider requests win; educational questions must not inherit a stale directory intent.
    if(awareness && !assessmentIntent(question) && (!explicitDirectory || (educationalQuestion(question)&&!asksForProvider(question))) && (!generalIntent || generalIntent==='development') && (educationalQuestion(question)||!('criteria' in (context||{}))||context?.category==='awareness')){
      const state={...awareness,language:locale};
      send({answer:await askAwarenessAI(state,locale),schoolContext:state,status:'educational_guidance',awareness:evidenceFor(state)});return;
    }
    if(assessmentIntent(question)||(context?.category==='assessment'&&!directoryIntent(question)&&assessmentFollowUp(question))){send(assessmentResponse(question,locale));return;}
    const directoryContext=context && 'criteria' in context?context:undefined;
    const intent=directoryIntent(question);
    const fresh=localCriteria(question);
    const followUp=!!(Object.values(disabilityAliases).some(terms=>matches(question,terms))||fresh.disabilities.length||fresh.services.length||fresh.age!==null||fresh.stage||fresh.area||fresh.governorate);
    const general=generalTopic(question);
    const category=intent||(((!general||general==='development')&&(followUp||directoryFollowUp(question)))?directoryContext?.category:undefined);
    if(category){
      if(ambiguousCriteria(question)){const answer=locale==='en'?'Please clarify the exact age to avoid assuming eligibility.':'يرجى توضيح العمر بدقة حتى لا نفترض الأهلية.';send({answer:category==='doctor'||category==='rehabilitation'?withMedicalDisclaimer(answer,locale):answer+'\n\n'+(category==='school'?schoolDisclaimer(locale):providerEligibilityNotice(locale)),recommendations:[],schoolContext:{category,criteria:categoryCriteria('',category,directoryContext),language:locale},status:'follow_up'});return;}
      const criteria=categoryCriteria(question,category,directoryContext);
      if(category==='school'){
        const result=schoolResponse(criteria,locale);
        if(/therapy|treatment|علاج/i.test(question))result.answer=withMedicalDisclaimer(result.answer,locale);
        send(result);return;
      }
      const result=providerResponse({category,criteria,language:locale});
      if(category==='doctor'||category==='rehabilitation'||/therapy|treatment|علاج/i.test(question))result.answer=withMedicalDisclaimer(result.answer,locale);
      send(result);return;
    }
    const topic=generalTopic(question)||(context?.category==='general'&&/^(?:more|continue|examples?|tell me more|كمل|المزيد|امثله|وضح اكثر)[.!؟?]*$/i.test(question.trim())?context.topic:undefined);
    const answer=topic?await askFakhrAI(topic,locale):educationalQuestion(question)?awarenessLimitation(locale):privacyLimitation(locale);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        answer,
        schoolContext: topic?{category:'general',topic,language:locale}:null,
        language: locale,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};
