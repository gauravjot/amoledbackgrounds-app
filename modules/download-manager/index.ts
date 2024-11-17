// Import the native module. On web, it will be resolved to DownloadManager.web.ts
// and on native platforms to DownloadManager.ts
import DownloadManagerModule from "./src/DownloadManagerModule";
import {ChangeEventPayload, DownloadManagerViewProps} from "./src/DownloadManager.types";

export const Module = DownloadManagerModule;

/**
 * Download a file from the given URL.
 */
export function downloadImage(url: string, filename: string, file_extension: string): number {
  return DownloadManagerModule.downloadImage(url, filename, file_extension);
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
 * Events
 */

export type DownloadCompleteType = {success: boolean; path: string};
export const DownloadCompleteEvent = "onDownloadComplete";

export type DownloadProgressType = {progress: number; filename: string; downloadId: number};
export const DownloadProgressEvent = "onDownloadProgress";

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
export {DownloadManagerViewProps, ChangeEventPayload};
