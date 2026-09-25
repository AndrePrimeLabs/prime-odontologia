import { allowMethods, handle, hostingerFetch, requireApiKey } from '../_lib/hostinger.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return;
  if (!requireApiKey(req, res)) return;

  await handle(res, () => hostingerFetch('/api/domains/v1/portfolio'));
}
