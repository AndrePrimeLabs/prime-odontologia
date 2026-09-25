import FtpDeploy from "ftp-deploy";
import 'dotenv/config';
import readline from 'readline';
import fs from 'fs';

const ftpDeploy = new FtpDeploy();

// ============================================================================
// SAFETY VALIDATION - Prevent catastrophic deletions
// ============================================================================

const SAFE_REMOTE_ROOTS = [
  '/public_html/primeos',
  '/primeos',
  '/home/u188684587/public_html/primeos',
];

const DANGEROUS_ROOTS = [
  '/public_html',
  '/public_html/',
  '/home',
  '/var',
  '/',
];

function validateDeploymentConfig() {
  const remoteRoot = process.env.FTP_REMOTE_DIR || '/public_html/primeos';
  const deleteRemote = process.env.FTP_DELETE_REMOTE?.toLowerCase() === 'true';
  
  // Check for dangerous root directory
  if (DANGEROUS_ROOTS.some(root => remoteRoot === root || remoteRoot.endsWith(root + '/'))) {
    console.error('\n❌ FATAL: Dangerous FTP root directory detected!\n');
    console.error(`   Remote Root: ${remoteRoot}`);
    console.error('   This would DELETE the entire website!\n');
    console.error('   SAFE directories are:');
    SAFE_REMOTE_ROOTS.forEach(root => console.error(`     - ${root}`));
    console.error('\n   Set FTP_REMOTE_DIR in .env to a safe directory.\n');
    process.exit(1);
  }
  
  // Warn if deleteRemote is enabled
  if (deleteRemote) {
    console.error('\n⚠️  WARNING: deleteRemote is ENABLED!\n');
    console.error('   This will DELETE all remote files before uploading.\n');
    console.error('   Verify FTP_DELETE_REMOTE is TRULY needed in .env\n');
    process.exit(1);
  }
  
  // Check .env security
  if (!fs.existsSync('.env.local') && !fs.existsSync('.env')) {
    console.error('\n❌ ERROR: .env file not found!\n');
    console.error('   Create .env.local with:');
    console.error('     FTP_USERNAME=your_username');
    console.error('     FTP_PASSWORD=your_password');
    console.error('     FTP_SERVER=your_server');
    console.error('     FTP_PORT=21');
    console.error('     FTP_REMOTE_DIR=/public_html/primeos');
    console.error('\n');
    process.exit(1);
  }
  
  return { remoteRoot, deleteRemote };
}

const { remoteRoot, deleteRemote } = validateDeploymentConfig();

const config = {
  user: process.env.FTP_USERNAME,
  password: process.env.FTP_PASSWORD,
  host: process.env.FTP_SERVER,
  port: parseInt(process.env.FTP_PORT || "21"),
  localRoot: "./dist",
  remoteRoot,
  include: ["*", "**/*"],
  exclude: [],
  deleteRemote,
  forcePasv: true,
};

// Verify local build exists
if (!fs.existsSync('./dist')) {
  console.error('\n❌ ERROR: ./dist directory not found!');
  console.error('   Run: npm run build\n');
  process.exit(1);
}

function askConfirmation(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

ftpDeploy.on("uploading", ({ transferredFileCount, totalFilesCount, filename }) => {
  console.log(`[${transferredFileCount}/${totalFilesCount}] ${filename}`);
});

ftpDeploy.on("uploaded", ({ transferredFileCount, totalFilesCount }) => {
  console.log(`✅ Done: ${transferredFileCount}/${totalFilesCount}`);
});

ftpDeploy.on("log", (data) => console.log(data));

async function deploy() {
  console.log('\n🚀 FTP Deployment Configuration:\n');
  console.log(`   Host: ${config.host}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Remote Root: ${config.remoteRoot}`);
  console.log(`   Delete Remote: ${config.deleteRemote}`);
  console.log(`   Local Files: ./dist\n`);
  
  const confirmed = await askConfirmation('Continue with deployment? (yes/no): ');
  
  if (!confirmed) {
    console.log('\n❌ Deployment cancelled.\n');
    process.exit(0);
  }
  
  console.log('\n🚀 Starting FTP deploy to primeos.primeodontologia.com.br...\n');
  
  ftpDeploy
    .deploy(config)
    .then(() => console.log("\n✅ Deploy complete! Visit: https://primeos.primeodontologia.com.br"))
    .catch(err => {
      console.error("\n❌ Deploy failed:", err);
      process.exit(1);
    });
}

deploy();
  