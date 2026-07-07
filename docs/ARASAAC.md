# ARASAAC Integration

## About

ARASAAC (Aragonese Portal of Augmentative and Alternative Communication) is a free library of AAC pictograms. Maintained by the Government of Aragon, it contains over 10,000 standardized symbols.

**License:** Creative Commons BY-NC-SA 4.0

**Website:** https://arasaac.org

## License Obligations

- **BY:** Attribution — display "Pictograms: ARASAAC (https://arasaac.org)" in the app footer
- **NC:** Non-commercial use — the app must be free
- **SA:** ShareAlike — the app must use the CC BY-NC-SA license

## API Usage

### Pictogram Search

```
GET https://api.arasaac.org/v1/pictograms/{lang}/search/{query}
```

**Parameters:**
- `lang`: ISO language code (e.g.: `pt`, `en`, `es`)
- `query`: search term

**Example:**
```
GET https://api.arasaac.org/v1/pictograms/pt/search/agua
```

**Response:**
```json
[
  {
    "_id": "1234",
    "id": "1234",
    "keywords": {"pt": ["água", "beber"], "en": ["water", "drink"]},
    "categories": ["alimentacao"],
    "type": "pictogram",
    "created": "2020-01-01"
  }
]
```

### Image Download

```
GET https://static.arasaac.org/pictograms/{id}/{id}_300.png
```

**Available sizes:**
- `{id}_300.png` — 300px (recommended for mobile)
- `{id}_500.png` — 500px
- `{id}_2500.png` — 2500px

Use `_300.png` for performance. If the grid is very large (many cells), consider `_100` in the future.

## Local Cache

For offline use, downloaded pictograms must be cached.

### Cache Strategy

1. Admin searches → selects pictogram
2. Download image via fetch → convert to data URL (base64)
3. Save to IndexedDB store `pictograms_cache`
4. On render, use `imageUrl` or `imageLocalPath` to display
5. If offline: retrieve from IndexedDB cache

```js
// db/operations.js
export async function downloadAndCachePictogram(imageId, size = 300) {
  // Check if already cached
  const cached = await getCachedPictogram(imageId);
  if (cached) return cached.dataUrl;

  // Download
  const url = `https://static.arasaac.org/pictograms/${imageId}/${imageId}_${size}.png`;
  const response = await fetch(url);
  const blob = await response.blob();

  // Convert to data URL
  const dataUrl = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });

  // Cache
  await cachePictogram(imageId, dataUrl);
  return dataUrl;
}
```

### Cache Cleanup

- Offer a "Clear cache" option in admin mode
- Suggested max cache: 500 pictograms (~50MB)
- LRU (Least Recently Used) to remove unused pictograms (future)

## Best Practices

1. **Batch search** — if admin adds multiple cells, search one at a time to avoid rate limiting
2. **Error 429 handling** — ARASAAC has rate limits. If 429 is received, wait 1s and retry with exponential backoff
3. **Visual fallback** — if download fails, display a solid color placeholder with initials
4. **Search language** — use i18next language to search with keywords in the correct language
5. **SVG vs PNG** — SVG is better quality, but PNG 300px loads faster on low-end devices
6. **Visible attribution** — "Pictograms: ARASAAC (https://arasaac.org)" in footer or splash screen
