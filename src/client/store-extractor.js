/**
 * Browser-side extraction helpers injected via Puppeteer page.evaluate().
 * This allows direct, robust access to WhatsApp Web's internal Store (Store.Contact, Store.LidUtils).
 */

export const BROWSER_STORE_EXTRACTOR_SCRIPT = `
(function() {
  const result = {
    contacts: [],
    lidToPhoneMap: {},
  };

  try {
    const store = window.Store;
    if (!store) {
      return result;
    }

    // 1. Extract LID to Phone mappings if LidUtils is present
    if (store.LidUtils) {
      try {
        // Some WhatsApp versions store cache in LidUtils or Contact.models
        if (typeof store.LidUtils.getPhoneNumber === 'function') {
          // Can be called per contact
        }
      } catch (e) {
        // Ignore internal LID helper errors
      }
    }

    // 2. Extract contacts from Store.Contact
    if (store.Contact && store.Contact.models) {
      for (const model of store.Contact.models) {
        try {
          const id = model.id ? (model.id._serialized || String(model.id)) : '';
          if (!id) continue;

          // Skip groups, status, broadcasts, newsletters
          if (id.endsWith('@g.us') || id.endsWith('@broadcast') || id.endsWith('@newsletter') || id === 'status@broadcast') {
            continue;
          }

          let phoneNumber = model.phoneNumber || model.number || '';
          let lid = model.lid ? (model.lid._serialized || String(model.lid)) : '';

          if (lid && phoneNumber) {
            result.lidToPhoneMap[lid] = String(phoneNumber);
          }

          result.contacts.push({
            id: id,
            name: model.name || null,
            pushname: model.pushname || null,
            verifiedName: model.verifiedName || null,
            shortName: model.shortName || null,
            number: phoneNumber || null,
            isMyContact: Boolean(model.isMyContact),
            isAddressBookContact: Boolean(model.isAddressBookContact),
            isWAContact: Boolean(model.isWAContact),
            about: model.about || null,
            isGroup: Boolean(model.isGroup),
            isUser: Boolean(model.isUser),
          });
        } catch (itemErr) {
          // Skip individual corrupted item
        }
      }
    }
  } catch (err) {
    // If Store access failed, return whatever was collected
  }

  return result;
})()
`;
