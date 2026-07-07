import { getCachedPictogram, cachePictogram } from "../db/operations";

const ARASAAC_API = "https://api.arasaac.org/v1/pictograms";
const ARASAAC_STATIC = "https://static.arasaac.org/pictograms";

export async function searchPictograms(query, lang = "pt") {
  if (!query || query.trim().length < 2) return [];

  const url = `${ARASAAC_API}/${lang}/search/${encodeURIComponent(query.trim())}`;

  try {
    const res = await fetch(url);
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 1000));
      return searchPictograms(query, lang);
    }
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item) => ({
      id: String(item._id || item.id),
      keywords: item.keywords,
    }));
  } catch (e) {
    console.warn("ARASAAC search failed:", e);
    return [];
  }
}

export function getPictogramUrl(imageId, size = 300) {
  return `${ARASAAC_STATIC}/${imageId}/${imageId}_${size}.png`;
}

export async function downloadAndCachePictogram(imageId, size = 300) {
  const cached = await getCachedPictogram(imageId);
  if (cached) return cached.dataUrl;

  const url = getPictogramUrl(imageId, size);
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
    await cachePictogram(imageId, dataUrl);
    return dataUrl;
  } catch (e) {
    console.warn("Failed to download pictogram:", e);
    return null;
  }
}
