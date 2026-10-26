import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const packageJsonPath = path.join(projectRoot, 'package.json');
const swPath = path.join(projectRoot, 'public', 'sw.js');

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version || '1.0.0';

console.log(`[sync-version] Synchronizing app version to v${version}...`);

// 1. Sync public/sw.js cache name
if (fs.existsSync(swPath)) {
  let swContent = fs.readFileSync(swPath, 'utf8');
  const cacheNameRegex = /const CACHE_NAME = ['"]bible-reader-v[^'"]+['"];/;
  const newCacheName = `const CACHE_NAME = 'bible-reader-v${version}';`;

  if (cacheNameRegex.test(swContent)) {
    swContent = swContent.replace(cacheNameRegex, newCacheName);
    fs.writeFileSync(swPath, swContent, 'utf8');
    console.log(`[sync-version] Updated public/sw.js cache name -> bible-reader-v${version}`);
  }
}

console.log(`[sync-version] App version synchronized successfully.`);
