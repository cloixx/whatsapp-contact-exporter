import fs from 'node:fs';

/**
 * Escape text according to vCard 3.0 rules.
 */
function escapeVCardText(text) {
  if (!text) return '';
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Generate vCard 3.0 string for a single contact.
 */
export function contactToVCard(contact) {
  if (!contact.phoneNormalized) return '';

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN;CHARSET=UTF-8:${escapeVCardText(contact.displayName)}`,
    `N;CHARSET=UTF-8:${escapeVCardText(contact.familyName || '')};${escapeVCardText(contact.givenName || '')};${escapeVCardText(contact.additionalName || '')};;`,
    `TEL;TYPE=CELL,VOICE:${contact.phoneNormalized}`,
  ];

  if (contact.pushname) {
    lines.push(`NICKNAME;CHARSET=UTF-8:${escapeVCardText(contact.pushname)}`);
  }

  const noteParts = [
    `WhatsApp Status: ${contact.isSaved ? 'Saved Contact' : 'Chat Conversation'}`,
    contact.pushname ? `Pushname: ${contact.pushname}` : null,
    contact.about ? `About: ${contact.about}` : null,
  ].filter(Boolean);

  if (noteParts.length > 0) {
    lines.push(`NOTE;CHARSET=UTF-8:${escapeVCardText(noteParts.join(' | '))}`);
  }

  if (contact.id) {
    lines.push(`X-WA-ID:${escapeVCardText(contact.id)}`);
  }

  lines.push('END:VCARD');
  return lines.join('\r\n') + '\r\n';
}

/**
 * Generate complete .vcf file string for an array of contacts.
 */
export function generateVcf(contacts) {
  return contacts.map(contactToVCard).filter(Boolean).join('');
}

/**
 * Write contacts to .vcf file.
 */
export function writeVcfFile(filePath, contacts) {
  const content = generateVcf(contacts);
  fs.writeFileSync(filePath, content, { encoding: 'utf8', mode: 0o600 });
}
