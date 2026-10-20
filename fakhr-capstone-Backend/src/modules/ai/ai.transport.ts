import OpenAI from 'openai';
import { getEncoding } from 'js-tiktoken';
import { buildAIRequest } from './ai.requests';
import { ApiError } from '../../middlewares/apiError';
import { AI_POLICY, reserveAI, claimAI, completeAI } from './ai.budget';

const encoding=getEncoding('o200k_base');
/** The sole production OpenAI dispatch path; no caller-supplied model, URLs, prompts or credentials. */
export async function runBudgetedAI(config: unknown): Promise<{output_text:string}> {
  try {
    const body={...buildAIRequest(config),service_tier:'default' as const};
    if(process.env.FAKHR_AI_ENABLED!=='true' || !process.env.FAKHR_AI_OPENAI_API_KEY) throw new Error('AI_DISABLED');
    // Include a conservative framing allowance; server-reported usage is checked before releasing the dispatch lock.
    const inputTokens=encoding.encode(body.instructions).length+encoding.encode(body.input).length+512;
    if(body.model!=='gpt-6-luna' || body.store!==false || body.max_output_tokens!==AI_POLICY.outputTokens ||
       inputTokens>AI_POLICY.inputTokens || Buffer.byteLength(body.instructions+body.input,'utf8')>AI_POLICY.inputBytes) throw new Error('TOKEN_LIMIT');
    const client=new OpenAI({
      apiKey:process.env.FAKHR_AI_OPENAI_API_KEY, baseURL:'https://api.openai.com/v1',
      maxRetries:0, timeout:AI_POLICY.timeoutMs, logLevel:'off',
    });
    const token=await reserveAI(body);
    await claimAI(token,body);
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),AI_POLICY.timeoutMs);
    try {
      // Await transport settlement rather than racing a timeout and releasing the budget lock early.
      const response=await client.responses.create(body,{signal:controller.signal});
      if(controller.signal.aborted || response.status!=='completed' || !response.output_text?.trim() || !response.usage)
        throw new Error('INCOMPLETE_RESPONSE');
      await completeAI(token,response.usage.input_tokens,response.usage.output_tokens);
      return {output_text:response.output_text};
    } finally {clearTimeout(timer);}
  } catch {
    // Never forward SDK errors, headers, prompts, credentials or response bodies to logs/clients.
    throw new ApiError(503,'Budget-controlled AI is unavailable, disabled, or awaiting review');
  }
}



