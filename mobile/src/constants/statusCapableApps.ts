// Packages RecDel knows how to read a Status media folder for (Section 4.1).
// Mirrors backend/src/data/supported-apps.json `capabilities: ["statusFolder"]`
// entries; kept local too since the Choose App grid enumerates installed
// packages purely from the device's own PackageManager, without a network
// round-trip.
export const STATUS_CAPABLE_PACKAGES = new Set(['com.whatsapp', 'com.whatsapp.w4b']);

export function hasStatusFolderCapability(packageName: string): boolean {
  return STATUS_CAPABLE_PACKAGES.has(packageName);
}
