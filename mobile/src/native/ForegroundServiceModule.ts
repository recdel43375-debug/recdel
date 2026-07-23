import { NativeModules, Platform } from 'react-native';

interface ForegroundServiceNativeInterface {
  start(): void;
  stop(): void;
  restart(): void;
  isRunning(): Promise<boolean>;
}

const NativeModule = NativeModules.ForegroundServiceModule as ForegroundServiceNativeInterface | undefined;

/** Controls the persistent "Status Saver / Watching for new Statuses" foreground service (Section 3.13). */
export const ForegroundServiceModule = {
  start: () => {
    if (Platform.OS === 'android') NativeModule?.start();
  },
  stop: () => {
    if (Platform.OS === 'android') NativeModule?.stop();
  },
  restart: () => {
    if (Platform.OS === 'android') NativeModule?.restart();
  },
  isRunning: () => (Platform.OS === 'android' && NativeModule ? NativeModule.isRunning() : Promise.resolve(false)),
};
