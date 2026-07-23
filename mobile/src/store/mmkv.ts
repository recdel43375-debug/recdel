import { MMKV } from 'react-native-mmkv';

// Small pieces of settings/metadata only — captured message logs live as
// append-only JSON-lines files on the filesystem (see notificationCaptureStore.ts),
// per the "no SQLite/Realm required" architecture decision in the spec.
export const settingsStorage = new MMKV({ id: 'recdel-settings' });
export const appsStorage = new MMKV({ id: 'recdel-monitored-apps' });
export const statusIndexStorage = new MMKV({ id: 'recdel-status-index' });
