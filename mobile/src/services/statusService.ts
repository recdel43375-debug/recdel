import { StatusReaderModule } from '../native/StatusReaderModule';
import { statusIndexStore } from '../store/statusIndexStore';
import type { StatusFileEntry, StatusMediaType } from '../types/models';

/**
 * Lists currently-live status files for a package (Section 4.1: SAF diff
 * against the persisted URI on every poll) and merges in the locally
 * persisted saved/checkmark state, which is re-verified against the index
 * rather than re-derived each launch.
 */
export async function loadLiveStatusFiles(packageName: string, mediaType: StatusMediaType): Promise<StatusFileEntry[]> {
  const nativeFiles = await StatusReaderModule.listStatusFiles(packageName);
  return nativeFiles
    .filter((f) => f.mediaType === mediaType)
    .map((f) => ({
      ...f,
      saved: statusIndexStore.isSaved(packageName, f.id),
      savedUri: statusIndexStore.getSavedUri(packageName, f.id),
    }));
}

/** Copies a live status file into Recovered Media and records it as saved. */
export async function saveStatusFile(packageName: string, entry: StatusFileEntry): Promise<StatusFileEntry> {
  const savedUri = await StatusReaderModule.saveStatusFile(entry.uri, entry.fileName, entry.mediaType);
  statusIndexStore.markSaved(packageName, entry.id, savedUri);
  return { ...entry, saved: true, savedUri };
}

/** Saved Status tab (Section 3.6.3): files already copied into RecDel's own storage. */
export function loadSavedStatusFiles(packageName: string, mediaType?: StatusMediaType): StatusFileEntry[] {
  return statusIndexStore.getAllSaved(packageName).map(({ fileId, savedUri, savedAt }) => ({
    id: fileId,
    uri: savedUri,
    fileName: fileId,
    mediaType: mediaType ?? inferMediaTypeFromUri(savedUri),
    mtime: savedAt,
    sizeBytes: 0,
    saved: true,
    savedUri,
  }));
}

function inferMediaTypeFromUri(uri: string): StatusMediaType {
  return /\.(mp4|mov|mkv|3gp)$/i.test(uri) ? 'video' : 'image';
}
