import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PROJECT_ROOT = path.resolve(__dirname, '..');
export const OUTPUT_DIR = path.resolve(PROJECT_ROOT, 'output');
export const AUTH_DIR = path.resolve(PROJECT_ROOT, '.wwebjs_auth');
export const FIXTURES_DIR = path.resolve(PROJECT_ROOT, 'tests', 'fixtures');

/**
 * Detect available Chromium / Google Chrome binary on Linux / NixOS.
 */
export function getChromiumExecutablePath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const candidates = [
    '/run/current-system/sw/bin/chromium',
    '/run/current-system/sw/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

/**
 * Ensure directory exists with strict permissions (0700).
 */
export function ensureSecureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true, mode: 0o700 });
  } else {
    try {
      fs.chmodSync(dirPath, 0o700);
    } catch {
      // Ignore chmod errors if filesystem restricts it
    }
  }
}
