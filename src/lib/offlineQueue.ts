import { db, doc, setDoc, serverTimestamp } from './firebase';

export interface OfflineQueueItem {
  id: string;
  userId: string;
  entryId: string;
  payload: any;
  timestamp: number;
  attempts: number;
}

const QUEUE_KEY = 'gemini_reflection_offline_write_queue_v1';
const ENCRYPTION_PASSPHRASE_KEY = 'gemini_reflection_session_passphrase_v1';
const RECOVERY_PHRASE_KEY = 'gemini_reflection_recovery_phrase_v1';

export function saveOfflineQueue(queue: OfflineQueueItem[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Failed to save offline queue:', e);
  }
}

export function getOfflineQueue(): OfflineQueueItem[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function enqueueOfflineWrite(userId: string, entryId: string, payload: any): void {
  const queue = getOfflineQueue();
  const existingIdx = queue.findIndex(item => item.entryId === entryId);
  const newItem: OfflineQueueItem = {
    id: `${entryId}_${Date.now()}`,
    userId,
    entryId,
    payload,
    timestamp: Date.now(),
    attempts: 0
  };

  if (existingIdx >= 0) {
    queue[existingIdx] = newItem;
  } else {
    queue.push(newItem);
  }
  saveOfflineQueue(queue);
}

export function queueOfflineEntry(entry: any): void {
  enqueueOfflineWrite(entry.userId, entry.id, entry);
}

export function removeOfflineQueueItem(id: string): void {
  const queue = getOfflineQueue().filter(i => i.id !== id);
  saveOfflineQueue(queue);
}

export async function flushOfflineQueue(currentUserId: string): Promise<number> {
  const queue = getOfflineQueue().filter(i => i.userId === currentUserId);
  if (queue.length === 0) return 0;

  let successCount = 0;
  for (const item of queue) {
    try {
      const entryRef = doc(db, 'users', item.userId, 'entries', item.entryId);
      await setDoc(entryRef, {
        ...item.payload,
        updatedAt: serverTimestamp()
      }, { merge: true });
      removeOfflineQueueItem(item.id);
      successCount++;
    } catch (e) {
      console.warn(`Retry failed for queued entry ${item.entryId}:`, e);
    }
  }
  return successCount;
}

export function getSessionPassphrase(): string | null {
  return sessionStorage.getItem(ENCRYPTION_PASSPHRASE_KEY) || localStorage.getItem(ENCRYPTION_PASSPHRASE_KEY);
}

export function setSessionPassphrase(passphrase: string, persistToLocal = false): void {
  sessionStorage.setItem(ENCRYPTION_PASSPHRASE_KEY, passphrase);
  if (persistToLocal) {
    localStorage.setItem(ENCRYPTION_PASSPHRASE_KEY, passphrase);
  }
}

export function clearSessionPassphrase(): void {
  sessionStorage.removeItem(ENCRYPTION_PASSPHRASE_KEY);
  localStorage.removeItem(ENCRYPTION_PASSPHRASE_KEY);
}

export function getStoredRecoveryPhrase(): string | null {
  return localStorage.getItem(RECOVERY_PHRASE_KEY);
}

export function setStoredRecoveryPhrase(phrase: string): void {
  localStorage.setItem(RECOVERY_PHRASE_KEY, phrase);
}
