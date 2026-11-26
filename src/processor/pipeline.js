import path from 'node:path';
import { OUTPUT_DIR, ensureSecureDir } from '../config.js';
import { processRawContact } from './contact-classifier.js';
import { deduplicateContacts } from './deduplicator.js';
import { writeCsvFile } from '../exporter/csv.js';
import { writeGoogleContactsCsv } from '../exporter/google-csv.js';
import { writeVcfFile } from '../exporter/vcf.js';
import { writeJsonFile } from '../exporter/json.js';
import { buildExportReport, writeReportFile } from './reporter.js';

/**
 * Execute the end-to-end export pipeline from raw contacts and chats.
 *
 * @param {object} options
 * @param {Array} options.rawContacts - Raw contact models from API
 * @param {Array} options.rawChats - Raw chat models from API
 * @param {Array} [options.storeContacts=[]] - Raw contact models from internal Store
 * @param {Map} [options.lidToPhoneMap=new Map()] - LID to Phone resolution map
 * @param {string} [options.outputDir=OUTPUT_DIR] - Destination output directory
 * @param {Function} [options.onProgress=console.log] - Logger callback
 * @returns {object} Pipeline execution summary & statistics
 */
export async function runExportPipeline({
  rawContacts = [],
  rawChats = [],
  storeContacts = [],
  lidToPhoneMap = new Map(),
  outputDir = OUTPUT_DIR,
  onProgress = console.log,
}) {
  const startTime = Date.now();
  ensureSecureDir(outputDir);

  const errorsAndLimitations = [];
  const processedRecords = [];

  onProgress(`[Pipeline] Processing ${rawContacts.length} contacts and ${rawChats.length} chats...`);

  // 1. Process standard contacts
  for (const raw of rawContacts) {
    try {
      const record = processRawContact(raw, 'contact_list', lidToPhoneMap);
      if (record) {
        processedRecords.push(record);
      }
    } catch (err) {
      errorsAndLimitations.push(`Error processing contact ${raw?.id}: ${err.message}`);
    }
  }

  // 2. Process store contacts (fallback / supplemental)
  for (const raw of storeContacts) {
    try {
      const record = processRawContact(raw, 'store_contacts', lidToPhoneMap);
      if (record) {
        processedRecords.push(record);
      }
    } catch (err) {
      errorsAndLimitations.push(`Error processing store contact ${raw?.id}: ${err.message}`);
    }
  }

  // 3. Process 1-to-1 chats
  for (const chat of rawChats) {
    try {
      // Exclude group chats
      if (chat.isGroup === true) continue;
      const chatId = typeof chat.id === 'object' ? chat.id?._serialized : String(chat.id || '');
      if (chatId.endsWith('@g.us') || chatId.endsWith('@broadcast') || chatId.endsWith('@newsletter')) {
        continue;
      }

      // In whatsapp-web.js, chat object has contact info or id
      const mockContact = {
        id: chat.id,
        name: chat.name,
        pushname: chat.pushname || null,
        isMyContact: false,
        isAddressBookContact: false,
        isWAContact: true,
      };

      const record = processRawContact(mockContact, 'chat_list', lidToPhoneMap);
      if (record) {
        processedRecords.push(record);
      }
    } catch (err) {
      errorsAndLimitations.push(`Error processing chat ${chat?.id}: ${err.message}`);
    }
  }

  onProgress(`[Pipeline] Total valid parsed records before deduplication: ${processedRecords.length}`);

  // 4. Deduplicate & Merge
  const dedupResult = deduplicateContacts(processedRecords);
  const {
    savedContacts,
    chatContacts,
    unresolvedContacts,
    duplicateCount,
    uniquePhoneCount,
  } = dedupResult;

  onProgress(`[Pipeline] Deduplication complete:`);
  onProgress(`  - Saved Contacts: ${savedContacts.length}`);
  onProgress(`  - Unsaved Chat Contacts: ${chatContacts.length}`);
  onProgress(`  - Unresolved (No phone/LID only): ${unresolvedContacts.length}`);
  onProgress(`  - Duplicates Merged: ${duplicateCount}`);
  onProgress(`  - Unique Phone Numbers: ${uniquePhoneCount}`);

  // 5. Check unresolved contacts limitation
  if (unresolvedContacts.length > 0) {
    errorsAndLimitations.push(
      `${unresolvedContacts.length} contacts have WhatsApp LID identifiers without an accessible phone number. Exported to unresolved_contacts.csv without guessing.`
    );
  }

  // 6. Write Export Files
  const allResolvedContacts = [...savedContacts, ...chatContacts];

  const files = {
    whatsapp_contacts_csv: path.join(outputDir, 'whatsapp_contacts.csv'),
    whatsapp_chat_contacts_csv: path.join(outputDir, 'whatsapp_chat_contacts.csv'),
    whatsapp_contacts_json: path.join(outputDir, 'whatsapp_contacts.json'),
    whatsapp_contacts_vcf: path.join(outputDir, 'whatsapp_contacts.vcf'),
    google_contacts_import_csv: path.join(outputDir, 'google_contacts_import.csv'),
    unresolved_contacts_csv: path.join(outputDir, 'unresolved_contacts.csv'),
    export_report_json: path.join(outputDir, 'export_report.json'),
  };

  onProgress(`[Pipeline] Generating export files in: ${outputDir}`);

  // 6.1 whatsapp_contacts.csv (Saved contacts)
  writeCsvFile(files.whatsapp_contacts_csv, savedContacts);

  // 6.2 whatsapp_chat_contacts.csv (Unsaved chat contacts)
  writeCsvFile(files.whatsapp_chat_contacts_csv, chatContacts);

  // 6.3 whatsapp_contacts.json (Complete structured dataset)
  writeJsonFile(files.whatsapp_contacts_json, {
    saved_contacts: savedContacts,
    chat_contacts: chatContacts,
    unresolved_contacts: unresolvedContacts,
  });

  // 6.4 whatsapp_contacts.vcf (vCard 3.0 of all resolved contacts)
  writeVcfFile(files.whatsapp_contacts_vcf, allResolvedContacts);

  // 6.5 google_contacts_import.csv (Google Contacts import format)
  writeGoogleContactsCsv(files.google_contacts_import_csv, savedContacts, 'WhatsApp Saved Contacts');

  // 6.6 unresolved_contacts.csv (Contacts with missing numbers / raw LIDs)
  writeCsvFile(files.unresolved_contacts_csv, unresolvedContacts);

  // 6.7 export_report.json
  const executionDurationMs = Date.now() - startTime;
  const reportData = buildExportReport({
    rawFoundCount: rawContacts.length + rawChats.length,
    savedContacts,
    chatContacts,
    unresolvedContacts,
    duplicateCount,
    uniquePhoneCount,
    errorsAndLimitations,
    executionDurationMs,
  });
  writeReportFile(files.export_report_json, reportData);

  onProgress(`[Pipeline] ✓ All 7 output files written successfully.`);

  return {
    report: reportData,
    files,
    dedupResult,
  };
}
