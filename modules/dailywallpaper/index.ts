// Import the native module. On web, it will be resolved to DailyWallpaper.web.ts
// and on native platforms to DailyWallpaper.ts
import DailyWallpaperModule from "./src/DailyWallpaperModule";

//
export async function registerDailyWallpaperService(
  type: "online" | "downloaded",
  sort: String | null,
  iconUri: String,
) {
  return await DailyWallpaperModule.registerService(type, sort, iconUri);
}

export async function unregisterDailyWallpaperService() {
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
