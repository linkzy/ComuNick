import { openDatabase } from "./schema";

let dbPromise = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDatabase();
  }
  return dbPromise;
}

export async function getAllBoards() {
  const db = await getDb();
  return db.getAll("boards");
}

export async function getBoard(id) {
  const db = await getDb();
  return db.get("boards", id);
}

export async function saveBoard(board) {
  const db = await getDb();
  const data = { ...board, updatedAt: Date.now() };
  return db.put("boards", data);
}

export async function deleteBoard(id) {
  const db = await getDb();
  return db.delete("boards", id);
}

export async function getSettings() {
  const db = await getDb();
  return db.get("settings", "global");
}

export async function saveSettings(settings) {
  const db = await getDb();
  return db.put("settings", { id: "global", ...settings });
}

export async function getCachedPictogram(imageId) {
  const db = await getDb();
  return db.get("pictograms_cache", String(imageId));
}

export async function cachePictogram(imageId, dataUrl) {
  const db = await getDb();
  return db.put("pictograms_cache", {
    imageId: String(imageId),
    dataUrl,
  });
}

export async function clearPictogramCache() {
  const db = await getDb();
  return db.clear("pictograms_cache");
}

export async function exportAllData() {
  const db = await getDb();
  const boards = await db.getAll("boards");
  const settings = await db.get("settings", "global");
  return { boards, settings };
}

export async function importAllData(data) {
  const db = await getDb();
  const tx = db.transaction(["boards", "settings"], "readwrite");
  if (data.boards) {
    for (const board of data.boards) {
      await tx.objectStore("boards").put(board);
    }
  }
  if (data.settings) {
    await tx.objectStore("settings").put(data.settings);
  }
  await tx.done;
}
