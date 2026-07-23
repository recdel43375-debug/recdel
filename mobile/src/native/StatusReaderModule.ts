import { NativeModules, Platform } from 'react-native';
import type { StatusMediaType } from '../types/models';

interface NativeStatusFile {
  id: string;
  uri: string;
  fileName: string;
  mediaType: StatusMediaType;
  mtime: number;
  sizeBytes: number;
}

interface StatusReaderNativeInterface {
  requestFolderAccess(): Promise<boolean>;
  hasFolderAccess(): Promise<boolean>;
  listStatusFiles(packageName: string): Promise<NativeStatusFile[]>;
  saveStatusFile(sourceUri: string, fileName: string, mediaType: StatusMediaType): Promise<string>;
}

const NativeModule = NativeModules.StatusReaderModule as StatusReaderNativeInterface | undefined;

function assertAndroid(): StatusReaderNativeInterface {
  if (Platform.OS !== 'android') {
    throw new Error('StatusReaderModule is only available on Android (Section 8: Android-only for v1).');
  }
  if (!NativeModule) {
    throw new Error(
      'StatusReaderModule native module is not linked. Rebuild the Android app after adding android/app/src/main/java/com/recdel/statusreader/*.'
    );
  }
  return NativeModule;
}

/**
 * JS bridge to the native SAF-based WhatsApp Status folder reader
 * (Section 4.1). Requires the Android 11+ ACTION_OPEN_DOCUMENT_TREE grant
 * to be persisted before listStatusFiles/saveStatusFile will return data.
 */
export const StatusReaderModule = {
  requestFolderAccess: () => assertAndroid().requestFolderAccess(),
  hasFolderAccess: () => assertAndroid().hasFolderAccess(),
  listStatusFiles: (packageName: string) => assertAndroid().listStatusFiles(packageName),
  saveStatusFile: (sourceUri: string, fileName: string, mediaType: StatusMediaType) =>
    assertAndroid().saveStatusFile(sourceUri, fileName, mediaType),
};
