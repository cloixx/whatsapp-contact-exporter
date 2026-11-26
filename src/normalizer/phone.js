import libphonenumber from 'google-libphonenumber';

const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
const PNF = libphonenumber.PhoneNumberFormat;

/**
 * Check if an identifier is a raw WhatsApp LID (Linked Identity Device).
 * LIDs typically end with @lid or are 15-digit internal identifiers not representing a real phone number.
 */
export function isLidIdentifier(id) {
  if (!id) return false;
  const str = String(id).trim();
  if (str.endsWith('@lid')) return true;
  return false;
}

/**
 * Extract phone number digits from a WhatsApp serialized JID or raw string.
 * Examples:
 *  '380971234567@c.us' -> '380971234567'
 *  '+380 (97) 123-45-67' -> '380971234567'
 *  '15551234567@s.whatsapp.net' -> '15551234567'
 *  '123456789012345@lid' -> null (LID is not a phone number)
 */
export function extractDigitsFromJid(jidOrNumber) {
  if (!jidOrNumber) return null;
  const str = String(jidOrNumber).trim();

  if (isLidIdentifier(str)) {
    return null;
  }

  // Remove WhatsApp domain suffix if present
  const base = str.replace(/@(c\.us|s\.whatsapp\.net)$/i, '');

  // Extract only digits and optional leading +
  const clean = base.replace(/[^\d+]/g, '');
  return clean || null;
}

/**
 * Normalize a phone number to standard international E.164 format (e.g. +380971234567).
 *
 * @param {string} rawInput - Raw input string (JID, national phone, international phone)
 * @param {string} defaultRegion - Default region ISO code fallback (default: 'UA')
 * @returns {object} { isValid: boolean, normalized: string|null, formatted: string|null, countryCode: number|null, reason: string|null }
 */
export function normalizePhoneNumber(rawInput, defaultRegion = 'UA') {
  if (!rawInput) {
    return {
      isValid: false,
      normalized: null,
      formatted: null,
      countryCode: null,
      reason: 'EMPTY_INPUT',
    };
  }

  const str = String(rawInput).trim();

  if (isLidIdentifier(str)) {
    return {
      isValid: false,
      normalized: null,
      formatted: null,
      countryCode: null,
      reason: 'UNRESOLVED_LID',
    };
  }

  const cleaned = extractDigitsFromJid(str);
  if (!cleaned) {
    return {
      isValid: false,
      normalized: null,
      formatted: null,
      countryCode: null,
      reason: 'NO_DIGITS',
    };
  }

  // WhatsApp numbers in JID are full international numbers without the leading '+'.
  // We prepend '+' if not present so google-libphonenumber can parse directly.
  const candidates = [];
  if (cleaned.startsWith('+')) {
    candidates.push({ str: cleaned, region: undefined });
  } else {
    // 1. Try as international number with '+' prefix
    candidates.push({ str: `+${cleaned}`, region: undefined });
    // 2. Try as national number with default region
    candidates.push({ str: cleaned, region: defaultRegion });
  }

  for (const candidate of candidates) {
    try {
      const parsedNumber = phoneUtil.parseAndKeepRawInput(candidate.str, candidate.region);
      if (phoneUtil.isPossibleNumber(parsedNumber) && phoneUtil.isValidNumber(parsedNumber)) {
        const e164 = phoneUtil.format(parsedNumber, PNF.E164);
        const international = phoneUtil.format(parsedNumber, PNF.INTERNATIONAL);
        const countryCode = parsedNumber.getCountryCode();

        return {
          isValid: true,
          normalized: e164, // e.g. +380971234567
          formatted: international, // e.g. +380 97 123 4567
          countryCode,
          reason: null,
        };
      }
    } catch {
      // Continue to next candidate
    }
  }

  // Fallback: If strict validation fails but length is plausible for an international phone (7-15 digits)
  const digitsOnly = cleaned.replace(/\D/g, '');
  if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
    const fallbackE164 = `+${digitsOnly}`;
    return {
      isValid: true,
      normalized: fallbackE164,
      formatted: fallbackE164,
      countryCode: null,
      reason: 'FALLBACK_PLAUSIBLE',
    };
  }

  return {
    isValid: false,
    normalized: null,
    formatted: null,
    countryCode: null,
    reason: 'INVALID_PHONE_NUMBER',
  };
}
