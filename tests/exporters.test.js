import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generateContactsCsv, escapeCsvField } from '../src/exporter/csv.js';
import { generateGoogleContactsCsv, GOOGLE_CONTACTS_HEADERS } from '../src/exporter/google-csv.js';
import { contactToVCard, generateVcf } from '../src/exporter/vcf.js';

describe('Exporters', () => {
  const sampleContacts = [
    {
      id: '380971234567@c.us',
      displayName: 'Петренко, Іван "Старший"',
      givenName: 'Іван',
      familyName: 'Петренко',
      additionalName: '',
      phoneNormalized: '+380971234567',
      phoneRaw: '380971234567',
      status: 'SAVED',
      isSaved: true,
      pushname: 'IvanP',
      sources: ['contact_list'],
      about: 'Тестовий опис',
      hasChat: false,
    },
    {
      id: '380509876543@c.us',
      displayName: 'Олена Ковальчук',
      givenName: 'Олена',
      familyName: 'Ковальчук',
      additionalName: '',
      phoneNormalized: '+380509876543',
      phoneRaw: '380509876543',
      status: 'SAVED',
      isSaved: true,
      pushname: 'Olena',
      sources: ['contact_list', 'chat_list'],
      about: null,
      hasChat: true,
    },
  ];

  test('CSV exporter should escape quotes and commas properly', () => {
    assert.strictEqual(escapeCsvField('Hello, World'), '"Hello, World"');
    assert.strictEqual(escapeCsvField('He said "Hi"'), '"He said ""Hi"""');
  });

  test('CSV exporter should prepend UTF-8 BOM (\uFEFF) for Excel/Cyrillic support', () => {
    const csv = generateContactsCsv(sampleContacts);
    assert.strictEqual(csv.startsWith('\uFEFF'), true);
    assert.strictEqual(csv.includes('Петренко'), true);
    assert.strictEqual(csv.includes('+380971234567'), true);
  });

  test('Google Contacts CSV should contain official headers and Mobile phone mappings', () => {
    const googleCsv = generateGoogleContactsCsv(sampleContacts);
    assert.strictEqual(googleCsv.startsWith('\uFEFF'), true);

    const firstLine = googleCsv.split('\r\n')[0].replace('\uFEFF', '');
    assert.strictEqual(firstLine, GOOGLE_CONTACTS_HEADERS.join(','));

    // Check Mobile mapping
    assert.strictEqual(googleCsv.includes('Mobile'), true);
    assert.strictEqual(googleCsv.includes('+380971234567'), true);
    assert.strictEqual(googleCsv.includes('* myContacts ::: WhatsApp'), true);
  });

  test('VCF exporter should format standard vCard 3.0 with UTF-8 charset', () => {
    const vcf = generateVcf(sampleContacts);
    assert.strictEqual(vcf.includes('BEGIN:VCARD'), true);
    assert.strictEqual(vcf.includes('VERSION:3.0'), true);
    assert.strictEqual(vcf.includes('FN;CHARSET=UTF-8:Олена Ковальчук'), true);
    assert.strictEqual(vcf.includes('TEL;TYPE=CELL,VOICE:+380509876543'), true);
    assert.strictEqual(vcf.includes('END:VCARD'), true);
  });
});
