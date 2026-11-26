/**
 * Clean and normalize names with full Unicode and Cyrillic support.
 */
export function cleanNameString(str) {
  if (!str) return '';
  return String(str)
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // remove zero-width spaces
    .replace(/\s+/g, ' ')                  // normalize multiple whitespace
    .trim();
}

/**
 * Determine if a string is essentially just a phone number or raw identifier.
 */
export function isPhoneNumberOrId(str) {
  if (!str) return false;
  const cleaned = String(str).trim();
  // If it's a JID or LID
  if (cleaned.endsWith('@c.us') || cleaned.endsWith('@lid') || cleaned.endsWith('@s.whatsapp.net')) {
    return true;
  }
  // If it's only digits, spaces, dashes, plus, or parens
  if (/^[\d+\-()\s]{6,}$/.test(cleaned)) {
    return true;
  }
  return false;
}

/**
 * Split a full name into Given Name and Family Name for Google Contacts compatibility.
 * Correctly handles single names, multi-part Ukrainian/Cyrillic names, and nicknames.
 */
export function splitName(fullName) {
  const cleaned = cleanNameString(fullName);
  if (!cleaned) {
    return { givenName: '', familyName: '', additionalName: '' };
  }

  const parts = cleaned.split(' ').filter(Boolean);
  if (parts.length === 1) {
    return {
      givenName: parts[0],
      familyName: '',
      additionalName: '',
    };
  }

  if (parts.length === 2) {
    return {
      givenName: parts[0],
      familyName: parts[1],
      additionalName: '',
    };
  }

  // 3 or more parts (e.g. First Middle Last, or "Іван Іванович Петренко")
  return {
    givenName: parts[0],
    additionalName: parts.slice(1, -1).join(' '),
    familyName: parts[parts.length - 1],
  };
}

/**
 * Resolve display name and contact classification.
 *
 * WhatsApp contact object contains:
 * - isMyContact: boolean (true if saved by the user in phone or WhatsApp cloud)
 * - isAddressBookContact: boolean (true if synced from phone contacts)
 * - name: user-assigned custom name
 * - pushname: name provided by contact in their profile
 * - verifiedName: official business name
 * - shortName: nickname
 * - number: phone number digits
 */
export function resolveContactIdentity(rawContact) {
  const isMyContact = Boolean(rawContact.isMyContact || rawContact.isAddressBookContact);
  const rawName = cleanNameString(rawContact.name);
  const pushname = cleanNameString(rawContact.pushname);
  const verifiedName = cleanNameString(rawContact.verifiedName);
  const shortName = cleanNameString(rawContact.shortName);

  // Check if name is distinct and meaningful (not just phone number or id)
  const hasCustomName = Boolean(rawName && !isPhoneNumberOrId(rawName));
  const isSaved = isMyContact || hasCustomName;

  // Determine display name in order of priority:
  let displayName = '';
  if (hasCustomName) {
    displayName = rawName;
  } else if (verifiedName) {
    displayName = verifiedName;
  } else if (pushname && !isPhoneNumberOrId(pushname)) {
    displayName = pushname;
  } else if (shortName && !isPhoneNumberOrId(shortName)) {
    displayName = shortName;
  } else if (rawContact.number && !isPhoneNumberOrId(rawContact.number)) {
    displayName = rawContact.number;
  } else {
    displayName = isSaved ? 'Saved Contact' : 'WhatsApp Contact';
  }

  const nameParts = splitName(displayName);

  return {
    isSaved,
    displayName,
    givenName: nameParts.givenName,
    familyName: nameParts.familyName,
    additionalName: nameParts.additionalName,
    customName: rawName || null,
    pushname: pushname || null,
    verifiedName: verifiedName || null,
  };
}
