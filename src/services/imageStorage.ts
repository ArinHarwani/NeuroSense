const DB_NAME = 'NarcoSense_DB';
const DB_VERSION = 1;
const STORE_NAME = 'sample_images';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not available'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'sessionId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface StoredImageData {
  sessionId: string;
  blobUrl: string;
  dataUrl: string;
  capturedAt: number;
}

export async function storeSessionImage(
  sessionId: string,
  dataUrl: string
): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const record: StoredImageData = {
      sessionId,
      blobUrl: '',
      dataUrl,
      capturedAt: Date.now(),
    };

    const request = store.put(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getSessionImage(sessionId: string): Promise<string | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(sessionId);

      request.onsuccess = () => {
        const result = request.result as StoredImageData | undefined;
        resolve(result?.dataUrl || null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to read session image from IndexedDB:', err);
    return null;
  }
}

export async function clearSessionImage(sessionId: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(sessionId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to clear session image:', err);
  }
}
