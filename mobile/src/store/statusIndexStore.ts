import { statusIndexStorage } from './mmkv';

interface SavedIndexEntry {
  savedUri: string;
  savedAt: number;
}

function keyFor(packageName: string) {
  return `savedIndex.${packageName}`;
}

function readIndex(packageName: string): Record<string, SavedIndexEntry> {
  const raw = statusIndexStorage.getString(keyFor(packageName));
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, SavedIndexEntry>;
  } catch {
    return {};
  }
}

function writeIndex(packageName: string, index: Record<string, SavedIndexEntry>) {
  statusIndexStorage.set(keyFor(packageName), JSON.stringify(index));
}

// Persisted "which status files has the user already saved" index, keyed by
// a stable file id (content hash or filename+size). This is intentionally
// separate from the live SAF folder listing, which is re-read on every poll —
// the spec requires saved-state to be re-verified against this index rather
// than re-derived from scratch each launch.
export const statusIndexStore = {
  isSaved(packageName: string, fileId: string): boolean {
    return Boolean(readIndex(packageName)[fileId]);
  },

  getSavedUri(packageName: string, fileId: string): string | undefined {
    return readIndex(packageName)[fileId]?.savedUri;
  },

  markSaved(packageName: string, fileId: string, savedUri: string) {
    const index = readIndex(packageName);
    index[fileId] = { savedUri, savedAt: Date.now() };
    writeIndex(packageName, index);
  },

  getAllSaved(packageName: string): Array<{ fileId: string; savedUri: string; savedAt: number }> {
    const index = readIndex(packageName);
    return Object.entries(index).map(([fileId, entry]) => ({ fileId, ...entry }));
  },

  removeSaved(packageName: string, fileId: string) {
    const index = readIndex(packageName);
    delete index[fileId];
    writeIndex(packageName, index);
  },
};
