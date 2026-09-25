import { allowMethods, handle, hostingerFetch, requireApiKey } from '../../_lib/hostinger.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'PUT'])) return;
  if (!requireApiKey(req, res)) return;

  const { domain } = req.query;
  if (!domain || typeof domain !== 'string') {
    res.status(400).json({ error: 'Missing :domain path param' });
    return;
  }

  if (req.method === 'GET') {
    await handle(res, () => hostingerFetch(`/api/dns/v1/zones/${encodeURIComponent(domain)}`));
    return;
  }

  // PUT: replace zone records. Body shape: { zone: [{ name, type, ttl, records: [{ content }] }, ...], overwrite?: boolean }
  const body = req.body && typeof req.body === 'object' ? req.body : null;
  if (!body || !Array.isArray(body.zone)) {
    res.status(400).json({ error: 'Body must be { zone: [...], overwrite?: boolean }' });
    return;
  }

  await handle(res, () =>
    hostingerFetch(`/api/dns/v1/zones/${encodeURIComponent(domain)}`, {
      method: 'PUT',
      body,
    }),
  );
}
