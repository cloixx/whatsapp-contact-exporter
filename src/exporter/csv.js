import fs from 'node:fs';

/**
 * Escape a field for RFC 4180 CSV compliance.
 */
export function escapeCsvField(field) {
  if (field === null || field === undefined) return '';
  const str = String(field);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Format a list of contact records as a standard CSV with UTF-8 BOM.
 * UTF-8 BOM (\uFEFF) ensures Excel and other spreadsheet apps render Cyrillic correctly.
 */
export function generateContactsCsv(contacts, options = {}) {
  const headers = [
    'Name',
    'Given Name',
    'Family Name',
    'Phone (International)',
    'Phone (Raw)',
    'Status',
    'Pushname',
    'WhatsApp ID',
    'Source',
    'Notes',
  ];

  const rows = [headers.join(',')];

  for (const c of contacts) {
    const row = [
      escapeCsvField(c.displayName),
      escapeCsvField(c.givenName),
      escapeCsvField(c.familyName),
      escapeCsvField(c.phoneNormalized || ''),
      escapeCsvField(c.phoneRaw || ''),
      escapeCsvField(c.status),
      escapeCsvField(c.pushname || ''),
      escapeCsvField(c.id),
      escapeCsvField(c.sources ? c.sources.join('; ') : ''),
      escapeCsvField(c.about || (c.hasChat ? 'Had WhatsApp chat' : '')),
    ];
    rows.push(row.join(','));
  }

  // Prepend UTF-8 BOM
  return '\uFEFF' + rows.join('\r\n') + '\r\n';
}

/**
 * Write contacts to a CSV file on disk.
 */
export function writeCsvFile(filePath, contacts) {
  const content = generateContactsCsv(contacts);
  fs.writeFileSync(filePath, content, { encoding: 'utf8', mode: 0o600 });
}
