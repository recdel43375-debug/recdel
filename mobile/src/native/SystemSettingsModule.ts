import { NativeModules, Platform } from 'react-native';

interface SystemSettingsNativeInterface {
  hasExactAlarmPermission(): Promise<boolean>;
  openExactAlarmSettings(): void;
  openAppSettings(): void;
}

const NativeModule = NativeModules.SystemSettingsModule as SystemSettingsNativeInterface | undefined;

function assertAndroid(): SystemSettingsNativeInterface {
  if (Platform.OS !== 'android' || !NativeModule) {
    throw new Error('SystemSettingsModule is only available on Android and requires a native rebuild.');
  }
  return NativeModule;
}

/** Deep-links into native OS settings screens (Sections 3.4, 3.10, 3.12). */
export const SystemSettingsModule = {
  hasExactAlarmPermission: () => (Platform.OS === 'android' && NativeModule ? NativeModule.hasExactAlarmPermission() : Promise.resolve(true)),
  openExactAlarmSettings: () => assertAndroid().openExactAlarmSettings(),
  openAppSettings: () => assertAndroid().openAppSettings(),
};
