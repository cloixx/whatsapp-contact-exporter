# WhatsApp Contact Exporter

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Tested With](https://img.shields.io/badge/WhatsApp-2.26.45.99-25D366.svg)](https://whatsapp.com/)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-blue.svg)](#privacidad-y-seguridad)

Idiomas: [English](README.md) | [Українська](README_UK.md) | [Русский](README_RU.md)

Herramienta local centrada en la privacidad para exportar tus contactos de WhatsApp (incluidos los contactos guardados exclusivamente en la nube de WhatsApp) a formatos estándar: **Google Contacts CSV**, **vCard 3.0 (.vcf)** y **CSV para Excel**.

Se ejecuta completamente en tu computadora. Sin servidores externos, sin acceso root y sin servicios de pago.

---

## 💡 ¿Por qué existe este proyecto?

Si alguna vez has intentado transferir tus contactos de WhatsApp a Google Contacts o a un teléfono nuevo, seguro que conoces la frustración: cientos de contactos se quedan atrapados en la nube de WhatsApp y no se pueden exportar con métodos estándar. ¡Nosotros también lo vivimos! 😅

Creamos esta herramienta para facilitarle la vida a cualquiera que necesite recuperar su agenda de forma rápida, gratuita y segura.

> ⚠️ **Sobre las actualizaciones de WhatsApp Web:**  
> WhatsApp Web evoluciona constantemente y Meta actualiza con frecuencia la estructura interna de la aplicación. Cuando esto ocurra, el proyecto necesitará las actualizaciones correspondientes. El autor (@cloixx) mantendrá este repositorio, solucionará errores y responderá a Issues según su tiempo libre 🙂.

> 🛡️ **Aviso amistoso (Descargo de responsabilidad):**  
> Esta herramienta se proporciona bajo licencia MIT «tal cual». El uso del programa es bajo tu propia responsabilidad. Te invitamos a revisar y auditar el código fuente con tus propios asistentes de IA antes de ejecutarlo — ¡la transparencia es fundamental! ✨

---

## 🤖 Uso con asistentes de IA (Antigravity, Claude Code, Codex / Cursor)

Puedes delegar la revisión, configuración y ejecución de este proyecto a tu agente de IA preferido en cuestión de segundos:

### 🔮 Google Antigravity (AGY)
```bash
agy "Clona https://github.com/cloixx/whatsapp-contact-exporter, verifica la seguridad del código, ejecuta las pruebas npm test y prepara run.sh para mi sistema."
```

### 🧠 Claude Code
```bash
claude "Inspecciona el repositorio https://github.com/cloixx/whatsapp-contact-exporter, confirma la seguridad del pipeline y ayúdame a exportar mis contactos."
```

### 💻 OpenAI Codex / ChatGPT / Cursor
Clona el proyecto, ábrelo en Cursor o VS Code y envía este mensaje a tu asistente:
> *«Verifica la seguridad de este proyecto, asegúrate de que funcione solo en modo local de lectura, ejecuta las pruebas sintéticas (`npm test`) y ayúdame a ejecutar `./run.sh` (o `run.bat` en Windows) para exportar mis contactos.»*

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

## 🚀 Guía detallada de instalación y uso (por sistema operativo)

### 🪟 Windows (Instrucciones sencillas para principiantes)

#### Paso 1: Instalar Node.js y el navegador
- **Navegador**: Asegúrate de tener instalado **Google Chrome** o **Microsoft Edge** (la herramienta lo utiliza en segundo plano para abrir WhatsApp Web).
- **Node.js**: Entra en [nodejs.org](https://nodejs.org/) y descarga la versión **LTS** (recomendada para la mayoría de los usuarios).
  - Abre el instalador `.msi` descargado.
  - Haz clic en **Next** (Siguiente) en todas las pantallas, acepta la licencia y haz clic en **Install**. ¡No necesitas cambiar nada!
  - *(Comprobación)*: Puedes abrir PowerShell y escribir `node -v` para ver la versión instalada (por ejemplo, `v20.x` o `v22.x`).

#### Paso 2: Descargar el proyecto
- En la parte superior derecha de esta página de GitHub, haz clic en el botón verde **Code** y luego en **Download ZIP**.
- Abre el archivo descargado y selecciona **Extraer todo...** (guarda la carpeta en el Escritorio o en Descargas).

#### Paso 3: Ejecutar con un doble clic
- Entra en la carpeta descomprimida.
- Haz doble clic sobre el archivo **`run.bat`**.
  - *Consejo*: Si aparece una ventana azul de protección de Windows SmartScreen, haz clic en **Más información** (More info) y después en **Ejecutar de todas formas** (Run anyway).
  - La primera vez, el programa descargará automáticamente las librerías necesarias (unos 15–30 segundos).
  - ¡En la ventana negra aparecerá el código QR listo para escanear!

---

### 🍏 macOS (Paso a paso para Mac)

#### Paso 1: Instalar Node.js
- Descarga y ejecuta el instalador (`.pkg`) desde [nodejs.org](https://nodejs.org/).
- *O usa Homebrew:*
  ```bash
  brew install node
  ```
- Comprueba que tienes Google Chrome en tu carpeta `/Applications`.

#### Paso 2: Descargar y descomprimir
- Haz clic en **Code** -> **Download ZIP** en GitHub y descomprime el archivo con un doble clic.

#### Paso 3: Abrir la Terminal y ejecutar
- Abre la app **Terminal** (pulsa `Cmd + Espacio`, escribe `Terminal` y presiona `Enter`).
- Ve a la carpeta del proyecto (escribe `cd ` y arrastra la carpeta descomprimida desde Finder a la ventana de la Terminal):
  ```bash
  cd ~/Downloads/whatsapp-contact-exporter-main
  ```
- Otorga permisos de ejecución y lanza el script:
  ```bash
  chmod +x run.sh
  ./run.sh
  ```
- ¡Verás el código QR en la pantalla de la Terminal!

---

### 🐧 Linux (Ubuntu, Linux Mint, Debian, Fedora, Arch)

#### Paso 1: Instalar paquetes necesarios
Abre tu terminal e instala Node.js y Chromium:

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

#### Paso 2: Clonar o descargar el repositorio
```bash
git clone https://github.com/cloixx/whatsapp-contact-exporter.git
cd whatsapp-contact-exporter
```

#### Paso 3: Ejecutar
```bash
chmod +x run.sh
./run.sh
```
*El script detectará tu sistema, ejecutará `npm install` si es necesario, conectará con Chromium y mostrará el código QR.*

---

### ❄️ NixOS (Entorno aislado con Flakes)

Para usuarios de NixOS, todo el entorno (Node.js 22, Chromium 158, configuración de Puppeteer y GitHub CLI) está predefinido en `flake.nix`. No requiere instalaciones globales:

```bash
git clone https://github.com/cloixx/whatsapp-contact-exporter.git
cd whatsapp-contact-exporter
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

## 🔒 Seguridad, limpieza de sesión y desvinculación obligatoria

> ### 🔴 ATENCIÓN: ¡ES OBLIGATORIO DESVINCULAR EL DISPOSITIVO EN TU TELÉFONO!
> Al escanear el código QR, tu teléfono vincula el navegador local a través de WhatsApp Multi-Device. Aunque el programa cierra el navegador al finalizar la exportación, **el token de autorización permanece activo en los servidores de Meta hasta que pulses explícitamente «Cerrar sesión»**.
> 
> **Si no desvinculas el dispositivo, la sesión quedará abierta en tu cuenta** y ocupará uno de los 4 espacios permitidos para dispositivos vinculados.
> 
> **¡Para garantizar una seguridad total, realiza los siguientes pasos inmediatamente después de guardar tus archivos!**

---

### Paso 1: Desvincular en tu teléfono móvil (El paso más importante)

Esta acción destruye definitivamente las claves criptográficas de la sesión en los servidores de WhatsApp:
1. Abre **WhatsApp** en tu teléfono móvil.
2. Toca en el **Menú (tres puntos ⋮)** en la esquina superior derecha (en Android) o entra en **Ajustes** (en iPhone).
3. Selecciona **Dispositivos vinculados** (**Linked Devices**).
4. En la lista de dispositivos activos, busca la sesión del navegador (normalmente aparece como `Google Chrome (Windows)`, `Google Chrome (Linux)` o `Mac OS`).
5. Toca sobre ella y pulsa **Cerrar sesión** (**Log Out**).
6. Comprueba que el dispositivo desaparece de la lista.

*Una vez cerrada la sesión desde el teléfono, nadie —ni siquiera alguien con acceso físico a tu ordenador— podrá volver a acceder a tu cuenta de WhatsApp con las claves antiguas.*

---

### Paso 2: Eliminar los archivos locales de sesión en tu ordenador

Tras revocar el acceso en el servidor, se recomienda borrar los tokens locales y la caché de la carpeta `.wwebjs_auth/`:

#### 🪟 En Windows
- **Opción A (Un solo clic):** Haz doble clic en el archivo **`clean.bat`** incluido en la carpeta del proyecto.
- **Opción B (Manual):** En el Explorador de archivos, activa la vista de elementos ocultos (*Vista -> Mostrar -> Elementos ocultos*), busca la carpeta `.wwebjs_auth` y bórrala (`Shift + Supr`).

#### 🍏 En macOS
- En la aplicación Terminal dentro de la carpeta del proyecto, ejecuta:
  ```bash
  ./run.sh --clean
  ```
- *O desde Finder:* En la carpeta del proyecto pulsa `Cmd + Shift + .` (punto) para mostrar las carpetas ocultas y arrastra `.wwebjs_auth` a la Papelera.

#### 🐧 En Linux / ❄️ NixOS
- En tu terminal ejecuta:
  ```bash
  ./run.sh --clean
  # o manualmente:
  rm -rf .wwebjs_auth .wwebjs_cache
  ```

---

### 🛡️ Garantías de privacidad y almacenamiento local

1. **¿Qué se guarda en `.wwebjs_auth`?**
   - Cookies temporales del navegador, datos de IndexedDB y claves de cifrado necesarias mientras se ejecuta WhatsApp Web. Esta carpeta está estrictamente bloqueada en `.gitignore` y **nunca debe compartirse ni subirse a internet**.
2. **¿Qué se guarda en `output/`?**
   - Tus contactos personales exportados en formato CSV y VCF.
   - En Linux/macOS los archivos se crean con permisos restringidos (`chmod 600`, lectura únicamente para tu usuario).
   - Una vez importado `google_contacts_import.csv` en Google Contacts o guardada tu copia de seguridad, puedes borrar la carpeta `output/` con total seguridad.
3. **Sin telemetría ni modificaciones**:
   - La herramienta funciona estrictamente en modo lectura (`client.getContacts()`).
   - No contiene código para enviar mensajes, eliminar conversaciones ni modificar contactos.

---

## 📄 Licencia

Licencia MIT. Libre para uso personal y comercial.
