const queryString = require('query-string');
const decode = require('decode-uri-component');
const {I18n} = require('i18n-js');
const ar = require('../i18n/locales/ar.json');
const en = require('../i18n/locales/en.json');
test.each(['Ali','علي','speech & communication','نطق وتواصل'])('deep-link query round trip: %s', value => {
 expect(queryString.parse(queryString.stringify({name:value})).name).toBe(value);
});
test.each(['%','%GG','%E0%A4%A','%FF'.repeat(10000),'%C0%AF'.repeat(10000)])('malformed URI is handled without throwing (%#)', input => {
 expect(()=>queryString.parse('name='+input)).not.toThrow();expect(typeof decode(input)).toBe('string');
});
test('patched decoder retains CommonJS callable API',()=>expect(typeof decode).toBe('function'));
test.each(['ar','en'])('real localization engine preserves %s dictionary and interpolation',locale=>{
 const i18n=new I18n({ar,en});i18n.locale=locale;
 expect(i18n.t('common.back')).toBe((locale==='ar'?ar:en).common.back);
 i18n.store({ar:{securityCheck:'مرحباً %{name}'},en:{securityCheck:'Hello %{name}'}});
 expect(i18n.t('securityCheck',{name:'علي'})).toBe(locale==='ar'?'مرحباً علي':'Hello علي');
});
const fs=require('fs');
const quote=require('shell-quote');
const postcss=require('postcss');
test('shell quoting rejects unsafe operator objects and protects line terminators',()=>{
 expect(()=>quote.quote([{op:';\nunsafe'}])).toThrow();
 const result=quote.quote(['safe','value\nwith newline']);
 expect(quote.parse(result)).toEqual(['safe','value\nwith newline']);
});
test('patched PostCSS retains parsing and transformation API used by Metro',async()=>{
 const result=await postcss([{postcssPlugin:'synthetic-test',Declaration(d: {prop: string; value: string}){if(d.prop==='color')d.value='#0B093B';}}]).process('a { color: blue; }',{from:undefined,map:false});
 expect(result.css).toContain('#0B093B');expect(result.css).toContain('a {');
});

