import fs from 'node:fs';
import { writeJsonFile } from '../exporter/json.js';

/**
 * Generate a comprehensive audit and export report.
 */
export function buildExportReport({
  rawFoundCount = 0,
  savedContacts = [],
  chatContacts = [],
  unresolvedContacts = [],
  duplicateCount = 0,
  uniquePhoneCount = 0,
  errorsAndLimitations = [],
  executionDurationMs = 0,
}) {
  const report = {
    generated_at: new Date().toISOString(),
    execution_duration_seconds: (executionDurationMs / 1000).toFixed(2),
    summary: {
      total_contacts_found: rawFoundCount,
      saved_contacts_count: savedContacts.length,
      unsaved_chat_contacts_count: chatContacts.length,
      unique_phone_numbers_count: uniquePhoneCount,
      duplicates_count: duplicateCount,
      contacts_without_available_phone_number: unresolvedContacts.length,
    },
    files_exported: [
      'whatsapp_contacts.csv',
      'whatsapp_chat_contacts.csv',
      'whatsapp_contacts.json',
      'whatsapp_contacts.vcf',
      'google_contacts_import.csv',
      'unresolved_contacts.csv',
      'export_report.json',
    ],
    errors_and_limitations: errorsAndLimitations,
  };

  return report;
}

/**
 * Write export report to JSON file.
 */
export function writeReportFile(filePath, reportData) {
  writeJsonFile(filePath, reportData);
}
