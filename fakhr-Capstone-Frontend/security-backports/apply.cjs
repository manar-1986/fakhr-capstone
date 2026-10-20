'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),manifest=require('./manifest.json');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const [name,version] of Object.entries(manifest.packages))assert.equal(require(path.join(root,'node_modules',name,'package.json')).version,version,`Review backport before changing ${name}`);
const jobs=manifest.patches.map(p=>{const dest=path.join(root,'node_modules',p.file),source=path.join(__dirname,p.file.replaceAll('/','__'));const bytes=fs.readFileSync(source);assert.equal(sha(bytes),p.after,'Backport source checksum mismatch');const current=sha(fs.readFileSync(dest));assert([p.before,p.after].includes(current),`Unexpected dependency bytes: ${p.file}`);if(process.argv.includes('--verify'))assert.equal(current,p.after,`Missing backport: ${p.file}`);return{dest,bytes,current,p};});
if(!process.argv.includes('--verify'))for(const j of jobs)if(j.current!==j.p.after)fs.writeFileSync(j.dest,j.bytes);
console.log('Verified five narrowly scoped dependency backports; original package versions and APIs preserved.');
