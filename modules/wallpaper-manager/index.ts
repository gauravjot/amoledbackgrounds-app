// Import the native module. On web, it will be resolved to WallpaperManager.web.ts
// and on native platforms to WallpaperManager.ts
import WallpaperManagerModule from "./src/WallpaperManagerModule";
import {ChangeEventPayload} from "./src/WallpaperManager.types";

export const Module = WallpaperManagerModule;

export async function setWallpaper(path: string): Promise<boolean> {
  return WallpaperManagerModule.setWallpaper(path);
}

export async function deleteWallpaper(path: string): Promise<boolean> {
  return WallpaperManagerModule.deleteWallpaper(path);
}

/*
 * Events
 */

export type ChangeEventType = ChangeEventPayload;
export const ChangeEvent = "onChange";
