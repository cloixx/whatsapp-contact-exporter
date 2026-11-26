import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanNameString,
  splitName,
  resolveContactIdentity,
  isPhoneNumberOrId,
} from '../src/normalizer/name.js';

describe('Name Normalizer', () => {
  test('should clean Unicode whitespace and zero-width characters', () => {
    const dirty = '  Іван \u200B  Петренко \uFEFF ';
    assert.strictEqual(cleanNameString(dirty), 'Іван Петренко');
  });

  test('should identify raw phone numbers or JIDs', () => {
    assert.strictEqual(isPhoneNumberOrId('380971234567@c.us'), true);
    assert.strictEqual(isPhoneNumberOrId('+380 (97) 123-45-67'), true);
    assert.strictEqual(isPhoneNumberOrId('123456789012345@lid'), true);
    assert.strictEqual(isPhoneNumberOrId('Іван Петренко'), false);
    assert.strictEqual(isPhoneNumberOrId('John Doe'), false);
  });

  test('should split names into Given, Additional, and Family name correctly', () => {
    const single = splitName('Олена');
    assert.strictEqual(single.givenName, 'Олена');
    assert.strictEqual(single.familyName, '');

    const double = splitName('Іван Петренко');
    assert.strictEqual(double.givenName, 'Іван');
    assert.strictEqual(double.familyName, 'Петренко');

    const triple = splitName('Тарас Григорович Шевченко');
    assert.strictEqual(triple.givenName, 'Тарас');
    assert.strictEqual(triple.additionalName, 'Григорович');
    assert.strictEqual(triple.familyName, 'Шевченко');
  });

  test('should prioritize saved name over pushname and number', () => {
    const contact = {
      name: 'Мій Друг Сергій',
      pushname: 'Sergiy_Cool',
      number: '380971112233',
      isMyContact: true,
    };
    const identity = resolveContactIdentity(contact);
    assert.strictEqual(identity.isSaved, true);
    assert.strictEqual(identity.displayName, 'Мій Друг Сергій');
    assert.strictEqual(identity.pushname, 'Sergiy_Cool');
  });

  test('should handle unsaved contacts with pushname', () => {
    const contact = {
      name: null,
      pushname: 'Незнайомець',
      number: '380931122334',
      isMyContact: false,
    };
    const identity = resolveContactIdentity(contact);
    assert.strictEqual(identity.isSaved, false);
    assert.strictEqual(identity.displayName, 'Незнайомець');
  });

  test('should preserve emojis in contact names', () => {
    const contact = {
      name: 'Марія 🌸',
      isMyContact: true,
    };
    const identity = resolveContactIdentity(contact);
    assert.strictEqual(identity.displayName, 'Марія 🌸');
  });
});
