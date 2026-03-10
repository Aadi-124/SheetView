import { openDB } from 'idb';

const DB_NAME = 'sheetview';
const STORE = 'files';

let dbPromise: ReturnType<typeof openDB> | null = null;
function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          const st = db.createObjectStore(STORE, { keyPath: 'id' });
          st.createIndex('pending', 'pending', { unique: false });
        }
      }
    });
  }
  return dbPromise;
}

export async function saveLocalFile(file: File) {
  const db = await getDB();
  const rec = {
    id: crypto.randomUUID(),
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    blob: file,
    createdAt: Date.now(),
    pending: true,
    serverId: null,
  };
  await db.put(STORE, rec);
  return rec;
}