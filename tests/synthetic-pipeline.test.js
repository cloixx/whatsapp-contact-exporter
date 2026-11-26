import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { runExportPipeline } from '../src/processor/pipeline.js';
import { FIXTURES_DIR } from '../src/config.js';

describe('Synthetic End-to-End Pipeline', () => {
  const testOutputDir = path.join(FIXTURES_DIR, 'test_output');

  before(() => {
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  after(() => {
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  test('should execute full pipeline and generate all 7 valid output files', async () => {
    const rawContacts = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, 'raw-contacts.json'), 'utf8'));
    const rawChats = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, 'raw-chats.json'), 'utf8'));

    const lidToPhoneMap = new Map([
      ['102938475610293@lid', '380671112233'],
    ]);

    const result = await runExportPipeline({
      rawContacts,
      rawChats,
      storeContacts: [],
      lidToPhoneMap,
      outputDir: testOutputDir,
      onProgress: () => {}, // silent in tests
    });

    const { files, report } = result;

    // Verify all 7 files exist
    assert.strictEqual(fs.existsSync(files.whatsapp_contacts_csv), true);
    assert.strictEqual(fs.existsSync(files.whatsapp_chat_contacts_csv), true);
    assert.strictEqual(fs.existsSync(files.whatsapp_contacts_json), true);
    assert.strictEqual(fs.existsSync(files.whatsapp_contacts_vcf), true);
    assert.strictEqual(fs.existsSync(files.google_contacts_import_csv), true);
    assert.strictEqual(fs.existsSync(files.unresolved_contacts_csv), true);
    assert.strictEqual(fs.existsSync(files.export_report_json), true);

    // Verify report structure & contents
    assert.ok(report.summary.total_contacts_found > 0);
    assert.ok(report.summary.saved_contacts_count > 0);
    assert.ok(report.summary.unique_phone_numbers_count > 0);
    assert.ok(report.summary.duplicates_count >= 1);
    assert.strictEqual(report.summary.contacts_without_available_phone_number, 1);

    // Verify files content
    const contactsCsv = fs.readFileSync(files.whatsapp_contacts_csv, 'utf8');
    assert.strictEqual(contactsCsv.startsWith('\uFEFF'), true);
    assert.strictEqual(contactsCsv.includes('Іван Петренко'), true);
    assert.strictEqual(contactsCsv.includes('+380971234567'), true);

    const googleCsv = fs.readFileSync(files.google_contacts_import_csv, 'utf8');
    assert.strictEqual(googleCsv.includes('Mobile'), true);
    assert.strictEqual(googleCsv.includes('* myContacts ::: WhatsApp Saved Contacts'), true);

    const vcf = fs.readFileSync(files.whatsapp_contacts_vcf, 'utf8');
    assert.strictEqual(vcf.includes('BEGIN:VCARD'), true);
    assert.strictEqual(vcf.includes('+380971234567'), true);

    const json = JSON.parse(fs.readFileSync(files.whatsapp_contacts_json, 'utf8'));
    assert.ok(Array.isArray(json.saved_contacts));
    assert.ok(Array.isArray(json.chat_contacts));
    assert.ok(Array.isArray(json.unresolved_contacts));

    const unresolvedCsv = fs.readFileSync(files.unresolved_contacts_csv, 'utf8');
    assert.strictEqual(unresolvedCsv.includes('999999999999999@lid'), true);
  });
});
