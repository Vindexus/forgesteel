import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, 'src'); // adjust if your src folder is elsewhere
const ALIAS = '@';

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Match relative imports starting with ../ or ./
  const importRegex = /from\s+['"](\.{1,2}\/[a-zA-Z0-9@/._-]*)['"]/g;

  let hasChanges = false;

  content = content.replace(importRegex, (match, relPath) => {
    const absolutePath = path.resolve(path.dirname(filePath), relPath);
    const relativeToSrc = path.relative(SRC_DIR, absolutePath).replace(/\\/g, '/');

    // Only replace if inside src
    if (!relativeToSrc.startsWith('..')) {
      hasChanges = true;
      return `from '${ALIAS}/${relativeToSrc}'`;
    }

    return match; // keep unchanged if outside src
  });

  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated imports in ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      updateFile(fullPath);
    }
  }
}

walkDir(SRC_DIR);
console.log('All done!');
