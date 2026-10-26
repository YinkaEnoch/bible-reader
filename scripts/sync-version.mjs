import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const packageJsonPath = path.join(projectRoot, 'package.json');
const swPath = path.join(projectRoot, 'public', 'sw.js');
const distSwPath = path.join(projectRoot, 'dist', 'sw.js');
const androidSwPath = path.join(projectRoot, 'android', 'app', 'src', 'main', 'assets', 'public', 'sw.js');

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version || '1.0.0';

console.log(`[sync-version] Synchronizing app version to v${version}...`);

function updateSwFile(targetPath) {
  if (fs.existsSync(targetPath)) {
    let content = fs.readFileSync(targetPath, 'utf8');
    const regex = /const CACHE_NAME = ['"][^'"]*['"];/;
    const replacement = `const CACHE_NAME = 'bible-reader-v${version}';`;
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      fs.writeFileSync(targetPath, content, 'utf8');
      console.log(`[sync-version] Updated cache name in ${path.relative(projectRoot, targetPath)} -> bible-reader-v${version}`);
    }
  }
}

// 1. Sync public/sw.js
updateSwFile(swPath);

// 2. Sync dist/sw.js (if built)
updateSwFile(distSwPath);

// 3. Sync android/app/src/main/assets/public/sw.js (if synced)
updateSwFile(androidSwPath);

console.log(`[sync-version] App version synchronized successfully.`);
