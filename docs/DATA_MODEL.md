# Data Model — IndexedDB

## Database

- **Name:** `comunick`
- **Version:** 1 (increment if schema migration is needed)
- **Wrapped via:** `idb` library

## Object Stores

### `boards`

Stores all communication boards created by the speech therapist.

```js
{
  keyPath: "id",           // string, ex: "board_principal"
  autoIncrement: false
}

// Document shape:
{
  // Identification
  "id": "board_principal",            // unique, defined by admin
  "name": "Comunicação Básica",       // display name
  "createdAt": 1712345678000,         // Date.now()
  "updatedAt": 1712345678000,         // Date.now()

  // Grid
  "rows": 2,                          // number of rows (1-12)
  "cols": 1,                          // number of columns (1-12)
  "cellsOrder": ["c1", "c2", "c3"],   // order array of cell ids

  // Board settings
  "lang": "pt-BR",                    // language override (optional)
  "ttsRate": 1.0,                     // speech rate (0.1-10)
  "ttsPitch": 1.0,                    // speech pitch (0-2)

  // Cells (inline for query simplicity)
  "cells": {
    "c1": {
      "id": "c1",
      "label": "Água",
      "speech": "Quero água",
      "imageId": "1234",             // ARASAAC ID
      "imageUrl": "https://...",     // Downloaded ARASAAC URL
      "imageLocalPath": "/arasaac-cache/1234.png", // local cache
      "backgroundColor": "#3498db",  // optional
      "textColor": "#ffffff"         // optional
    },
    "c2": {
      "id": "c2",
      "label": "Comer",
      "speech": "Quero comer",
      "imageId": "5678",
      "imageUrl": "https://...",
      "imageLocalPath": "/arasaac-cache/5678.png",
      "backgroundColor": "#e74c3c",
      "textColor": "#ffffff"
    }
  }
}
```

### `settings`

Global app settings.

```js
{
  keyPath: "id",
  autoIncrement: false
}

// Document shape:
{
  "id": "global",
  "lang": "pt-BR",                    // current language
  "currentBoardId": "board_principal", // active board
  "ttsRate": 1.0,                     // global default rate
  "ttsPitch": 1.0,                    // global default pitch
  "ttsProvider": "native",            // "native" | "external" (future)
  "ttsExternalUrl": "",               // external provider URL (future)
  "adminMode": false,                  // admin active?
  "theme": "light",                    // "light" | "high-contrast" (future)
  "lastSyncAt": 0                     // last sync (future)
}
```

### `pictograms_cache`

Local cache of ARASAAC pictograms for offline use.

```js
{
  keyPath: "imageId",
  autoIncrement: false
}

// Document shape:
{
  "imageId": "1234",        // ARASAAC ID
  "dataUrl": "data:image/..." // Base64 image
}
```

## Migrations

When the schema needs to be changed:

```js
// db/schema.js
const DB_VERSION = 1;

function openDatabase() {
  return openDB("comunick", DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (oldVersion < 1) {
        db.createObjectStore("boards", { keyPath: "id" });
        db.createObjectStore("settings", { keyPath: "id" });
        db.createObjectStore("pictograms_cache", { keyPath: "imageId" });
      }
      // if (oldVersion < 2) { ... migrate to v2 }
    },
  });
}
```

## CRUD Operations (db/operations.js)

```js
// Boards
export async function getAllBoards()
export async function getBoard(id)
export async function saveBoard(board)
export async function deleteBoard(id)

// Settings
export async function getSettings()
export async function saveSettings(settings)

// Pictograms
export async function getCachedPictogram(imageId)
export async function cachePictogram(imageId, dataUrl)
export async function clearPictogramCache()

// Backup / Export (future)
export async function exportAllData()
export async function importAllData(data)
```
