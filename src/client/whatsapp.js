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
    authTimeoutMs: 120000, // 2 minutes to allow initial bundle load
    qrMaxRetries: 0,       // Keep waiting for QR scan without aborting
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    puppeteer: {
      executablePath: chromiumPath,
      headless: headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-blink-features=AutomationControlled',
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

    client.on('loading_screen', (percent, message) => {
      onProgress(`[WhatsApp] Sync progress: ${percent}% - ${message}`);
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
        onProgress('[WhatsApp] ✓ Client is ready! Synchronizing contacts database...');

        // Wait for contact names to finish syncing from phone
        let lastNamed = 0;
        let stableTicks = 0;
        for (let i = 0; i < 30; i++) {
          try {
            const status = await client.pupPage.evaluate(() => {
              try {
                const coll = window.require ? window.require('WAWebCollections')?.Contact : null;
                const models = coll ? coll.getModelsArray() : [];
                let named = 0;
                for (const m of models) {
                  if (m.name || m.__x_name) named++;
                }
                return { total: models.length, named };
              } catch (e) {
                return { total: 0, named: 0 };
              }
            });

            if (status.named > 0) {
              onProgress(`[WhatsApp] Syncing: ${status.named} named contacts loaded (total in memory: ${status.total})...`);
              if (status.named === lastNamed) {
                stableTicks++;
                if (stableTicks >= 2) {
                  onProgress(`[WhatsApp] ✓ Contact synchronization complete! ${status.named} named contacts ready.`);
                  break;
                }
              } else {
                stableTicks = 0;
              }
              lastNamed = status.named;
            }
          } catch (e) {}

          await new Promise((r) => setTimeout(r, 2000));
        }

        // 1. Deep extraction via internal WAWebCollections / Store models (most reliable for names & LIDs)
        onProgress('[WhatsApp] Querying internal contact models and LID mappings...');
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

        // 2. Fetch contacts via standard API
        onProgress('[WhatsApp] Querying standard contacts database...');
        let rawContacts = [];
        try {
          rawContacts = await client.getContacts();
        } catch (err) {
          onProgress(`[WhatsApp] Standard getContacts() warning: ${err.message}`);
        }
        onProgress(`[WhatsApp] Found ${rawContacts.length} standard contacts, ${storeData.contacts.length} deep model contacts.`);

        // 3. Fetch chats to discover 1-to-1 conversation participants
        onProgress('[WhatsApp] Querying chat history list...');
        let rawChats = [];
        try {
          rawChats = await client.getChats();
        } catch (err) {
          onProgress(`[WhatsApp] Chat list warning: ${err.message}`);
        }
        onProgress(`[WhatsApp] Found ${rawChats.length} chat threads.`);

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
