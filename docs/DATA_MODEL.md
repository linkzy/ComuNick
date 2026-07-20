# Data Model — IndexedDB

## Database

- **Name:** `comunick`
- **Version:** 2 (increment if schema migration is needed)
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
  "id": "board_principal",
  "name": "Comunicação Básica",
  "createdAt": 1712345678000,
  "updatedAt": 1712345678000,

  "rows": 2,
  "cols": 1,
  "cellsOrder": ["c1", "c2", "c3"],

  "cells": {
    "c1": {
      "id": "c1",
      "label": "Água",
      "speech": "Quero água",
      "imageId": "1234",
      "imageUrl": "data:image/png;base64,...",  // Base64 from ARASAAC
      "backgroundColor": "#3498db",
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
  "lang": "pt-BR",
  "currentBoardId": "board_principal",
  "ttsRate": 1.0,
  "ttsPitch": 1.0,
  "ttsProvider": "native",            // "native" | "narrator"
  "adminMode": false
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
  "imageId": "1234",
  "dataUrl": "data:image/png;base64,..."
}
```

### `audio_cache` (added in DB_VERSION 2)

Cache of generated TTS audio blobs from Narrator TTS API.

```js
{
  keyPath: "id",
  autoIncrement: false
}

// Document shape:
{
  "id": "audio:board_principal:c1",   // pattern: audio:{boardId}:{cellId}
  "audio": Blob,                       // MP3 audio blob
  "text": "Quero água",               // original speech text
  "createdAt": 1712345678000          // Date.now()
}
```

**Operations:**
```js
getAudioCache(cellKey)        // → { id, audio: Blob, text, createdAt } | undefined
saveAudioCache(cellKey, blob, text)
deleteAudioCache(cellKey)
clearAudioCache()              // clear entire audio_cache store
```

## Migrations

```js
// db/schema.js
const DB_VERSION = 2;

function openDatabase() {
  return openDB("comunick", DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (oldVersion < 1) {
        db.createObjectStore("boards", { keyPath: "id" });
        db.createObjectStore("settings", { keyPath: "id" });
        db.createObjectStore("pictograms_cache", { keyPath: "imageId" });
      }
      if (oldVersion < 2) {
        db.createObjectStore("audio_cache", { keyPath: "id" });
      }
    },
  });
}
```

## CRUD Operations (db/operations.js)

```js
// Boards
getAllBoards(), getBoard(id), saveBoard(board), deleteBoard(id)

// Settings
getSettings(), saveSettings(settings)

// Pictograms
getCachedPictogram(imageId), cachePictogram(imageId, dataUrl), clearPictogramCache()

// Audio Cache (v2)
getAudioCache(cellKey), saveAudioCache(cellKey, blob, text), deleteAudioCache(cellKey), clearAudioCache()
```
