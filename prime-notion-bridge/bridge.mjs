#!/usr/bin/env node
// Prime Notion Bridge v0.1: manual, draft-only. Node 22+. No dependencies.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
const hash = s => crypto.createHash('sha256').update(s).digest('hex');
const escape = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function pageId(input) {
  const path = input.includes('://') ? new URL(input).pathname : input;
  const match = path.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}|[a-f0-9]{32})\/?$/i);
  if (!match) throw new Error('Supply a Notion page URL or page UUID, not a database URL.');
  const id = match[1].replaceAll('-', '').toLowerCase();
  return `${id.slice(0,8)}-${id.slice(8,12)}-${id.slice(12,16)}-${id.slice(16,20)}-${id.slice(20)}`;
}
export function rich(items = []) {
  return items.map(r => {
    if (!['text','mention'].includes(r.type)) throw new Error('Unsupported inline content: ' + r.type);
    let text = escape(r.plain_text ?? r.text?.content ?? '');
    const a = r.annotations ?? {};
    if (a.code) text = `<code>${text}</code>`;
    if (a.bold) text = `<strong>${text}</strong>`;
    if (a.italic) text = `<em>${text}</em>`;
    if (a.strikethrough) text = `<s>${text}</s>`;
    if (a.underline) text = `<u>${text}</u>`;
    const link = r.href ?? r.text?.link?.url;
    if (link) {
      if (!/^(https?:|mailto:|tel:)/i.test(link)) throw new Error('Unsupported link scheme.');
      text = `<a href="${escape(link)}">${text}</a>`;
    }
    return text.replaceAll('\n','<br>');
  }).join('');
}
const block = (name, html, attrs = {}) => `<!-- wp:${name}${Object.keys(attrs).length ? ' '+JSON.stringify(attrs) : ''} -->\n${html}\n<!-- /wp:${name} -->\n`;
export async function convert(blocks, children, image, depth = 0) {
  if (depth > 12) throw new Error('Nesting exceeds safe limit.');
  let out = '';
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i], t = b.type, d = b[t] ?? {};
    if (b.has_children && !['bulleted_list_item','numbered_list_item'].includes(t)) throw new Error('Nested '+t+' needs manual conversion.');
    if (['bulleted_list_item','numbered_list_item'].includes(t)) {
      const ordered = t === 'numbered_list_item', tag = ordered ? 'ol' : 'ul';
      let inner = '';
      while (i < blocks.length && blocks[i].type === t) {
        const item = blocks[i];
        const nested = item.has_children ? await convert(await children(item.id), children, image, depth + 1) : '';
        inner += block('list-item', `<li>${rich(item[t].rich_text)}${nested}</li>`);
        i++;
      }
      i--;
      out += block('list', `<${tag} class="wp-block-list">${inner}</${tag}>`, ordered ? {ordered:true} : {});
    } else if (t === 'paragraph') out += block('paragraph', `<p>${rich(d.rich_text)}</p>`);
    else if (/^heading_[123]$/.test(t)) {
      const level = Number(t.at(-1));
      out += block('heading', `<h${level} class="wp-block-heading">${rich(d.rich_text)}</h${level}>`, {level});
    } else if (t === 'quote') out += block('quote', `<blockquote class="wp-block-quote">${block('paragraph', `<p>${rich(d.rich_text)}</p>`)}</blockquote>`);
    else if (t === 'callout') out += block('paragraph', `<p>${rich(d.rich_text)}</p>`);
    else if (t === 'divider') out += block('separator', '<hr class="wp-block-separator has-alpha-channel-opacity"/>');
    else if (t === 'to_do') out += block('paragraph', `<p>${d.checked ? '☑' : '☐'} ${rich(d.rich_text)}</p>`);
    else if (t === 'bookmark') {
      if (!/^https?:\/\//i.test(d.url ?? '')) throw new Error('Invalid bookmark URL.');
      out += block('paragraph', `<p><a href="${escape(d.url)}">${escape(d.url)}</a></p>`);
    } else if (t === 'image') {
      const media = await image(b.id, d[d.type]?.url);
      out += block('image', `<figure class="wp-block-image size-full"><img src="${escape(media.url)}" alt="${escape((d.caption ?? []).map(r => r.plain_text ?? '').join(''))}" class="wp-image-${media.id}"/>${d.caption?.length ? `<figcaption class="wp-element-caption">${rich(d.caption)}</figcaption>` : ''}</figure>`, {id:media.id,sizeSlug:'full',linkDestination:'none'});
    } else throw new Error(`Unsupported block ${t}: import stopped; manually convert a source copy first.`);
  }
  return out;
}
function config(env) {
  for (const key of ['NOTION_TOKEN','WP_BASE_URL','WP_USER','WP_APP_PASSWORD','NOTION_ALLOWED_PAGES']) if (!env[key]) throw new Error('Missing environment variable: '+key);
  const base = new URL(env.WP_BASE_URL);
  if (base.username || base.password || base.search || base.hash) throw new Error('WP_BASE_URL must not contain credentials, query or fragment.');
  if (base.protocol !== 'https:' && !(base.protocol === 'http:' && ['localhost','127.0.0.1','[::1]'].includes(base.hostname))) throw new Error('Use HTTPS except for local Studio.');
  return {base:base.href.replace(/\/$/,''), token:env.NOTION_TOKEN, auth:'Basic '+Buffer.from(env.WP_USER+':'+env.WP_APP_PASSWORD).toString('base64'), allowed:env.NOTION_ALLOWED_PAGES.split(',').map(v => pageId(v.trim())), state:env.BRIDGE_STATE_FILE ?? './bridge-state.json'};
}
export async function run(input, type = 'page', env = process.env) {
  if (!['page','post'].includes(type)) throw new Error('Type must be page or post.');
  const c = config(env), id = pageId(input);
  if (!c.allowed.includes(id)) throw new Error('Source page is not explicitly allowlisted.');
  let lock;
  try { lock = fs.openSync(c.state+'.lock','wx',0o600); } catch { throw new Error('Another import may be running. Check the lock file before retrying.'); }
  try {
    const state = fs.existsSync(c.state) ? JSON.parse(fs.readFileSync(c.state,'utf8')) : {version:1,sites:{}};
    if (state.version !== 1) throw new Error('Unsupported state file version.');
    const entries = state.sites[c.base] ??= {};
    const key = type+':'+id;
    if (entries[key]?.pending) throw new Error('Previous write needs reconciliation. Inspect WordPress and local state before retrying; do not delete state blindly.');
    const request = async (url, init = {}) => {
      const res = await fetch(url, {...init, redirect:'error', signal:AbortSignal.timeout(30000)});
      if (!res.ok) throw new Error(`HTTP ${res.status}; no credentials or response bodies logged. Check permissions and retry manually.`);
      return res.json();
    };
    const notion = async path => {
      await new Promise(r => setTimeout(r,350));
      return request('https://api.notion.com/v1/'+path, {headers:{Authorization:'Bearer '+c.token,'Notion-Version':'2025-09-03'}});
    };
    const wp = (path, init = {}) => request(c.base+'/wp-json/wp/v2/'+path, {...init,headers:{Authorization:c.auth,...init.headers}});
    const saveState = () => {
      fs.writeFileSync(c.state+'.tmp',JSON.stringify(state,null,2),{mode:0o600});
      fs.renameSync(c.state+'.tmp',c.state);
    };
    const page = await notion('pages/'+id);
    if (page.archived || page.is_archived || page.in_trash) throw new Error('Archived source refused.');
    const p = page.properties ?? {};
    if (type === 'post' && p['Review status']?.status?.name !== 'Approved') throw new Error('Blog source must have Review status = Approved.');
    if (type === 'page' && ['data_source_id','database_id'].includes(page.parent?.type)) throw new Error('Database entries must be imported as post; use page for standalone sources.');
    const titleProp = Object.values(p).find(v => v.type === 'title');
    const title = (titleProp?.title ?? []).map(v => v.plain_text ?? v.text?.content ?? '').join('');
    if (!title.trim()) throw new Error('Source title is empty.');
    const slug = (p['Desired slug']?.rich_text ?? []).map(v => v.plain_text ?? '').join('');
    if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Desired slug must be a simple lowercase slug, not a URL.');
    let old;
    if (entries[key]?.id) {
      old = await wp(`${type}s/${entries[key].id}?context=edit`);
      if (old.status !== 'draft' || old.type !== type || !old.content || typeof old.content.raw !== 'string') throw new Error('Mapped destination is not an editable draft. Published content is never overwritten.');
      if (hash(old.content.raw) !== entries[key].hash) throw new Error('WordPress content changed since import; preserve those edits before resyncing.');
    }
    let count = 0;
    const children = async blockId => {
      let all = [], cursor;
      do {
        const result = await notion(`blocks/${blockId}/children?page_size=100${cursor ? '&start_cursor='+encodeURIComponent(cursor) : ''}`);
        if (!Array.isArray(result.results)) throw new Error('Invalid block response.');
        all.push(...result.results); count += result.results.length;
        if (count > 1000) throw new Error('Page exceeds MVP block limit.');
        cursor = result.has_more ? result.next_cursor : null;
        if (result.has_more && !cursor) throw new Error('Invalid pagination response.');
      } while (cursor);
      return all;
    };
    // Media state is saved separately so a retry does not re-upload completed images.
    const mediaMap = entries['media:'+id] ??= {};
    const image = async (blockId, source) => {
      if (mediaMap[blockId]) {
        const media = await wp('media/'+mediaMap[blockId].id);
        return {id:media.id,url:media.source_url};
      }
      const u = new URL(source);
      const h = u.hostname.toLowerCase();
      if (u.protocol !== 'https:' || u.username || u.password || (u.port && u.port !== '443') || !(h === 'primeodontologia.com.br' || h === 'www.primeodontologia.com.br' || h === 'prod-files-secure.s3.us-west-2.amazonaws.com' || h === 's3.us-west-2.amazonaws.com' || h === 'www.notion.so' || h === 'notion.so')) throw new Error('Image host not allowlisted; review the URL before extending the list.');
      const response = await fetch(u,{redirect:'error',signal:AbortSignal.timeout(30000)});
      if (!response.ok) throw new Error('Image download failed.');
      const limit = 10*1024*1024;
      if (Number(response.headers.get('content-length')) > limit) throw new Error('Image exceeds 10 MB.');
      const chunks = []; let size = 0;
      for await (const chunk of response.body) { size += chunk.length; if (size > limit) { throw new Error('Image exceeds 10 MB.'); } chunks.push(chunk); }
      const bytes = Buffer.concat(chunks);
      const mime = response.headers.get('content-type')?.split(';')[0].trim();
      const valid = (mime === 'image/jpeg' && bytes.subarray(0,3).equals(Buffer.from([255,216,255]))) || (mime === 'image/png' && bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) || (mime === 'image/webp' && bytes.toString('ascii',0,4) === 'RIFF' && bytes.toString('ascii',8,12) === 'WEBP') || (mime === 'image/gif' && /^GIF8[79]a$/.test(bytes.toString('ascii',0,6)));
      if (!valid) throw new Error('Unsupported image MIME or signature. SVG is not imported.');
      const ext = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif'}[mime];
      const media = await wp('media',{method:'POST',headers:{'Content-Type':mime,'Content-Disposition':`attachment; filename="notion-${blockId}.${ext}"`},body:bytes});
      mediaMap[blockId] = {id:media.id}; saveState();
      return {id:media.id,url:media.source_url};
    };
    const content = await convert(await children(id),children,image);
    if (!content.trim()) throw new Error('Empty source refused.');
    const payload = {title,content,status:'draft'};
    // Prefix for safety: never target the live URL by slug.
    if (!old) payload.slug = 'notion-draft-'+(slug || id.replaceAll('-','').slice(0,12));
    entries[key] = {...entries[key],pending:true}; saveState();
    const draft = await wp(`${type}s${old ? '/'+old.id : ''}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    entries[key] = {...entries[key],id:draft.id}; saveState();
    if (draft.status !== 'draft') throw new Error('Unexpected destination status; inspect WordPress before retrying.');
    const verified = await wp(`${type}s/${draft.id}?context=edit`);
    if (verified.status !== 'draft' || typeof verified.content?.raw !== 'string') throw new Error('Cannot verify saved draft; inspect WordPress before retrying.');
    entries[key] = {id:draft.id,hash:hash(verified.content.raw),syncedAt:new Date().toISOString()};
    saveState();
    console.log(`Saved draft ${draft.id}. Review in WordPress: ${c.base}/wp-admin/post.php?post=${draft.id}&action=edit`);
    return draft.id;
  } finally { fs.closeSync(lock); fs.unlinkSync(c.state+'.lock'); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run(process.argv[2] ?? '',process.argv[3] ?? 'page').catch(e => { console.error(e.message); process.exitCode = 1; });
}
