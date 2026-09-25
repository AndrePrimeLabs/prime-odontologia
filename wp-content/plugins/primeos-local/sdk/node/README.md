PrimeOS Node SDK

Installation (local test)

# from repo root
cd sdk/node
# Use with Node >=18 (built-in fetch)
node -e "const c=require('./index.js'); console.log(Object.keys(c));"

Usage example

const { PrimeOSClient } = require('@primeos/sdk-node');
const client = new PrimeOSClient({ apiUrl: 'https://api.primeodontologia.com.br', apiKey: process.env.PRIMEOS_API_KEY });

await client.submitResult({ type: 'inference', result: { text: 'hello' } });

const resp = await client.generateLocal('http://jetson.local:5000', { prompt: 'Hello world', max_tokens: 128 });
console.log(resp);
