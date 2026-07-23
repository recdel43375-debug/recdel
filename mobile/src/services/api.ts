// Base URL for the stateless RecDel config/legal/telemetry API (backend/ in
// this repo). TODO: replace with the real deployed URL once backend/ is
// hosted (e.g. Render — see render.yaml at the repo root), for example
// "https://recdel-backend.onrender.com". Override at build time via
// react-native-config if per-flavor endpoints are ever needed; a single
// constant is sufficient for MVP.
const API_BASE_URL = 'https://api.recdel.app';

export interface AppVersionInfo {
  platform: string;
  latestVersion: string;
  latestVersionCode: number;
  minSupportedVersionCode: number;
  forceUpdate: boolean;
  updateUrl: string;
  releaseNotes: string;
}

export interface RemoteFlags {
  autoSaveDefaultEnabled: boolean;
  notificationDefaultEnabled: boolean;
  premium: { enabled: boolean; priceUsd: number; trialDays: number };
  notificationEventTypesEnabled: Record<string, boolean>;
  statusPollIntervalMinutes: number;
  maxMonitoredApps: number;
  adsEnabled: boolean;
}

export interface SupportedAppMeta {
  packageName: string;
  displayName: string;
  iconRef: string;
  capabilities: string[];
  statusFolderPaths: string[];
}

export type TelemetryEvent =
  | 'app_opened'
  | 'onboarding_completed'
  | 'disclaimer_accepted'
  | 'app_added_to_monitor'
  | 'status_saved_count'
  | 'notification_access_granted'
  | 'saf_permission_granted';

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`RecDel API ${path} failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  getAppVersion: () => getJson<AppVersionInfo>('/config/app-version'),
  getRemoteFlags: () => getJson<RemoteFlags>('/config/remote-flags'),
  getSupportedApps: () => getJson<{ apps: SupportedAppMeta[] }>('/config/supported-apps'),
  getPrivacyPolicy: () => getJson<{ format: string; updatedAt: string; content: string }>('/legal/privacy-policy'),
  getTerms: () => getJson<{ format: string; updatedAt: string; content: string }>('/legal/terms'),

  async sendTelemetryEvent(event: TelemetryEvent, value?: number): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/telemetry/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, value }),
      });
    } catch {
      // Telemetry is best-effort and opt-out-able; never surface failures to the user.
    }
  },
};
