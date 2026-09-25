/* PrimeOS Node SDK (minimal)

Usage:
const { PrimeOSClient } = require('@primeos/sdk-node');
const client = new PrimeOSClient({ apiUrl: 'https://api.primeodontologia.com.br', apiKey: process.env.PRIMEOS_API_KEY });
await client.submitResult({foo: 'bar'});

const resp = await client.generateLocal('http://jetson.local:5000', { prompt: 'Hello', max_tokens: 128 });
console.log(resp.text);
*/

class PrimeOSClient {
  constructor({ apiUrl, apiKey } = {}) {
    this.apiUrl = apiUrl || process.env.PRIMEOS_API_URL || 'http://localhost:3000';
    this.apiKey = apiKey || process.env.PRIMEOS_API_KEY;
    if (!this.apiKey) console.warn('Warning: PRIMEOS_API_KEY not provided; agent endpoints may be rejected');
  }

  async submitResult(payload, timeout = 30000) {
    const url = new URL('/agent/submit', this.apiUrl).toString();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-primeos-key': this.apiKey || ''
      },
      body: JSON.stringify(payload),
      // Note: Node's global fetch supports timeout via AbortController if needed
    });
    if (!res.ok) {
      const txt = await res.text();
      const err = new Error(`submitResult failed: ${res.status} ${res.statusText} - ${txt}`);
      err.status = res.status; throw err;
    }
    return res.json();
  }

  // Call local Clara agent generate endpoint: agentBaseUrl is e.g. http://jetson.local:5000
  async generateLocal(agentBaseUrl, { prompt, max_tokens = 512 } = {}) {
    if (!prompt) throw new Error('prompt required');
    const url = new URL('/generate', agentBaseUrl).toString();
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, max_tokens })
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`generateLocal failed: ${res.status} ${txt}`);
    }
    return res.json();
  }

  // Convenience: push a result and then optionally notify via console
  async pushAndLog(payload) {
    const r = await this.submitResult(payload);
    console.log('submitted:', r);
    return r;
  }
}

module.exports = { PrimeOSClient };
