import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';
import { AUTH_DIR, getChromiumExecutablePath, ensureSecureDir } from '../config.js';
import { BROWSER_STORE_EXTRACTOR_SCRIPT } from './store-extractor.js';

/**
 * Initialize and run WhatsApp client for contact extraction.
 *
 * @param {object} options
 * @param {boolean} [options.headless=true] - Run browser in headless mode
 * @param {Function} [options.onProgress] - Progress callback
 * @returns {Promise<{ rawContacts: Array, rawChats: Array, storeContacts: Array, lidToPhoneMap: Map }>}
 */
export async function runWhatsAppClient(options = {}) {
  const { headless = true, onProgress = console.log } = options;

  ensureSecureDir(AUTH_DIR);

  const chromiumPath = getChromiumExecutablePath();
  if (!chromiumPath) {
    throw new Error(
      'Chromium executable not found! Make sure to run inside the Nix Flake environment (`nix develop`) or have Chromium/Chrome installed.'
    );
  }

  onProgress(`[WhatsApp] Using browser binary: ${chromiumPath}`);
  onProgress('[WhatsApp] Initializing WhatsApp Web client...');

  const client = new Client({
    authStrategy: new LocalAuth({
      dataPath: AUTH_DIR,
    }),
    puppeteer: {
      executablePath: chromiumPath,
      headless: headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
      ],
    },
  });

  return new Promise((resolve, reject) => {
    let isFinished = false;

    client.on('qr', (qr) => {
      onProgress('\n================================================================');
      onProgress(' Scan the QR code below using WhatsApp on your phone:');
      onProgress(' Settings -> Linked Devices -> Link a Device');
      onProgress('================================================================\n');
      qrcode.generate(qr, { small: true });
      onProgress('\nWaiting for scan...');
    });

    client.on('authenticated', () => {
      onProgress('[WhatsApp] ✓ Authentication successful!');
    });

    client.on('auth_failure', (msg) => {
      onProgress(`[WhatsApp] ✗ Authentication failure: ${msg}`);
      reject(new Error(`Authentication failed: ${msg}`));
    });

    client.on('disconnected', (reason) => {
      onProgress(`[WhatsApp] Disconnected: ${reason}`);
    });

    client.on('ready', async () => {
      if (isFinished) return;
      isFinished = true;

      try {
        onProgress('[WhatsApp] ✓ Client is ready! Starting contact extraction...');

        // 1. Fetch contacts via standard API
        onProgress('[WhatsApp] Querying contacts database...');
        const rawContacts = await client.getContacts();
        onProgress(`[WhatsApp] Found ${rawContacts.length} raw contact entries.`);

        // 2. Fetch chats to discover 1-to-1 conversation participants
        onProgress('[WhatsApp] Querying chat history list...');
        const rawChats = await client.getChats();
        onProgress(`[WhatsApp] Found ${rawChats.length} chat threads.`);

        // 3. Deep extraction via browser store
        onProgress('[WhatsApp] Querying internal Store.Contact models and LID mappings...');
        let storeData = { contacts: [], lidToPhoneMap: {} };
        try {
          if (client.pupPage) {
            storeData = await client.pupPage.evaluate(BROWSER_STORE_EXTRACTOR_SCRIPT);
          }
        } catch (storeErr) {
          onProgress(`[WhatsApp] Warning: Direct Store evaluation skipped: ${storeErr.message}`);
        }

        const lidToPhoneMap = new Map();
        if (storeData && storeData.lidToPhoneMap) {
          for (const [lid, phone] of Object.entries(storeData.lidToPhoneMap)) {
            lidToPhoneMap.set(lid, phone);
          }
        }

        onProgress(`[WhatsApp] Extraction complete. Closing browser session...`);
        await client.destroy();

        resolve({
          rawContacts,
          rawChats,
          storeContacts: storeData.contacts || [],
          lidToPhoneMap,
        });
      } catch (err) {
        try {
          await client.destroy();
        } catch {
          // ignore destroy errors
        }
        reject(err);
      }
    });

    client.initialize().catch((err) => {
      reject(err);
    });
  });
}
