// Shared Hostinger API client + Vercel function helpers.
// All /api/hostinger/* endpoints route through this module so the
// HOSTINGER_API_TOKEN never leaves the server.

const HOSTINGER_BASE_URL = 'https://developers.hostinger.com';

export class HostingerError extends Error {
  constructor(message, { status, data } = {}) {
    super(message);
    this.name = 'HostingerError';
    this.status = status;
    this.data = data;
  }
}

export async function hostingerFetch(path, { method = 'GET', body, query } = {}) {
  const token = process.env.HOSTINGER_API_TOKEN;
  if (!token) {
    throw new HostingerError('HOSTINGER_API_TOKEN is not configured', { status: 500 });
  }

  const url = new URL(`${HOSTINGER_BASE_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = (payload && payload.message) || response.statusText || 'Hostinger request failed';
    throw new HostingerError(message, { status: response.status, data: payload });
  }

  return payload;
}

// Shared-secret auth so /api/hostinger/* isn't an open proxy to your Hostinger account.
// Set PRIMEOS_API_KEY in Vercel env. Callers must send `x-primeos-key: <key>`.
export function requireApiKey(req, res) {
  const expected = process.env.PRIMEOS_API_KEY;
  if (!expected) {
    res.status(500).json({ error: 'PRIMEOS_API_KEY is not configured on the server' });
    return false;
  }
  const provided = req.headers['x-primeos-key'];
  if (provided !== expected) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

export function allowMethods(req, res, methods) {
  if (!methods.includes(req.method)) {
    res.setHeader('Allow', methods.join(', '));
    res.status(405).json({ error: `Method ${req.method} not allowed` });
    return false;
  }
  return true;
}

export async function handle(res, fn) {
  try {
    const data = await fn();
    res.status(200).json(data);
  } catch (err) {
    if (err instanceof HostingerError) {
      res.status(err.status || 502).json({ error: err.message, data: err.data });
    } else {
      res.status(500).json({ error: err.message || 'Internal error' });
    }
  }
}
