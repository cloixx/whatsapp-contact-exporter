import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { deduplicateContacts } from '../src/processor/deduplicator.js';

describe('Deduplicator', () => {
  test('should merge duplicate records sharing the same normalized phone number', () => {
    const records = [
      {
        id: '380971234567@c.us',
        phoneNormalized: '+380971234567',
        displayName: 'Іван',
        customName: 'Іван',
        isSaved: true,
        status: 'SAVED',
        sources: ['contact_list'],
        hasChat: false,
      },
      {
        id: '380971234567@c.us',
        phoneNormalized: '+380971234567',
        displayName: 'Іван Петренко (Повне ім\'я)',
        customName: 'Іван Петренко (Повне ім\'я)',
        isSaved: true,
        status: 'SAVED',
        sources: ['chat_list'],
        hasChat: true,
      },
    ];

    const result = deduplicateContacts(records);
    assert.strictEqual(result.savedContacts.length, 1);
    assert.strictEqual(result.duplicateCount, 1);
    assert.strictEqual(result.uniquePhoneCount, 1);

    const merged = result.savedContacts[0];
    assert.strictEqual(merged.displayName, 'Іван Петренко (Повне ім\'я)');
    assert.strictEqual(merged.hasChat, true);
    assert.deepStrictEqual(merged.sources, ['contact_list', 'chat_list']);
  });

  test('should upgrade unsaved chat entry if a saved contact entry is found', () => {
    const records = [
      {
        id: '380501112233@c.us',
        phoneNormalized: '+380501112233',
        displayName: 'Pushname Only',
        isSaved: false,
        status: 'CHAT_ONLY',
        sources: ['chat_list'],
      },
      {
        id: '380501112233@c.us',
        phoneNormalized: '+380501112233',
        displayName: 'Кухар Василь',
        customName: 'Кухар Василь',
        isSaved: true,
        status: 'SAVED',
        sources: ['contact_list'],
      },
    ];

    const result = deduplicateContacts(records);
    assert.strictEqual(result.savedContacts.length, 1);
    assert.strictEqual(result.chatContacts.length, 0);
    assert.strictEqual(result.savedContacts[0].displayName, 'Кухар Василь');
    assert.strictEqual(result.savedContacts[0].isSaved, true);
  });
});
