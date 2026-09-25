const { connect, StringCodec } = require('nats');

const sc = StringCodec();
let nc;

async function getConnection() {
  if (!nc) {
    nc = await connect({ servers: process.env.NATS_URL || 'nats://localhost:4222' });
    console.log('📡 Connected to NATS at', process.env.NATS_URL);
  }
  return nc;
}

// Publishes an event other services (SEG-X, Marketing, the Analytics
// Warehouse) can subscribe to without CRM-X knowing who's listening.
async function publish(subject, payload) {
  try {
    const conn = await getConnection();
    conn.publish(subject, sc.encode(JSON.stringify(payload)));
  } catch (err) {
    // Never let an event-bus hiccup break the customer-facing request —
    // log and move on. A production version should retry via an outbox table.
    console.error(`⚠️  Failed to publish ${subject}:`, err.message);
  }
}

module.exports = { publish };
