import {NativeModulesProxy, EventEmitter, Subscription} from "expo-modules-core";

// Import the native module. On web, it will be resolved to DownloadManager.web.ts
// and on native platforms to DownloadManager.ts
import DownloadManagerModule from "./src/DownloadManagerModule";
import DownloadManagerView from "./src/DownloadManagerView";
import {ChangeEventPayload, DownloadManagerViewProps} from "./src/DownloadManager.types";

/**
 * Download a file from the given URL.
 */
export function downloadImage(url: string, filename: string, file_extension: string): number {
  return DownloadManagerModule.downloadImage(url, filename, file_extension);
}

const emitter = new EventEmitter(DownloadManagerModule ?? NativeModulesProxy.DownloadManager);

export type DownloadCompleteEvent = {success: boolean; path: string};
export function downloadCompleteListener(listener: (event: DownloadCompleteEvent) => void): Subscription {
  return emitter.addListener<DownloadCompleteEvent>("onDownloadComplete", listener);
}
export type DownloadProgressEvent = {progress: number; filename: string; downloadId: number};
export function downloadProgressListener(listener: (event: DownloadProgressEvent) => void): Subscription {
  return emitter.addListener<DownloadProgressEvent>("onDownloadProgress", listener);
}

export function getDownloadedFiles(
  matchNameStr: string,
): {name: string; path: string; width: string; height: string}[] {
  return DownloadManagerModule.getDownloadedFiles(matchNameStr);
}

export async function checkFileExists(path: string): Promise<boolean> {
  return DownloadManagerModule.checkFileExists(path);
}

/*
 * Permissions for storage access on Android.
 */
export function hasPermissionForStorage(): boolean {
  return DownloadManagerModule.hasPermissionForStorage();
}
export async function requestStoragePermissionsAsync(): Promise<void> {
  return DownloadManagerModule.requestStoragePermissionsAsync();
}
export function openAppInDeviceSettings(): void {
  return DownloadManagerModule.openAppInDeviceSettings();
}

// Export types
export {DownloadManagerView, DownloadManagerViewProps, ChangeEventPayload};
