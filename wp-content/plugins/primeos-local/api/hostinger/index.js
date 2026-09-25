import { allowMethods, requireApiKey } from '../_lib/hostinger.js';

export default function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return;
  if (!requireApiKey(req, res)) return;

  res.status(200).json({
    service: 'hostinger',
    endpoints: {
      'GET /api/hostinger/domains': 'List domain portfolio',
      'GET /api/hostinger/dns/{domain}': 'Get DNS zone records',
      'PUT /api/hostinger/dns/{domain}': 'Update DNS zone records (body: { zone: [...] })',
      'GET /api/hostinger/vps': 'List VPS / virtual machines',
      'POST /api/hostinger/deploy': 'Static-site deploy (see notes)',
    },
    notes: {
      auth: 'Send header `x-primeos-key: $PRIMEOS_API_KEY` on every request.',
      deploy:
        "Hostinger's public API does not expose a shared-hosting file-upload endpoint. " +
        "Static-site deploys for primeos.primeodontologia.com.br go through FTP via " +
        '`npm run deploy` (scripts/deploy.mjs). The /api/hostinger/deploy endpoint ' +
        'is a webhook-style trigger placeholder — wire it to a CI job if you want ' +
        'remote-triggered deploys.',
    },
  });
}
