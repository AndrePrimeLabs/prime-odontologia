// Local sanity-check CLI for the Hostinger API.
// Usage: node index.js [domains|dns <domain>|vps]
// Loads HOSTINGER_API_TOKEN from .env via dotenv (already in devDependencies).

import 'dotenv/config';

const BASE = 'https://developers.hostinger.com';

async function call(path) {
  const token = process.env.HOSTINGER_API_TOKEN;
  if (!token) throw new Error('HOSTINGER_API_TOKEN missing in .env');

  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`HTTP ${res.status} ${res.statusText}`);
    console.error(body);
    process.exit(1);
  }
  return body;
}

const [, , cmd, arg] = process.argv;
const routes = {
  domains: () => call('/api/domains/v1/portfolio'),
  dns: () => {
    if (!arg) throw new Error('Usage: node index.js dns <domain>');
    return call(`/api/dns/v1/zones/${encodeURIComponent(arg)}`);
  },
  vps: () => call('/api/vps/v1/virtual-machines'),
};

const fn = routes[cmd];
if (!fn) {
  console.log('Usage: node index.js [domains|dns <domain>|vps]');
  process.exit(1);
}

console.log(JSON.stringify(await fn(), null, 2));

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseApiKey = process.env.FIREBASE_API_KEY;
if (!firebaseApiKey) throw new Error('FIREBASE_API_KEY missing in environment');

const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: "primeosapp.firebaseapp.com",
  projectId: "primeosapp",
  storageBucket: "primeosapp.firebasestorage.app",
  messagingSenderId: "667030236741",
  appId: "1:667030236741:web:52ce197780b97bb1d3bd2c",
  measurementId: "G-MPWEGVKWPF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

console.log("Firebase initialized successfully!", app.name);
