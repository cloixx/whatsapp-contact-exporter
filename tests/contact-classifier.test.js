import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  isIgnoredContact,
  processRawContact,
} from '../src/processor/contact-classifier.js';

describe('Contact Classifier', () => {
  test('should ignore groups, broadcast, newsletters, and bots', () => {
    assert.strictEqual(isIgnoredContact({ id: '120363028371928374@g.us', isGroup: true }), true);
    assert.strictEqual(isIgnoredContact({ id: 'status@broadcast' }), true);
    assert.strictEqual(isIgnoredContact({ id: 'user@broadcast' }), true);
    assert.strictEqual(isIgnoredContact({ id: '120363148192837465@newsletter' }), true);
    assert.strictEqual(isIgnoredContact({ id: '0@c.us' }), true);
    assert.strictEqual(isIgnoredContact({ id: '16505361212@c.us' }), true);
    assert.strictEqual(isIgnoredContact({ id: '380971234567@c.us' }), false);
  });

  test('should classify saved contact correctly', () => {
    const raw = {
      id: '380971234567@c.us',
      name: 'Іван Петренко',
      number: '380971234567',
      isMyContact: true,
      isAddressBookContact: true,
    };
    const processed = processRawContact(raw, 'contact_list');
    assert.strictEqual(processed.status, 'SAVED');
    assert.strictEqual(processed.phoneNormalized, '+380971234567');
    assert.strictEqual(processed.displayName, 'Іван Петренко');
  });

  test('should classify unsaved chat contact correctly', () => {
    const raw = {
      id: '380931122334@c.us',
      name: null,
      pushname: 'Андрій',
      number: '380931122334',
      isMyContact: false,
    };
    const processed = processRawContact(raw, 'chat_list');
    assert.strictEqual(processed.status, 'CHAT_ONLY');
    assert.strictEqual(processed.isSaved, false);
    assert.strictEqual(processed.hasChat, true);
  });

  test('should resolve LID if mapping is available in lidToPhoneMap', () => {
    const raw = {
      id: '102938475610293@lid',
      name: 'Олександр LID',
      number: null,
      isMyContact: true,
    };
    const lidMap = new Map([
      ['102938475610293@lid', '380671112233'],
    ]);
    const processed = processRawContact(raw, 'contact_list', lidMap);
    assert.strictEqual(processed.status, 'SAVED');
    assert.strictEqual(processed.phoneNormalized, '+380671112233');
  });

  test('should route unmapped LID to UNRESOLVED status without fake phone', () => {
    const raw = {
      id: '999999999999999@lid',
      name: 'Таємний контакт',
      number: null,
      isMyContact: true,
    };
    const processed = processRawContact(raw, 'contact_list', new Map());
    assert.strictEqual(processed.status, 'UNRESOLVED');
    assert.strictEqual(processed.phoneNormalized, null);
    assert.strictEqual(processed.phoneStatus, 'UNRESOLVED_LID');
  });
});
