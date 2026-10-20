import {assessmentResponse,assessmentKnowledge,medicalDisclaimer} from '../modules/assessmentKnowledge/assessment';
test.each(['ar','ar-KW','en'])('structured assessment retains all evidence and fallback: %s',language=>{
 const result=assessmentResponse(language==='en'?'Where can I get IQ testing?':'وين أسوي اختبار ذكاء؟',language);const a=result.assessment;
 expect(a.organizations).toEqual(assessmentKnowledge.organizations);expect(a.organizations).toHaveLength(7);
 expect(a.organizations.map(o=>o.candidatePhone).filter(Boolean)).toEqual(['1861111','24814720','24843900','23945619','24814328','24617345']);
 expect(a.organizations[5].candidatePhone).toBeNull();
 expect(a.sources).toContain('https://online.pada.gov.kw/InfoServices.aspx?type=1');
 expect(a.organizations[2].contactEvidence.source).toContain('e.gov.kw');
 expect(a.verificationNotice).toContain(language==='en'?'Not all government hospitals':'لا تقدم جميع المستشفيات');
 expect(a.introduction).toContain(language==='en'?'not confirmed testing providers':'ليست جهات مؤكدة');
 expect(a.medicalDisclaimer).toBe(medicalDisclaimer[language==='en'?'en':'ar']);
 expect(result.answer.endsWith(a.medicalDisclaimer)).toBe(true);
 for(const o of a.organizations){expect(o.serviceStatus).toBe('unverified');expect(o.acceptanceStatus).toBe('unverified');expect(result.answer).toContain(o.name[language==='en'?'en':'ar']);}
});
