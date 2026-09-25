import FtpDeploy from "ftp-deploy";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env vars with fallback across .env, .env.local, and process.env
const env = { ...process.env };
for (const filename of [".env", ".env.local"]) {
  const filePath = resolve(__dirname, `../${filename}`);
  if (existsSync(filePath)) {
    try {
      const content = readFileSync(filePath, "utf-8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const [key, ...rest] = trimmed.split("=");
          if (key && !(key.trim() in env)) {
            env[key.trim()] = rest.join("=").trim().replace(/^['"]|['"]$/g, "");
          }
        }
      });
    } catch {
      // Ignore reading error
    }
  }
}

// Create hardened .htaccess for SPA routing and security
const htaccess = `# ==============================================================================
# PrimeOS Production Apache Configuration for Hostinger
# ==============================================================================

# Disable directory listing and multiviews
Options -Indexes -MultiViews

# Security Headers
<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set X-XSS-Protection "1; mode=block"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>

# Block all dotfiles (e.g. .env, .git, etc.)
<FilesMatch "^\\.">
  Order allow,deny
  Deny from all
</FilesMatch>

# Block sensitive extensions and configuration files
<FilesMatch "\\.(env|sql|log|sh|yml|yaml|config|lock|jsonc)$">
  Order allow,deny
  Deny from all
</FilesMatch>

# Caching for static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresDefault "access plus 1 hour"
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 month"
  ExpiresByType image/png "access plus 1 month"
  ExpiresByType image/jpeg "access plus 1 month"
  ExpiresByType image/webp "access plus 1 month"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# SPA Fallback Routing
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
`;

writeFileSync(resolve(__dirname, "../dist/.htaccess"), htaccess);
console.log("✅ Hardened .htaccess created in dist/\n");

const ftpDeploy = new FtpDeploy();

const remoteRoot = env.FTP_REMOTE_ROOT || "/public_html/primeos/";
const ftpHost = env.FTP_HOST || "89.117.7.117";
const ftpUser = env.FTP_USER || env.FTP_USERNAME || "u188684587";
const ftpPassword = env.FTP_PASSWORD;
const ftpPort = env.FTP_PORT ? Number(env.FTP_PORT) : 21;

if (!ftpPassword) {
  throw new Error("Missing FTP_PASSWORD in environment or .env. Add it and rerun deploy.");
}

const config = {
  user: ftpUser,
  password: ftpPassword,
  host: ftpHost,
  port: ftpPort,
  localRoot: resolve(__dirname, "../dist"),
  remoteRoot,
  include: ["*", "**/*", ".htaccess"],
  // Explicitly protect against uploading sensitive files or server-side directories
  exclude: [
    ".env*",
    "**/.env*",
    "api/**",
    "**/api/**",
    "node_modules/**",
    "**/node_modules/**",
    "**/.git/**",
    "**/.DS_Store",
    "**/*.map",
  ],
  deleteRemote: false,
  forcePasv: true,
  sftp: false,
};

console.log("🚀 Deploying to primeos.primeodontologia.com.br...\n");
console.log(`   Host: ${config.host}`);
console.log(`   User: ${config.user}`);
console.log(`   Port: ${config.port}`);
console.log(`   Dir:  ${config.remoteRoot}\n`);

ftpDeploy.on("uploading", ({ transferredFileCount, totalFilesCount, filename }) => {
  console.log(`[${transferredFileCount}/${totalFilesCount}] ${filename}`);
});

ftpDeploy.on("log", (data) => console.log(data));

ftpDeploy
  .deploy(config)
  .then(() => console.log("\n✅ Deploy complete! https://primeos.primeodontologia.com.br"))
  .catch((err) => console.error("❌ Deploy failed:", err));