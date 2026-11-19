import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillLint = path.join(root, '.agents', 'skills', 'design-taste-frontend', 'scripts', 'lint.mjs');
const targets = ['src', 'scripts', 'tests'].map((entry) => path.join(root, entry));

const result = spawnSync(process.execPath, [skillLint, ...targets], {
  cwd: root,
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
