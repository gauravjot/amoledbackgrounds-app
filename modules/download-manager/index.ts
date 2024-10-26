import {NativeModulesProxy, EventEmitter, Subscription} from "expo-modules-core";

// Import the native module. On web, it will be resolved to DownloadManager.web.ts
// and on native platforms to DownloadManager.ts
import DownloadManagerModule from "./src/DownloadManagerModule";
import DownloadManagerView from "./src/DownloadManagerView";
import {ChangeEventPayload, DownloadManagerViewProps} from "./src/DownloadManager.types";

/**
 * Download a file from the given URL.
 */
export function downloadImage(url: string, filename: string, file_extension: string): boolean {
  return DownloadManagerModule.downloadImage(url, filename, file_extension);
}

const emitter = new EventEmitter(DownloadManagerModule ?? NativeModulesProxy.DownloadManager);
export type DownloadCompleteEvent = {success: boolean; path: string};
export function downloadCompleteListener(listener: (event: DownloadCompleteEvent) => void): Subscription {
  return emitter.addListener<DownloadCompleteEvent>("onDownloadComplete", listener);
}

export function getDownloadedFiles(): {name: string; path: string}[] {
  return DownloadManagerModule.getDownloadedFiles();
}

/*
 * Permissions for storage access on Android.
 */
export function hasPermissionForStorage(): boolean {
  return DownloadManagerModule.hasPermissionForStorage();
}

// Export types
export {DownloadManagerView, DownloadManagerViewProps, ChangeEventPayload};
