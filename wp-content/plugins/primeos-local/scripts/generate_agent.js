#!/usr/bin/env node
/* generate_agent.js

Usage: node scripts/generate_agent.js --name <agent-folder-name> --display "Display Name"

This creates agents/<name>/ with manifest.json, Dockerfile, package.json and bodyparts/ stubs.
*/

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
function getArg(flag){ const i = args.indexOf(flag); return i>=0 && args[i+1] ? args[i+1] : null }
const name = getArg('--name');
const display = getArg('--display') || name;
if(!name){ console.error('Usage: --name <agent-name> [--display "Display Name"]'); process.exit(2) }

const root = path.join(__dirname, '..', 'agents', name);
if(fs.existsSync(root)){ console.error('Agent exists:', root); process.exit(1) }
fs.mkdirSync(root, { recursive: true });
fs.mkdirSync(path.join(root,'bodyparts'));

const bodyparts = ['interface','perception','memory','knowledge','reasoning','planning','executor','safety','telemetry','ops'];
for(const b of bodyparts){
  const sub = path.join(root,'bodyparts',b);
  fs.mkdirSync(sub, { recursive: true });
  fs.writeFileSync(path.join(sub,'README.md'), `# ${b}\n\nImplement ${b} for agent ${display}.`);
  fs.writeFileSync(path.join(sub,`${b}.js`), `// ${b} module stub for ${display}\nmodule.exports = async function(params){\n  console.log('running ${b} for', params);\n  return { ok: true }\n}\n`);
}

// manifest
const manifest = {
  name,
  display_name: display,
  version: '0.1.0',
  description: `Agent ${display} (generated)` ,
  bodyparts,
  entry: 'index.js'
}
fs.writeFileSync(path.join(root,'manifest.json'), JSON.stringify(manifest,null,2));

// package.json
const pkg = {
  name: `primeos-agent-${name}`,
  version: '0.1.0',
  main: 'index.js',
  scripts: { start: 'node index.js' }
}
fs.writeFileSync(path.join(root,'package.json'), JSON.stringify(pkg,null,2));

// simple index
fs.writeFileSync(path.join(root,'index.js'), "const manifest = require('./manifest.json');\nconsole.log('Starting agent', manifest.display_name);\n\n(async ()=>{\n  // load and run bodyparts in sequence (simple demo)\n  const bps = require('./manifest.json').bodyparts;\n  for(const bp of bps){\n    const run = require('./bodyparts/' + bp + '/' + bp + '.js');\n    await run({ sample: true });\n  }\n  console.log('Agent startup complete');\n})();\n");

// dockerfile
fs.writeFileSync(path.join(root,'Dockerfile'), `FROM node:24-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --silent || true\nCOPY . .\nCMD ["node","index.js"]\n`);

console.log('Agent scaffold created at', root);
console.log('Next: cd', root, '&& npm install (if needed) && docker build -t primeos-agent-'+name+' .');
