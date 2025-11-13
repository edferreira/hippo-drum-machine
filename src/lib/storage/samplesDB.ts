// Simple IndexedDB wrapper for persisting uploaded sample instruments
// Store fields: id (auto), name, blob, volume, muted, createdAt

type SampleRecord = {
  id?: number;
  name: string;
  blob: Blob;
  volume: number;
  muted: boolean;
  createdAt: number;
};

const DB_NAME = "hippo-drum-machine";
const DB_VERSION = 1;
const STORE = "samples" as const;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
        store.createIndex("createdAt", "createdAt");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function addSample(rec: Omit<SampleRecord, "id" | "createdAt">): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.add({ ...rec, createdAt: Date.now() });
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
}

export async function listSamples(): Promise<Required<SampleRecord>[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as Required<SampleRecord>[]);
    req.onerror = () => reject(req.error);
  });
}

export async function updateSample(
  id: number,
  patch: Partial<Omit<SampleRecord, "id">>
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const current = getReq.result as SampleRecord | undefined;
      if (!current) {
        resolve();
        return;
      }
      const updated = { ...current, ...patch } as SampleRecord;
      const putReq = store.put(updated);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function deleteSample(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
