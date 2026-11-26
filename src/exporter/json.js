import fs from 'node:fs';

/**
 * Write structured data to a JSON file.
 */
export function writeJsonFile(filePath, data) {
  const content = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, content, { encoding: 'utf8', mode: 0o600 });
}
