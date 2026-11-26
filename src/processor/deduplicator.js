import { isPhoneNumberOrId } from '../normalizer/name.js';

/**
 * Deduplicate contacts by normalized E.164 phone number (or ID for unresolved contacts).
 * Intelligently merges metadata between contact list and chat history entries.
 *
 * @param {Array<object>} records - Processed contact records
 * @returns {object} { savedContacts, chatContacts, unresolvedContacts, duplicateCount, mergedTotal }
 */
export function deduplicateContacts(records) {
  const phoneMap = new Map();
  const unresolvedMap = new Map();
  let duplicateCount = 0;

  for (const record of records) {
    if (!record) continue;

    if (record.phoneNormalized) {
      const key = record.phoneNormalized;
      if (phoneMap.has(key)) {
        duplicateCount++;
        const existing = phoneMap.get(key);

        // Merge sources
        for (const src of record.sources) {
          if (!existing.sources.includes(src)) {
            existing.sources.push(src);
          }
        }
        if (record.hasChat) existing.hasChat = true;

        // Upgrade status if any duplicate is SAVED
        if (record.isSaved && !existing.isSaved) {
          existing.isSaved = true;
          existing.status = 'SAVED';
        }

        // Prefer real custom name over placeholder / phone number
        const existingHasRealName = Boolean(existing.customName && !isPhoneNumberOrId(existing.customName));
        const recordHasRealName = Boolean(record.customName && !isPhoneNumberOrId(record.customName));

        if (!existingHasRealName && recordHasRealName) {
          existing.customName = record.customName;
          existing.displayName = record.displayName;
          existing.givenName = record.givenName;
          existing.familyName = record.familyName;
          existing.additionalName = record.additionalName;
        } else if (existingHasRealName && recordHasRealName) {
          const existingParts = (existing.familyName ? 1 : 0) + (existing.givenName ? 1 : 0);
          const recordParts = (record.familyName ? 1 : 0) + (record.givenName ? 1 : 0);
          if (recordParts > existingParts || (recordParts === existingParts && record.customName.length > existing.customName.length)) {
            existing.customName = record.customName;
            existing.displayName = record.displayName;
            existing.givenName = record.givenName;
            existing.familyName = record.familyName;
            existing.additionalName = record.additionalName;
          }
        }

        if (record.pushname && !existing.pushname) existing.pushname = record.pushname;
        if (record.verifiedName && !existing.verifiedName) existing.verifiedName = record.verifiedName;
        if (record.about && !existing.about) existing.about = record.about;
      } else {
        phoneMap.set(key, { ...record });
      }
    } else {
      // Unresolved contact (no valid phone number)
      const key = record.id || `unknown-${Math.random()}`;
      if (unresolvedMap.has(key)) {
        duplicateCount++;
        const existing = unresolvedMap.get(key);
        for (const src of record.sources) {
          if (!existing.sources.includes(src)) existing.sources.push(src);
        }
      } else {
        unresolvedMap.set(key, { ...record });
      }
    }
  }

  const allResolved = Array.from(phoneMap.values());
  const unresolvedContacts = Array.from(unresolvedMap.values());

  // Sort contacts alphabetically by display name (Unicode collation)
  const collator = new Intl.Collator('uk', { sensitivity: 'base', numeric: true });
  allResolved.sort((a, b) => collator.compare(a.displayName, b.displayName));
  unresolvedContacts.sort((a, b) => collator.compare(a.displayName, b.displayName));

  const savedContacts = allResolved.filter((c) => c.isSaved);
  const chatContacts = allResolved.filter((c) => !c.isSaved);

  return {
    savedContacts,
    chatContacts,
    unresolvedContacts,
    duplicateCount,
    uniquePhoneCount: phoneMap.size,
    totalMerged: allResolved.length + unresolvedContacts.length,
  };
}
