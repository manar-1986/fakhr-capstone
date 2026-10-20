import {Request,Response} from 'express';
/** No live adapter exists for the personalized Plan contract. Do not log its body. */
export function blockedPlanAI(_req:Request,res:Response){res.setHeader('Cache-Control','no-store');res.status(503).json({success:false,code:'PLAN_AI_LIVE_BLOCKED'});}
