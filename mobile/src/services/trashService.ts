import { appsStore } from '../store/appsStore';
import { statusIndexStore } from '../store/statusIndexStore';
import type { TrashEntry } from '../types/models';

/**
 * Aggregated cross-app recovered-media view (Section 4.3): every status
 * image/video RecDel has already saved, across all monitored apps. Kept
 * distinct from the text/reaction feed under the Notification tab.
 */
export function loadTrashEntries(): TrashEntry[] {
  const apps = appsStore.getMonitoredApps();
  const entries: TrashEntry[] = [];

  for (const app of apps) {
    const saved = statusIndexStore.getAllSaved(app.packageName);
    for (const item of saved) {
      entries.push({
        id: `${app.packageName}:${item.fileId}`,
        packageName: app.packageName,
        sourceName: app.displayName,
        mediaType: /\.(mp4|mov|mkv|3gp)$/i.test(item.savedUri) ? 'video' : 'image',
        uri: item.savedUri,
        capturedAt: item.savedAt,
      });
    }
  }

  return entries.sort((a, b) => b.capturedAt - a.capturedAt);
}

/** Local-only delete: removes the entry from the saved index (Section 4.3: "no backend call"). */
export function deleteTrashEntry(entry: TrashEntry) {
  const fileId = entry.id.slice(entry.packageName.length + 1);
  statusIndexStore.removeSaved(entry.packageName, fileId);
}
