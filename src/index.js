#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { OUTPUT_DIR, FIXTURES_DIR, AUTH_DIR, ensureSecureDir } from './config.js';
import { runExportPipeline } from './processor/pipeline.js';
import { runWhatsAppClient } from './client/whatsapp.js';

function printHelp() {
  console.log(`
================================================================================
 WhatsApp Contact Exporter - Privacy-First Local Contact Tool
================================================================================

USAGE:
  ./run.sh                  Connects to WhatsApp via QR code and exports contacts
  ./run.sh --synthetic      Runs full export pipeline with synthetic test data
  ./run.sh --help           Displays this help message
  ./run.sh --clean          Removes existing session data (.wwebjs_auth)

OUTPUT FILES (saved in ./output/):
  - whatsapp_contacts.csv       Saved WhatsApp contacts (UTF-8 BOM, Cyrillic-ready)
  - whatsapp_chat_contacts.csv  Unsaved contacts from active 1-to-1 chats
  - whatsapp_contacts.json      Full structured JSON dataset
  - whatsapp_contacts.vcf       vCard 3.0 format for mobile phone address book
  - google_contacts_import.csv  Google Contacts ready CSV import format
  - unresolved_contacts.csv     Contacts with unresolvable LIDs / missing numbers
  - export_report.json          Execution statistics & audit report

HOW TO AUTHORIZE VIA QR CODE:
  1. Run: ./run.sh
  2. Open WhatsApp on your smartphone (Google Pixel / Android)
  3. Go to: Settings -> Linked Devices -> Link a Device
  4. Point your camera at the QR code in the terminal
  5. The program will automatically extract contacts and close cleanly.

HOW TO REVOKE SESSION:
  - From phone: Settings -> Linked Devices -> Tap on the session -> Log Out
  - From terminal: ./run.sh --clean (or delete .wwebjs_auth/)

SECURITY GUARANTEES:
  ✓ 100% local processing on your machine.
  ✓ Read-only: Does NOT send messages, modify contacts, or read chats.
  ✓ Never uploads data to any external cloud, AI models, or third parties.
================================================================================
`);
}

async function handleClean() {
  console.log(`[Clean] Removing authentication session at: ${AUTH_DIR}`);
  if (fs.existsSync(AUTH_DIR)) {
    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    console.log('[Clean] ✓ Session removed successfully.');
  } else {
    console.log('[Clean] No active session found.');
  }
}

async function handleSynthetic() {
  console.log('================================================================');
  console.log(' Running WhatsApp Contact Exporter in SYNTHETIC TEST MODE');
  console.log('================================================================\n');

  const contactsFixturePath = path.join(FIXTURES_DIR, 'raw-contacts.json');
  const chatsFixturePath = path.join(FIXTURES_DIR, 'raw-chats.json');

  if (!fs.existsSync(contactsFixturePath) || !fs.existsSync(chatsFixturePath)) {
    console.error(`[Error] Test fixtures not found in ${FIXTURES_DIR}`);
    process.exit(1);
  }

  const rawContacts = JSON.parse(fs.readFileSync(contactsFixturePath, 'utf8'));
  const rawChats = JSON.parse(fs.readFileSync(chatsFixturePath, 'utf8'));

  // Synthetic LID to Phone map
  const lidToPhoneMap = new Map([
    ['102938475610293@lid', '380671112233'],
  ]);

  const result = await runExportPipeline({
    rawContacts,
    rawChats,
    storeContacts: [],
    lidToPhoneMap,
    outputDir: OUTPUT_DIR,
    onProgress: (msg) => console.log(msg),
  });

  console.log('\n================================================================');
  console.log(' SYNTHETIC EXPORT COMPLETED SUCCESSFULLY!');
  console.log('================================================================');
  console.log(`Report summary:`, JSON.stringify(result.report.summary, null, 2));
  console.log(`Output files are in: ${OUTPUT_DIR}\n`);
}

async function handleRealExport() {
  console.log('================================================================');
  console.log(' WhatsApp Contact Exporter - Live Export');
  console.log('================================================================\n');

  ensureSecureDir(OUTPUT_DIR);
  ensureSecureDir(AUTH_DIR);

  try {
    const { rawContacts, rawChats, storeContacts, lidToPhoneMap } = await runWhatsAppClient({
      headless: true,
      onProgress: (msg) => console.log(msg),
    });

    const result = await runExportPipeline({
      rawContacts,
      rawChats,
      storeContacts,
      lidToPhoneMap,
      outputDir: OUTPUT_DIR,
      onProgress: (msg) => console.log(msg),
    });

    console.log('\n================================================================');
    console.log(' LIVE EXPORT COMPLETED SUCCESSFULLY!');
    console.log('================================================================');
    console.log('Summary:');
    console.log(`  - Total Contacts Found:      ${result.report.summary.total_contacts_found}`);
    console.log(`  - Saved Contacts:            ${result.report.summary.saved_contacts_count}`);
    console.log(`  - Unsaved Chat Contacts:     ${result.report.summary.unsaved_chat_contacts_count}`);
    console.log(`  - Unique Phone Numbers:      ${result.report.summary.unique_phone_numbers_count}`);
    console.log(`  - Duplicates Merged:         ${result.report.summary.duplicates_count}`);
    console.log(`  - Contacts without Phone:    ${result.report.summary.contacts_without_available_phone_number}`);
    console.log(`\nOutput directory: ${OUTPUT_DIR}`);
    console.log(`  To import to Google Contacts: Use 'google_contacts_import.csv'`);
    console.log(`  To import to phone vCard:     Use 'whatsapp_contacts.vcf'\n`);
  } catch (err) {
    console.error('\n[Error] Export failed:', err.message);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  if (args.includes('--clean')) {
    await handleClean();
    return;
  }

  if (args.includes('--synthetic') || args.includes('-s')) {
    await handleSynthetic();
    return;
  }

  await handleRealExport();
}

main().catch((err) => {
  console.error('[Fatal Error]', err);
  process.exit(1);
});
