#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.join(__dirname, 'src'); // adjust if needed

function toPascalCase(name) {
  return name
    .replace(/(^\w|_\w)/g, (m) => m.replace('_', '').toUpperCase());
}

function convertFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let updated = false;

  // Match JSX function calls with NO arguments
  const jsxFuncRegex = /\{([a-zA-Z0-9_]+)\(\s*\)\}/g;

  const matches = [...content.matchAll(jsxFuncRegex)];

  for (const match of matches) {
    const funcName = match[1];
    const componentName = toPascalCase(funcName);
    content = content.replace(match[0], `<${componentName} />`);
    updated = true;
  }

  // Convert local function declarations to arrow components
  // Only simple functions with no params
  const funcDeclRegex = /function\s+([a-zA-Z0-9_]+)\s*\(\s*\)\s*{([\s\S]*?)}/gm;

  content = content.replace(funcDeclRegex, (match, name, body) => {
    updated = true;
    const componentName = toPascalCase(name);
    return `const ${componentName} = () => {${body}}`;
  });

  if (updated) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      convertFile(fullPath);
    }
  }
}

walkDir(SRC_DIR);
console.log('Done converting functions to components.');
