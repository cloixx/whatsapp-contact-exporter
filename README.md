# WhatsApp Contact Exporter

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Tested With](https://img.shields.io/badge/WhatsApp-2.26.45.99-25D366.svg)](https://whatsapp.com/)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-blue.svg)](#privacy--security)

Language options: [Українська](README_UK.md) | [Русский](README_RU.md) | [Español](README_ES.md)

A privacy-focused utility to extract your own WhatsApp contacts (including contacts stored solely inside your WhatsApp account) directly to standard formats: **Google Contacts CSV**, **vCard 3.0 (.vcf)**, and **Excel-compatible CSV**.

Runs completely on your local computer. No cloud services, no root required, no paid APIs.

---

## 💡 Why This Project Exists

Have you ever tried moving away from WhatsApp or syncing your phone book with Google Contacts, only to discover that hundreds of your contacts are trapped exclusively inside WhatsApp's cloud storage? We have been there! 😅

This project was created to make life easier for everyone who faces this frustrating limitation. 

> ⚠️ **Heads up on WhatsApp Web updates:**  
> WhatsApp Web is constantly evolving, and Meta frequently updates internal web app structures. When things shift under the hood, this project will need corresponding updates. The author (@cloixx) will actively maintain this repository, fix issues, and update instructions as free time allows! Feel free to open an Issue or pull request if you notice changes! 🙂

> 🛡️ **Friendly Disclaimer:**  
> This open-source tool is provided free of charge for your convenience under the MIT License. You use it at your own discretion and responsibility. We encourage you to audit and inspect the code with your own AI assistants before running it — transparency is our core principle! ✨

---

## 🤖 Using with AI Assistants (Antigravity, Claude Code, Codex/Cursor)

If you use autonomous AI coding assistants, you can delegate running, auditing, and adapting this tool to your agent in seconds!

### 🔮 Google Antigravity (AGY)
```bash
agy "Clone https://github.com/cloixx/whatsapp-contact-exporter, review the code safety, run the test suite with npm test, and prepare run.sh for my environment."
```

### 🧠 Claude Code
```bash
claude "Inspect the https://github.com/cloixx/whatsapp-contact-exporter repository, verify the contact extraction pipeline, and help me execute the export safely."
```

### 💻 OpenAI Codex / ChatGPT / Cursor
Clone the repository, open it in Cursor or VS Code, and prompt your assistant:
> *"Audit this project to ensure it only operates locally in read-only mode, run the synthetic test suite (`npm test`), and help me run `./run.sh` (or `run.bat` on Windows) to export my WhatsApp contacts."*

---

## 👥 Authorship & Project Origin

This utility was created through a human-AI collaboration by **cloixx** and **Antigravity AI**. 

It was developed, tested, and validated on a live account with **5,477 total contacts** on **WhatsApp version 2.26.45.99** (WhatsApp Web 2.3000.x), successfully extracting **4,623 saved contacts** with complete first and last names, resolving **5,007 unique international phone numbers**, and deduplicating **5,330 redundant records** before importing seamlessly into Google Contacts.

---

## 🌟 Key Features

- **Extracts WhatsApp Cloud Contacts**: Retrieves contacts created directly inside WhatsApp that never synced to your phone book.
- **Includes Chat Contacts**: Option to extract unrecorded conversation partners from active one-on-one chats.
- **Filters Noise**: Automatically skips group chats (`@g.us`), broadcasts (`@broadcast`), newsletters/channels (`@newsletter`), and official system numbers.
- **Handles WhatsApp LID Identifiers**: Resolves Linked Identity Device (`@lid`) tags to real phone numbers. Unmapped LIDs are placed into `unresolved_contacts.csv` rather than fabricated.
- **Phone Normalization**: Standardizes numbers into international E.164 format (`+1...`, `+380...`, `+49...`).
- **Smart Deduplication**: Merges repeated contacts, prioritizing full names over placeholders.
- **UTF-8 with BOM**: CSV files open properly in Excel, LibreOffice, and Google Sheets with full support for Cyrillic, Latin, and emoji characters.
- **100% Offline & Private**: Zero data leaves your machine. Operates in read-only mode without sending messages or modifying your chats.

---

## 🚀 Detailed Installation & Setup Guide (By Operating System)

### 🪟 Windows (Simple 3-Step Guide)

#### Step 1: Install Node.js & Chrome
- **Google Chrome**: Ensure you have Google Chrome or Microsoft Edge installed (the tool uses your browser to open WhatsApp Web in the background).
- **Node.js**: Download the **LTS installer** from [nodejs.org](https://nodejs.org/).
  - Run the downloaded installer.
  - Keep clicking **Next**, accept the license, and click **Install**. No special settings are needed!
  - *(Optional)* To verify, open PowerShell and type `node -v`. It should show something like `v20.x.x` or `v22.x.x`.

#### Step 2: Download the Project
- On this GitHub page, click the green **Code** button at the top right, then click **Download ZIP**.
- Once downloaded, right-click the `.zip` archive and select **Extract All...** to unpack it into a folder (for example, on your Desktop or in Downloads).

#### Step 3: Run the Program
- Open the unpacked folder.
- Double-click **`run.bat`**.
  - *Tip:* If Windows SmartScreen shows a blue warning ("Windows protected your PC"), click **More info** and then **Run anyway**.
  - The script will automatically install all needed libraries on the first run (this takes about 15-30 seconds).
  - A QR code will appear directly inside the black console window!

---

### 🍏 macOS (Step-by-Step)

#### Step 1: Install Node.js
- Download and run the macOS installer (`.pkg`) from [nodejs.org](https://nodejs.org/).
- *Or with Homebrew (for developers):*
  ```bash
  brew install node
  ```
- Make sure Google Chrome is in your `/Applications` folder.

#### Step 2: Download & Extract
- Click the green **Code** button -> **Download ZIP**, and double-click the archive in your Downloads folder to extract it.

#### Step 3: Open Terminal & Run
- Open the **Terminal** app (press `Cmd + Space`, type `Terminal`, and press `Enter`).
- Navigate into the project directory (you can type `cd ` and drag-and-drop the extracted folder into Terminal):
  ```bash
  cd ~/Downloads/whatsapp-contact-exporter-main
  ```
- Make the script executable and launch:
  ```bash
  chmod +x run.sh
  ./run.sh
  ```
- A QR code will appear in your Terminal!

---

### 🐧 Linux (Ubuntu, Linux Mint, Debian, Fedora, Arch)

#### Step 1: Install Dependencies
Open your terminal and install Node.js and Chromium/Chrome:

- **Ubuntu / Linux Mint / Debian**:
  ```bash
  sudo apt update
  sudo apt install -y nodejs npm chromium-browser git
  ```
- **Fedora / RHEL**:
  ```bash
  sudo dnf install -y nodejs npm chromium git
  ```
- **Arch Linux / Manjaro**:
  ```bash
  sudo pacman -S --needed nodejs npm chromium git
  ```

#### Step 2: Clone or Download the Repository
```bash
git clone https://github.com/cloixx/whatsapp-contact-exporter.git
cd whatsapp-contact-exporter
```

#### Step 3: Run the Exporter
```bash
chmod +x run.sh
./run.sh
```
*The launcher checks your system, runs `npm install` automatically if needed, connects to Chromium, and prints the QR code in the terminal.*

---

### ❄️ NixOS (Zero-Configuration Isolated Flake)

On NixOS, everything (Node.js 22, Chromium 158, Puppeteer configuration, and GitHub CLI) is fully isolated inside `flake.nix`. No system changes or manual package installations are required:

```bash
git clone https://github.com/cloixx/whatsapp-contact-exporter.git
cd whatsapp-contact-exporter
./run.sh
```

---

## 📱 How to Scan the QR Code

1. Start `./run.sh` (or `run.bat` on Windows).
2. Open **WhatsApp** on your smartphone.
3. Tap **Menu** (three dots on Android, or Settings on iPhone) -> **Linked Devices** -> **Link a Device**.
4. Point your camera at the QR code in your computer terminal.
5. The program will wait for contact synchronization, extract all records, save the files to `./output/`, and cleanly close the session.

---

## 📥 How to Import into Google Contacts

1. Go to [Google Contacts](https://contacts.google.com/).
2. On the left sidebar, click **Import**.
3. Click **Select file** and choose:
   `output/google_contacts_import.csv`
4. Click **Import**. Your contacts will immediately synchronize with your Android device or Google account.

---

## 📂 Output Files (`./output/`)

- `google_contacts_import.csv`: Formatted specifically for Google Contacts import with Mobile phone mappings.
- `whatsapp_contacts.vcf`: Standard vCard 3.0 file for phone address books.
- `whatsapp_contacts.csv`: All saved contacts with UTF-8 BOM.
- `whatsapp_chat_contacts.csv`: Contacts from 1-to-1 conversation history.
- `whatsapp_contacts.json`: Complete structured JSON dataset.
- `unresolved_contacts.csv`: Records with private LIDs lacking phone number mapping.
- `export_report.json`: Summary metrics and audit numbers.

---

## 🧪 Testing on Synthetic Data

To run the automated test suite without a WhatsApp login:
```bash
npm test
```
To run the full end-to-end export pipeline using synthetic test data:
```bash
./run.sh --synthetic
```

---

## 🔒 Session Cleanup & Security

To revoke the session from your terminal and delete stored tokens:
```bash
./run.sh --clean
```
You can also unlink the device anytime from your phone via **WhatsApp -> Linked Devices -> Log out**.

---

## 📄 License

MIT License. Free for personal and commercial use.
