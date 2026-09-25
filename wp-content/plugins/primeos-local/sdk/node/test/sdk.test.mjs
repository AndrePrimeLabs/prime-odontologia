import assert from 'node:assert/strict';
import test from 'node:test';
import { PrimeOSClient } from '../index.js';

test('constructs a client with explicit configuration', () => {
  const client = new PrimeOSClient({ apiUrl: 'http://127.0.0.1:3000', apiKey: 'test-key' });

  assert.equal(client.apiUrl, 'http://127.0.0.1:3000');
  assert.equal(client.apiKey, 'test-key');
  assert.equal(typeof client.submitResult, 'function');
  assert.equal(typeof client.generateLocal, 'function');
});

test('rejects local generation requests without a prompt', async () => {
  const client = new PrimeOSClient({ apiKey: 'test-key' });

  await assert.rejects(() => client.generateLocal('http://127.0.0.1:5000'), {
    message: 'prompt required'
  });
});

test('submits results using the agent API contract', async () => {
  const originalFetch = globalThis.fetch;
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify({ success: true, id: 'result-1' }), { status: 200 });
  };

  try {
    const client = new PrimeOSClient({ apiUrl: 'http://127.0.0.1:3000', apiKey: 'test-key' });
    const result = await client.submitResult({ text: 'hello' });
    assert.deepEqual(result, { success: true, id: 'result-1' });
    assert.equal(request.url, 'http://127.0.0.1:3000/agent/submit');
    assert.equal(request.options.headers['x-primeos-key'], 'test-key');
    assert.deepEqual(JSON.parse(request.options.body), { text: 'hello' });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
