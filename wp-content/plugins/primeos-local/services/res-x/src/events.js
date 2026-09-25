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

async function publish(subject, payload) {
  try {
    const conn = await getConnection();
    conn.publish(subject, sc.encode(JSON.stringify(payload)));
  } catch (err) {
    console.error(`⚠️  Failed to publish ${subject}:`, err.message);
  }
}

module.exports = { publish };
