export interface AwarenessEvidence {
 version: string;
 status: string;
 checkedAt: string;
 claims?: unknown[];
 sources: { id: string; title: string; url: string; verification: {
  checkedAt: string | null; status: string; clinicalReview: string; note: string;
 } }[];
}

/** Fail closed: malformed metadata must never remove original answer text. */
export function isAwarenessEvidence(value: unknown): value is AwarenessEvidence {
 const d=value as AwarenessEvidence;
 return !!d && typeof d.version==='string' && typeof d.status==='string' && typeof d.checkedAt==='string'
  && Array.isArray(d.sources) && d.sources.length>0 && new Set(d.sources.map(s=>s?.id)).size===d.sources.length
  && d.sources.every(s=>s && typeof s.id==='string' && typeof s.title==='string' && !!s.title.trim()
   && typeof s.url==='string' && /^https:\/\/[^\s]+$/.test(s.url)
   && !!s.verification && (s.verification.checkedAt===null || typeof s.verification.checkedAt==='string')
   && typeof s.verification.status==='string' && typeof s.verification.clinicalReview==='string' && typeof s.verification.note==='string');
}
