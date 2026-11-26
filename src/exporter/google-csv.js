import fs from 'node:fs';
import { escapeCsvField } from './csv.js';

export const GOOGLE_CONTACTS_HEADERS = [
  'Name',
  'Given Name',
  'Additional Name',
  'Family Name',
  'Yomi Name',
  'Given Name Yomi',
  'Additional Name Yomi',
  'Family Name Yomi',
  'Name Prefix',
  'Name Suffix',
  'Initials',
  'Nickname',
  'Short Name',
  'Maiden Name',
  'Birthday',
  'Gender',
  'Location',
  'Billing Information',
  'Directory Server',
  'Mileage',
  'Occupation',
  'Hobby',
  'Sensitivity',
  'Priority',
  'Subject',
  'Notes',
  'Group Membership',
  'E-mail 1 - Type',
  'E-mail 1 - Value',
  'Phone 1 - Type',
  'Phone 1 - Value',
];

/**
 * Generate official Google Contacts CSV import file content.
 * Contacts with normalized phone numbers are mapped directly to 'Phone 1 - Value' (Mobile).
 */
export function generateGoogleContactsCsv(contacts, groupName = 'WhatsApp') {
  const rows = [GOOGLE_CONTACTS_HEADERS.join(',')];

  for (const c of contacts) {
    if (!c.phoneNormalized) continue; // Google Contacts import requires phone or email

    const noteParts = [
      `WhatsApp Status: ${c.isSaved ? 'Saved Contact' : 'Chat Conversation'}`,
      c.pushname ? `WhatsApp Pushname: ${c.pushname}` : null,
      c.id ? `WhatsApp ID: ${c.id}` : null,
      c.about ? `About: ${c.about}` : null,
    ].filter(Boolean);

    const row = [
      escapeCsvField(c.displayName),               // Name
      escapeCsvField(c.givenName || ''),           // Given Name
      escapeCsvField(c.additionalName || ''),      // Additional Name
      escapeCsvField(c.familyName || ''),          // Family Name
      '',                                          // Yomi Name
      '',                                          // Given Name Yomi
      '',                                          // Additional Name Yomi
      '',                                          // Family Name Yomi
      '',                                          // Name Prefix
      '',                                          // Name Suffix
      '',                                          // Initials
      escapeCsvField(c.pushname || ''),            // Nickname
      '',                                          // Short Name
      '',                                          // Maiden Name
      '',                                          // Birthday
      '',                                          // Gender
      '',                                          // Location
      '',                                          // Billing Information
      '',                                          // Directory Server
      '',                                          // Mileage
      '',                                          // Occupation
      '',                                          // Hobby
      '',                                          // Sensitivity
      '',                                          // Priority
      '',                                          // Subject
      escapeCsvField(noteParts.join('; ')),        // Notes
      escapeCsvField(`* myContacts ::: ${groupName}`), // Group Membership
      '',                                          // E-mail 1 - Type
      '',                                          // E-mail 1 - Value
      'Mobile',                                    // Phone 1 - Type
      escapeCsvField(c.phoneNormalized),           // Phone 1 - Value
    ];

    rows.push(row.join(','));
  }

  // Prepend UTF-8 BOM
  return '\uFEFF' + rows.join('\r\n') + '\r\n';
}

/**
 * Write Google Contacts CSV file.
 */
export function writeGoogleContactsCsv(filePath, contacts, groupName = 'WhatsApp') {
  const content = generateGoogleContactsCsv(contacts, groupName);
  fs.writeFileSync(filePath, content, { encoding: 'utf8', mode: 0o600 });
}
