import { settingsStorage } from './mmkv';

const KEYS = {
  hasAcceptedDisclaimer: 'hasAcceptedDisclaimer',
  hasSeenOnboarding: 'hasSeenOnboarding',
  notificationToggle: 'settings.notificationToggle',
  autoSaveToggle: 'settings.autoSaveToggle',
  language: 'settings.language',
  downloadPath: 'settings.downloadPath',
  safFolderGranted: 'permissions.safFolderGranted',
  notificationAccessGranted: 'permissions.notificationAccessGranted',
  exactAlarmGranted: 'permissions.exactAlarmGranted',
  isPremium: 'premium.isPremium',
} as const;

export const DEFAULT_DOWNLOAD_PATH = 'storage/emulated/0/Download/Recovered Media';

export const settingsStore = {
  getHasAcceptedDisclaimer(): boolean {
    return settingsStorage.getBoolean(KEYS.hasAcceptedDisclaimer) ?? false;
  },
  setHasAcceptedDisclaimer(value: boolean) {
    settingsStorage.set(KEYS.hasAcceptedDisclaimer, value);
  },

  getHasSeenOnboarding(): boolean {
    return settingsStorage.getBoolean(KEYS.hasSeenOnboarding) ?? false;
  },
  setHasSeenOnboarding(value: boolean) {
    settingsStorage.set(KEYS.hasSeenOnboarding, value);
  },

  getNotificationToggle(): boolean {
    return settingsStorage.getBoolean(KEYS.notificationToggle) ?? true;
  },
  setNotificationToggle(value: boolean) {
    settingsStorage.set(KEYS.notificationToggle, value);
  },

  getAutoSaveToggle(): boolean {
    return settingsStorage.getBoolean(KEYS.autoSaveToggle) ?? false;
  },
  setAutoSaveToggle(value: boolean) {
    settingsStorage.set(KEYS.autoSaveToggle, value);
  },

  getLanguage(): string {
    return settingsStorage.getString(KEYS.language) ?? 'en';
  },
  setLanguage(value: string) {
    settingsStorage.set(KEYS.language, value);
  },

  getDownloadPath(): string {
    return settingsStorage.getString(KEYS.downloadPath) ?? DEFAULT_DOWNLOAD_PATH;
  },

  getSafFolderGranted(): boolean {
    return settingsStorage.getBoolean(KEYS.safFolderGranted) ?? false;
  },
  setSafFolderGranted(value: boolean) {
    settingsStorage.set(KEYS.safFolderGranted, value);
  },

  getNotificationAccessGranted(): boolean {
    return settingsStorage.getBoolean(KEYS.notificationAccessGranted) ?? false;
  },
  setNotificationAccessGranted(value: boolean) {
    settingsStorage.set(KEYS.notificationAccessGranted, value);
  },

  getExactAlarmGranted(): boolean {
    return settingsStorage.getBoolean(KEYS.exactAlarmGranted) ?? false;
  },
  setExactAlarmGranted(value: boolean) {
    settingsStorage.set(KEYS.exactAlarmGranted, value);
  },

  getIsPremium(): boolean {
    return settingsStorage.getBoolean(KEYS.isPremium) ?? false;
  },
};
