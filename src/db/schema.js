import { openDB } from "idb";

const DB_NAME = "comunick";
const DB_VERSION = 2;

export async function openDatabase() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
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
