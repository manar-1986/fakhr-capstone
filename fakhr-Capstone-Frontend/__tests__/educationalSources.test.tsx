import React from 'react';
import {Linking} from 'react-native';
import {render,fireEvent} from '@testing-library/react-native';
import EducationalSources,{withoutExactSourceFooter,educationalSourceLabel} from '../components/directory/EducationalSources';
import {isAwarenessEvidence,AwarenessEvidence} from '../types/awareness';
const evidence:AwarenessEvidence={version:'test',status:'source-checked-not-clinically-reviewed',checkedAt:'2026-10-14',sources:[{id:'hair',title:'NHS — Hair care',url:'https://example.invalid/verified?x=1&y=2',verification:{status:'source-checked',checkedAt:'2026-10-14',clinicalReview:'not-clinically-reviewed',note:'Publisher review date has passed; re-review before release.'}}]};
test.each(['ar','en'])('links and expandable verification: %s',language=>{
 const open=jest.spyOn(Linking,'openURL').mockResolvedValue(undefined);
 const ui=render(<EducationalSources data={evidence} language={language}/>);
 expect(ui.getByText(language==='en'?'Educational Sources':'المصادر التوعوية')).toBeTruthy();
 fireEvent.press(ui.getByRole('link'));expect(open).toHaveBeenCalledWith(evidence.sources[0].url);
 expect(ui.queryByTestId('educational-source-details')).toBeNull();fireEvent.press(ui.getByRole('button'));
 expect(ui.getByTestId('educational-source-details')).toBeTruthy();expect(ui.getByText(/2026-10-14/)).toBeTruthy();
 expect(ui.getByText(language==='en'?'Source review is overdue; recheck before release.':'تجاوز المصدر موعد المراجعة؛ يحتاج إعادة تحقق قبل الإصدار.')).toBeTruthy();open.mockRestore();
});
test('pending sources are never labeled source checked',()=>{
 const pending={...evidence,sources:[{...evidence.sources[0],verification:{...evidence.sources[0].verification,status:'verification-pending',checkedAt:null}}]};
 const ui=render(<EducationalSources data={pending} language="en"/>);expect(ui.getByText(/awaiting verification/)).toBeTruthy();
});
test('only exact source footer is removed; unmatched text is untouched',()=>{
 const footer='Educational sources — source-checked summaries, not clinically reviewed or an individual assessment:\nNHS — Hair care: '+evidence.sources[0].url;
 expect(withoutExactSourceFooter('Full answer\n\n'+footer,evidence)).toBe('Full answer');
 for(const text of ['Full answer\n\n\nOther text',footer+' changed',footer.replace('x=1','x=2')])expect(withoutExactSourceFooter(text,evidence)).toBe(text);
});
test.each([undefined,{}, {...evidence,sources:[]},{...evidence,sources:[{...evidence.sources[0],verification:null}]},{...evidence,sources:[{...evidence.sources[0],url:'javascript:alert(1)'}]}])('malformed metadata fails closed',value=>expect(isAwarenessEvidence(value)).toBe(false));

test.each(['ar','ar-KW','en'])('localized description preserves publisher, URL, metadata and original title: %s',language=>{
 const data={...evidence,sources:[{...evidence.sources[0],title:'NHS Humber — hair care'}]};
 const before=JSON.stringify(data),open=jest.spyOn(Linking,'openURL').mockResolvedValue(undefined);
 const ui=render(<EducationalSources data={data} language={language}/>);
 const label=language==='en'?'NHS Humber — hair care':'NHS Humber — العناية بالشعر';
 fireEvent.press(ui.getByRole('link',{name:label}));expect(open).toHaveBeenCalledWith(data.sources[0].url);
 fireEvent.press(ui.getByRole('button'));
 expect(ui.getByText('NHS Humber — hair care')).toBeTruthy();
 expect(ui.getByText(data.sources[0].verification.note)).toBeTruthy();
 if(language!=='en')expect(ui.getByText('الوصف العربي للتوضيح، وليس عنواناً رسمياً مترجماً.')).toBeTruthy();
 expect(JSON.stringify(data)).toBe(before);open.mockRestore();
});
test('unknown titles fall back and English titles are never translated',()=>{
 for(const title of ['Unknown Publisher — new guidance','NHS Humber — changed title','مصدر عربي أصلي'])expect(educationalSourceLabel(title,'ar')).toBe(title);
 expect(educationalSourceLabel('NHS — contact dermatitis','en')).toBe('NHS — contact dermatitis');
 expect(educationalSourceLabel('NIDCD — speech and language development','ar')).toBe('NIDCD — تطور النطق واللغة');
 expect(educationalSourceLabel('WHO — vision impairment','ar')).toBe('WHO — ضعف البصر');
});
