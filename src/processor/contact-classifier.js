import { normalizePhoneNumber, isLidIdentifier } from '../normalizer/phone.js';
import { resolveContactIdentity } from '../normalizer/name.js';

// Service accounts to ignore
const SYSTEM_ACCOUNTS = new Set([
  '0@c.us',
  '0@s.whatsapp.net',
  '16505361212@c.us',
  'status@broadcast',
]);

/**
 * Determine if a contact or JID should be excluded (groups, broadcast, channels, bots).
 */
export function isIgnoredContact(contact) {
  if (!contact) return true;

  const id = typeof contact.id === 'object' ? contact.id?._serialized : String(contact.id || '');
  if (!id) return true;

  if (SYSTEM_ACCOUNTS.has(id)) return true;

  // Groups
  if (id.endsWith('@g.us') || contact.isGroup === true) return true;

  // Status and broadcasts
  if (id.endsWith('@broadcast') || id === 'status@broadcast') return true;

  // Channels / Newsletters
  if (id.endsWith('@newsletter') || contact.type === 'newsletter') return true;

  // Self or empty
  if (contact.isMe === true) return true;

  return false;
}

/**
 * Process a single raw contact into a standardized record.
 *
 * @param {object} rawContact - Raw contact object from whatsapp-web.js
 * @param {string} source - 'contact_list' | 'chat_list'
 * @param {Map<string, string>} [lidToPhoneMap] - Optional map of LID -> Phone Number
 * @returns {object|null} Standardized contact record or null if ignored
 */
export function processRawContact(rawContact, source = 'contact_list', lidToPhoneMap = new Map()) {
  if (isIgnoredContact(rawContact)) {
    return null;
  }

  const rawId = typeof rawContact.id === 'object' ? rawContact.id?._serialized : String(rawContact.id || '');
  const isLid = isLidIdentifier(rawId);

  // Identity resolution
  const identity = resolveContactIdentity(rawContact);

  // Phone number resolution:
  // 1. Try rawContact.number
  // 2. If rawContact.number is missing or is LID, check lidToPhoneMap
  // 3. Try parsing rawId if it is a phone JID (@c.us / @s.whatsapp.net)
  let candidatePhone = rawContact.number;

  if ((!candidatePhone || isLidIdentifier(candidatePhone)) && isLid && lidToPhoneMap.has(rawId)) {
    candidatePhone = lidToPhoneMap.get(rawId);
  }

  if (!candidatePhone) {
    candidatePhone = rawId;
  }

  const phoneNorm = normalizePhoneNumber(candidatePhone);

  const isSaved = identity.isSaved;
  const status = !phoneNorm.isValid
    ? 'UNRESOLVED'
    : isSaved
      ? 'SAVED'
      : 'CHAT_ONLY';

  return {
    id: rawId,
    isLid,
    status, // 'SAVED' | 'CHAT_ONLY' | 'UNRESOLVED'
    isSaved,
    displayName: identity.displayName,
    givenName: identity.givenName,
    familyName: identity.familyName,
    additionalName: identity.additionalName,
    customName: identity.customName,
    pushname: identity.pushname,
    verifiedName: identity.verifiedName,
    phoneRaw: candidatePhone || null,
    phoneNormalized: phoneNorm.normalized,
    phoneFormatted: phoneNorm.formatted,
    countryCode: phoneNorm.countryCode,
    phoneStatus: phoneNorm.reason || (phoneNorm.isValid ? 'VALID' : 'INVALID'),
    sources: [source],
    hasChat: source === 'chat_list',
    about: rawContact.about || null,
  };
}
