import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import type { CapturedMessageType } from '../types/models';

export interface CapturedNotificationEvent {
  packageName: string;
  contactId: string;
  contactName: string;
  avatarUri?: string;
  type: CapturedMessageType;
  text?: string;
  reactionEmoji?: string;
  quotedSnippet?: string;
  thumbnailUri?: string;
  capturedAt: number;
}

interface NotificationCaptureNativeInterface {
  hasNotificationAccess(): Promise<boolean>;
  openNotificationAccessSettings(): void;
  setMonitoredPackages(packages: string[]): void;
  getMonitoredPackages(): Promise<string[]>;
}

const NativeModule = NativeModules.NotificationCaptureModule as NotificationCaptureNativeInterface | undefined;

function assertAndroid(): NotificationCaptureNativeInterface {
  if (Platform.OS !== 'android') {
    throw new Error('NotificationCaptureModule is only available on Android.');
  }
  if (!NativeModule) {
    throw new Error(
      'NotificationCaptureModule native module is not linked. Rebuild the Android app after adding the NotificationListenerService native module.'
    );
  }
  return NativeModule;
}

const emitter = Platform.OS === 'android' && NativeModule ? new NativeEventEmitter(NativeModules.NotificationCaptureModule) : null;

const CAPTURED_EVENT = 'RecDelNotificationCaptured';

/**
 * JS bridge to the native NotificationListenerService capture pipeline
 * (Section 4.2). Emits `RecDelNotificationCaptured` for every classified
 * notification from a monitored package while the listener is bound.
 */
export const NotificationCaptureModule = {
  hasNotificationAccess: () => assertAndroid().hasNotificationAccess(),
  openNotificationAccessSettings: () => assertAndroid().openNotificationAccessSettings(),
  setMonitoredPackages: (packages: string[]) => assertAndroid().setMonitoredPackages(packages),
  getMonitoredPackages: () => assertAndroid().getMonitoredPackages(),

  subscribe(listener: (event: CapturedNotificationEvent) => void) {
    if (!emitter) {
      return { remove: () => {} };
    }
    return emitter.addListener(CAPTURED_EVENT, listener);
  },
};
