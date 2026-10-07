import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pageId,rich,convert,run} from './bridge.mjs';
const id='12345678-1234-1234-1234-123456789abc';
const r = text => [{type:'text',plain_text:text,annotations:{},text:{content:text}}];
assert.equal(pageId('https://www.notion.so/Test-12345678123412341234123456789abc?v=other'),id);
assert.throws(()=>pageId('not-a-page'));
assert.equal(rich(r('<unsafe>')), '&lt;unsafe&gt;');
assert.throws(()=>rich([{type:'text',plain_text:'bad',href:'javascript:alert(1)'}]));
const content = await convert([
 {id:'a',type:'heading_2',heading_2:{rich_text:r('Heading')}},
 {id:'b',type:'paragraph',paragraph:{rich_text:r('Olá & bem-vindo')}},
 {id:'c',type:'bulleted_list_item',bulleted_list_item:{rich_text:r('One')},has_children:true},
 {id:'d',type:'bulleted_list_item',bulleted_list_item:{rich_text:r('Two')}}
], async()=>[{id:'e',type:'numbered_list_item',numbered_list_item:{rich_text:r('Nested')}}],async()=>{});
assert.match(content,/wp:heading/); assert.match(content,/Olá &amp; bem-vindo/);
assert.match(content,/wp:list-item/); assert.match(content,/<ol class="wp-block-list">/);
await assert.rejects(()=>convert([{type:'embed',embed:{url:'https://example.com'}}],async()=>[],async()=>{}),/Unsupported block/);
await assert.rejects(()=>convert([{type:'paragraph',has_children:true,paragraph:{rich_text:r('parent')}}],async()=>[],async()=>{}),/Nested/);
const imageBlock=await convert([{id:'image',type:'image',image:{type:'external',external:{url:'https://primeodontologia.com.br/image.jpg'},caption:r('Foto')}}],async()=>[],async()=>({id:9,url:'https://example.com/image.jpg'}));
assert.match(imageBlock,/wp-image-9/);
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'bridge-test-'));
const env={NOTION_TOKEN:'test-not-a-real-secret',WP_BASE_URL:'https://example.test',WP_USER:'test',WP_APP_PASSWORD:'test',NOTION_ALLOWED_PAGES:id,BRIDGE_STATE_FILE:path.join(dir,'state.json')};
let status='draft', raw='', nextId=42, creates=0, updates=0, review='Approved';
let props={title:{type:'title',title:r('Meu Sorriso')}};
let blocks=[{id:'a',type:'paragraph',paragraph:{rich_text:r('First draft')}}];
const original=globalThis.fetch;
globalThis.fetch=async(url,init={})=>{
 const u=String(url);
 const json=o=>new Response(JSON.stringify(o),{status:200,headers:{'Content-Type':'application/json'}});
 if(u.includes('api.notion.com/v1/pages/')) return json({properties:props,parent:{type: props.Post ? 'data_source_id' : 'page_id'},archived:false});
 if(u.includes('/children?')) return json({results:blocks,has_more:false});
 if(u.includes('/wp-json/wp/v2/')) {
  if(init.method==='POST') {
   const body=JSON.parse(init.body); assert.equal(body.status,'draft');
   if(/\/(pages|posts)$/.test(u)) {creates++; assert.match(body.slug,/^notion-draft-/);} else updates++;
   raw=body.content;return json({id:nextId,status:'draft'});
  }
  return json({id:nextId,type: u.includes('/posts/') ? 'post':'page',status,content:{raw}});
 }
 throw new Error('Unexpected URL in mock');
};
try {
 assert.equal(await run(id,'page',env),42); assert.equal(creates,1);
 assert.equal(await run(id,'page',env),42); assert.equal(updates,1);
 raw+=' manual edit'; await assert.rejects(()=>run(id,'page',env),/changed since import/);
 raw=JSON.parse(fs.readFileSync(env.BRIDGE_STATE_FILE)).sites[env.WP_BASE_URL]['page:'+id].hash; // published check happens before hash
 status='publish'; await assert.rejects(()=>run(id,'page',env),/not an editable draft/);
 props={Post:{type:'title',title:r('Blog')},'Review status':{status:{name:'Imported'}}};
 await assert.rejects(()=>run(id,'post',env),/Approved/);
 await assert.rejects(()=>run(id,'page',env),/Database entries/);
 props['Review status'].status.name='Approved'; status='draft';
 assert.equal(await run(id,'post',env),42); assert.equal(creates,2);
 await assert.rejects(()=>run(id,'post',{...env,NOTION_ALLOWED_PAGES:'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'}),/allowlisted/);
 await assert.rejects(()=>run(id,'post',{...env,WP_BASE_URL:'http://public.example'}),/HTTPS/);
 assert.equal(fs.existsSync(env.BRIDGE_STATE_FILE+'.lock'),false);
 blocks=[{id:'bad',type:'embed',embed:{}}];
 const other={...env,BRIDGE_STATE_FILE:path.join(dir,'other.json')};
 await assert.rejects(()=>run(id,'post',other),/Unsupported block/); assert.equal(creates,2);
 console.log('PASS: IDs, escaping, unsafe links, block conversion, nested lists, images, unsupported blocks, draft create/update, conflict guard, published guard, approval gate, standalone gate, allowlist, HTTPS and lock cleanup.');
} finally {globalThis.fetch=original;fs.rmSync(dir,{recursive:true});}
