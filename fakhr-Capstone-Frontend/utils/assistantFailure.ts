import type { ApiFailure } from './minimumRelease';
export function assistantFailure(error:ApiFailure,ar:boolean):string {
 if(error.status===401||error.code==='SESSION_CHANGED')return ar?'انتهت الجلسة. سجل الدخول مجدداً.':'Your session ended. Please sign in again.';
 if(error.code==='FEATURE_DISABLED')return ar?'المساعد غير متاح حالياً.':'The assistant is currently unavailable.';
 if(error.status===429 || error.retryAfterSeconds!==undefined){
  const seconds=error.retryAfterSeconds;
  return seconds!==undefined ? (ar?`يرجى الانتظار ${seconds} ثانية قبل المحاولة مجدداً.`:`Please wait ${seconds} seconds before trying again.`) : (ar?'بلغت حد الطلبات. حاول لاحقاً.':'Request limit reached. Please try later.');
 }
 if(error.status===400)return ar?'تحقق من رسالتك؛ الحد الأقصى ٢٠٠٠ حرف.':'Check your message; the maximum is 2,000 characters.';
 return ar?'تعذر الحصول على رد. لم يتم تأكيد إجابة؛ حاول لاحقاً.':'No answer was confirmed. The assistant is temporarily unavailable; try later.';
}
