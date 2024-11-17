// Import the native module. On web, it will be resolved to DailyWallpaper.web.ts
// and on native platforms to DailyWallpaper.ts
import DailyWallpaperModule from "./src/DailyWallpaperModule";

export const Module = DailyWallpaperModule;

//
export async function registerDailyWallpaperService(
  type: "online" | "downloaded",
  sort: String | null,
): Promise<string> {
  return await DailyWallpaperModule.registerService(type, sort);
}

export async function unregisterDailyWallpaperService(): Promise<boolean> {
  return await DailyWallpaperModule.unregisterService();
}

export function isDailyWallpaperServiceEnabled() {
  return DailyWallpaperModule.isServiceEnabled();
}

export function changeDailyWallpaperType(type: "online" | "downloaded") {
  return DailyWallpaperModule.changeType(type);
}

export function changeDailyWallpaperSort(sort: String) {
  return DailyWallpaperModule.changeSort(sort);
}
