import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePhoneNumber,
  isLidIdentifier,
  extractDigitsFromJid,
} from '../src/normalizer/phone.js';

describe('Phone Normalizer', () => {
  test('should detect WhatsApp LID identifiers correctly', () => {
    assert.strictEqual(isLidIdentifier('102938475610293@lid'), true);
    assert.strictEqual(isLidIdentifier('380971234567@c.us'), false);
    assert.strictEqual(isLidIdentifier('+380971234567'), false);
    assert.strictEqual(isLidIdentifier(''), false);
    assert.strictEqual(isLidIdentifier(null), false);
  });

  test('should extract digits from WhatsApp JIDs', () => {
    assert.strictEqual(extractDigitsFromJid('380971234567@c.us'), '380971234567');
    assert.strictEqual(extractDigitsFromJid('14155552671@s.whatsapp.net'), '14155552671');
    assert.strictEqual(extractDigitsFromJid('+380 (50) 987-65-43'), '+380509876543');
    // Raw LID must not return digits as phone number
    assert.strictEqual(extractDigitsFromJid('102938475610293@lid'), null);
  });

  test('should normalize Ukrainian phone numbers to E.164', () => {
    const res1 = normalizePhoneNumber('380971234567@c.us');
    assert.strictEqual(res1.isValid, true);
    assert.strictEqual(res1.normalized, '+380971234567');
    assert.strictEqual(res1.countryCode, 380);

    const res2 = normalizePhoneNumber('0509876543', 'UA');
    assert.strictEqual(res2.isValid, true);
    assert.strictEqual(res2.normalized, '+380509876543');
  });

  test('should normalize International phone numbers (US, Germany)', () => {
    const us = normalizePhoneNumber('14155552671@c.us');
    assert.strictEqual(us.isValid, true);
    assert.strictEqual(us.normalized, '+14155552671');
    assert.strictEqual(us.countryCode, 1);

    const de = normalizePhoneNumber('4915123456789@c.us');
    assert.strictEqual(de.isValid, true);
    assert.strictEqual(de.normalized, '+4915123456789');
    assert.strictEqual(de.countryCode, 49);
  });

  test('should reject raw unmapped LIDs from being used as phone numbers', () => {
    const lidRes = normalizePhoneNumber('102938475610293@lid');
    assert.strictEqual(lidRes.isValid, false);
    assert.strictEqual(lidRes.normalized, null);
    assert.strictEqual(lidRes.reason, 'UNRESOLVED_LID');
  });

  test('should handle empty or invalid phone numbers safely', () => {
    const empty = normalizePhoneNumber('');
    assert.strictEqual(empty.isValid, false);

    const invalid = normalizePhoneNumber('abc');
    assert.strictEqual(invalid.isValid, false);
  });
});
