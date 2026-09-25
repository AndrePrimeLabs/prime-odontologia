import fs from 'fs';
import path from 'path';

try {
  // Ensure distribution directory exists
  if (!fs.existsSync('dist')) fs.mkdirSync('dist');

  // Copy manifest configurations safely
  if (fs.existsSync('public/manifest.webmanifest')) {
    fs.copyFileSync('public/manifest.webmanifest', 'dist/manifest.webmanifest');
    fs.copyFileSync('public/manifest.webmanifest', 'dist/manifest.json');
    console.log('✅ Manifest files synchronized.');
  }

  if (fs.existsSync('login.html')) {
    fs.copyFileSync('login.html', 'dist/login.html');
    console.log('Login page copied.');
  }

  if (fs.existsSync('src/assets/prime-logo.svg')) {
    fs.copyFileSync('src/assets/prime-logo.svg', 'dist/prime-logo.svg');
    console.log('PrimeOS logo copied.');
  }

  // Never copy server api/ or secrets into dist/
  if (fs.existsSync('dist/api')) {
    fs.rmSync('dist/api', { recursive: true, force: true });
    console.log('🧹 Cleaned up old dist/api directory.');
  }
} catch (error) {
  console.log('Post-build notice:', error.message);
}
