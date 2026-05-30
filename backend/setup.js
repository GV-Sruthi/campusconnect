#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories to create
const dirs = [
  path.join(__dirname, 'models'),
  path.join(__dirname, 'routes'),
  path.join(__dirname, 'controllers'),
  path.join(__dirname, 'middleware'),
  path.join(__dirname, 'utils')
];

// Create directories
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

console.log('Backend directory structure initialized!');
