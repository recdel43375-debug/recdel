import { NativeModules, Platform } from 'react-native';
import type { InstalledApp } from '../types/models';

interface InstalledAppsNativeInterface {
  listInstalledApps(): Promise<InstalledApp[]>;
}

const NativeModule = NativeModules.InstalledAppsModule as InstalledAppsNativeInterface | undefined;

/** JS bridge to the PackageManager enumeration used by the Choose App grid (Section 3.5). */
export const InstalledAppsModule = {
  async listInstalledApps(): Promise<InstalledApp[]> {
    if (Platform.OS !== 'android' || !NativeModule) {
      return [];
    }
    return NativeModule.listInstalledApps();
  },
};
