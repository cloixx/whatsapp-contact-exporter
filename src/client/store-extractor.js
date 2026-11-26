/**
 * Browser-side extraction helpers injected via Puppeteer page.evaluate().
 * Direct, robust access to WhatsApp Web's internal collections (WAWebCollections.Contact, Store.Contact, Store.LidUtils).
 */

export const BROWSER_STORE_EXTRACTOR_SCRIPT = `
(function() {
  const result = {
    contacts: [],
    lidToPhoneMap: {},
  };

  try {
    let models = [];
    try {
      const contactCollection = window.require ? window.require('WAWebCollections')?.Contact : null;
      if (contactCollection && typeof contactCollection.getModelsArray === 'function') {
        models = contactCollection.getModelsArray();
      }
    } catch (e) {}

    if ((!models || models.length === 0) && window.Store?.Contact?.models) {
      models = window.Store.Contact.models;
    }

    if (!models || models.length === 0) {
      return result;
    }

    // Pass 1: Build LID to Phone Number resolution map
    for (const m of models) {
      try {
        const id = m.id ? (m.id._serialized || String(m.id)) : '';
        const lid = m.lid ? (m.lid._serialized || String(m.lid)) : (id.endsWith('@lid') ? id : '');
        const phoneNumber = m.phoneNumber
          ? (m.phoneNumber._serialized || String(m.phoneNumber))
          : (m.number || m.__x_phoneNumber || (id.endsWith('@c.us') ? id : ''));

        const cleanPhone = String(phoneNumber).replace(/@(c\.us|s\.whatsapp\.net)$/, '');
        if (lid && cleanPhone && !lid.endsWith('@c.us') && !cleanPhone.includes('@lid')) {
          result.lidToPhoneMap[lid] = cleanPhone;
        }
      } catch (e) {}
    }

    // Pass 2: Extract contact details
    for (const m of models) {
      try {
        const id = m.id ? (m.id._serialized || String(m.id)) : '';
        if (!id) continue;

        // Skip non-contacts
        if (id.endsWith('@g.us') || id.endsWith('@broadcast') || id.endsWith('@newsletter') || id === 'status@broadcast') {
          continue;
        }

        const name = m.name || m.__x_name || null;
        const pushname = m.pushname || m.__x_pushname || null;
        const verifiedName = m.verifiedName || m.__x_verifiedName || null;
        const shortName = m.shortName || m.__x_shortName || null;
        const phoneNumber = m.phoneNumber
          ? (m.phoneNumber._serialized || String(m.phoneNumber))
          : (m.number || m.__x_phoneNumber || null);

        const cleanPhone = phoneNumber ? String(phoneNumber).replace(/@(c\.us|s\.whatsapp\.net)$/, '') : null;
        const isMyContact = Boolean(m.isMyContact || m.__x_isMyContact || m.syncToAddressbook || m.__x_syncToAddressbook);
        const isAddressBookContact = Boolean(m.isAddressBookContact || m.__x_isAddressBookContact || m.syncToAddressbook || m.__x_syncToAddressbook);

        result.contacts.push({
          id,
          name,
          pushname,
          verifiedName,
          shortName,
          number: cleanPhone,
          isMyContact,
          isAddressBookContact,
          isWAContact: Boolean(m.isWAContact || m.__x_isWAContact !== false),
          about: m.about || m.__x_about || null,
          isGroup: Boolean(m.isGroup || m.__x_isGroup),
          isUser: Boolean(m.isUser || m.__x_isUser),
        });
      } catch (itemErr) {}
    }
  } catch (err) {}

  return result;
})()
`;
