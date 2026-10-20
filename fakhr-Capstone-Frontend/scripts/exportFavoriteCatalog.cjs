// Public IDs/names only; no environment, account, or network access.
const fs = require('fs');
const path = require('path');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText, filename);
const d = require('../utils/institutionDirectory.ts');
const { PUBLIC_DOCTORS } = require('../constants/approvedDoctors.ts');
const { HOME_PRODUCTS } = require('../constants/homeProducts.ts');
const records = d.filterInstitutions(d.mergeInstitutions(d.INSTITUTIONS,d.LEGACY_INSTITUTIONS),{}).map(i => ({kind:'institution', targetId:i.id, nameAr:i.nameAr, nameEn:i.nameEn || i.nameAr}));
records.push(...PUBLIC_DOCTORS.map(i=>({kind:'doctor',targetId:i.id,nameAr:i.nameAr,nameEn:i.nameEn})), ...HOME_PRODUCTS.map(i=>({kind:'product',targetId:i.id,nameAr:i.nameAr,nameEn:i.nameEn})));
const unique = [...new Map(records.map(r=>[r.kind+':'+r.targetId,r])).values()];
fs.writeFileSync(path.join(__dirname,'../data/favoriteCatalog.json'),JSON.stringify(unique,null,2)+'\n');
console.log(`Exported ${unique.length} public favorite identities`);
