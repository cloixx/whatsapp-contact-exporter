# WhatsApp Contact Exporter

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Tested With](https://img.shields.io/badge/WhatsApp-2.26.45.99-25D366.svg)](https://whatsapp.com/)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-blue.svg)](#privacidad-y-seguridad)

Idiomas: [English](README.md) | [Українська](README_UK.md) | [Русский](README_RU.md)

Herramienta local centrada en la privacidad para exportar tus contactos de WhatsApp (incluidos los contactos guardados exclusivamente en la nube de WhatsApp) a formatos estándar: **Google Contacts CSV**, **vCard 3.0 (.vcf)** y **CSV para Excel**.

Se ejecuta completamente en tu computadora. Sin servidores externos, sin acceso root y sin servicios de pago.

---

## 👥 Autoría y origen del proyecto

Este proyecto fue desarrollado en colaboración entre el usuario **cloixx** y el asistente **Antigravity AI**.

Probado y validado en una cuenta real con **5.477 contactos** en **WhatsApp versión 2.26.45.99** (WhatsApp Web 2.3000.x):
- Se extrajeron con éxito **4.623 contactos guardados** con nombres y apellidos completos;
- Se normalizaron **5.007 números internacionales únicos**;
- Se fusionaron **5.330 registros duplicados**;
- Importación exitosa y verificada en Google Contacts.

---

## 🌟 Características principales

- **Contactos en la nube de WhatsApp**: Recupera contactos creados directamente en WhatsApp que nunca se guardaron en la agenda de tu teléfono.
- **Contactos de chats individuales**: Extrae participantes de conversaciones activas no guardados previamente.
- **Filtrado de contenido no deseado**: Omite automáticamente grupos (`@g.us`), difusiones (`@broadcast`), canales (`@newsletter`) y números de servicio.
- **Gestión de WhatsApp LID**: Convierte identificadores Linked Identity Device (`@lid`) en números de teléfono reales. Los LID no resueltos se guardan de forma segura en `unresolved_contacts.csv`.
- **Formato internacional E.164**: Normalización de números telefónicos (`+34...`, `+1...`, `+52...`).
- **Deduplicación inteligente**: Combina contactos repetidos priorizando los nombres más completos.
- **Compatible con UTF-8 BOM**: Los archivos CSV se abren correctamente en Excel, LibreOffice y Google Sheets sin problemas de codificación.
- **100% Privado y Seguro**: Funciona solo en modo lectura. No envía mensajes ni modifica tus chats.

---

## 🚀 Guía paso a paso

### 🪟 Windows (Fácil para principiantes)
1. Instala [Node.js (LTS)](https://nodejs.org/) con las opciones por defecto.
2. Descarga este repositorio (botón verde **Code** -> **Download ZIP**) y descomprime la carpeta.
3. Haz doble clic en el archivo **`run.bat`**.
4. Escanea el código QR que aparecerá en pantalla con la app de WhatsApp de tu teléfono.
5. Los archivos listos se generarán en la carpeta **`output`**.

### 🍏 macOS
1. Instala Node.js (desde [nodejs.org](https://nodejs.org/) o mediante `brew install node`).
2. Abre la terminal en la carpeta del proyecto y ejecuta:
   ```bash
   ./run.sh
   ```
3. Escanea el código QR con tu teléfono.

### 🐧 Linux (Ubuntu, Debian, Fedora, Arch)
1. Instala Node.js y Chromium:
   ```bash
   sudo apt update && sudo apt install nodejs npm chromium-browser
   ```
2. Ejecuta:
   ```bash
   chmod +x run.sh
   ./run.sh
   ```

### ❄️ NixOS
Ejecuta directamente con Nix Flakes:
```bash
./run.sh
```

---

## 📱 Cómo vincular con el código QR

1. Ejecuta `./run.sh` o `run.bat`.
2. Abre **WhatsApp** en tu teléfono móvil.
3. Ve a **Menú** (o Ajustes) -> **Dispositivos vinculados** -> **Vincular un dispositivo**.
4. Apunta la cámara al código QR de la terminal.
5. El programa esperará la sincronización, generará los archivos en `./output/` y cerrará la sesión de forma limpia.

---

## 📥 Cómo importar en Google Contacts

1. Entra en [Google Contacts](https://contacts.google.com/).
2. En el panel izquierdo, haz clic en **Importar**.
3. Haz clic en **Seleccionar archivo** y elige: `output/google_contacts_import.csv`.
4. Haz clic en **Importar**. Los contactos se sincronizarán inmediatamente con tu teléfono.

---

## 🧪 Pruebas con datos sintéticos

Para ejecutar las pruebas automáticas sin iniciar sesión en WhatsApp:
```bash
npm test
```
Para ejecutar el pipeline completo con datos de prueba:
```bash
./run.sh --synthetic
```

---

## 🔒 Cerrar y revocar sesión

Para borrar las credenciales locales de la sesión:
```bash
./run.sh --clean
```
También puedes desvincular el dispositivo desde tu teléfono: **WhatsApp -> Dispositivos vinculados -> Cerrar sesión**.

---

## 📄 Licencia

Licencia MIT. Libre para uso personal y comercial.
