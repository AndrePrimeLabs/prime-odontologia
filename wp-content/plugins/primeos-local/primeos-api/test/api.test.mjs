import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from '../dist/index.js';

async function withServer(callback) {
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();

  try {
    await callback(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test('health endpoint reports the service is ready', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok', service: 'primeos-api' });
  });
});

test('entity routes reject requests without an API key', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/entities/Appointment`);
    assert.equal(response.status, 401);
    assert.equal((await response.json()).error, 'Unauthorized: Invalid or missing api_key');
  });
});

test('agent submission rejects requests without the SDK API key header', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/agent/submit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ result: 'test' })
    });
    assert.equal(response.status, 401);
    assert.equal((await response.json()).error, 'Unauthorized: Invalid or missing x-primeos-key');
  });
});