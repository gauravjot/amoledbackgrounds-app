// Import the native module. On web, it will be resolved to DailyWallpaper.web.ts
// and on native platforms to DailyWallpaper.ts
import DailyWallpaperModule from "./src/DailyWallpaperModule";

//
export function registerDailyWallpaperService(type: "online" | "downloaded", sort: String | null) {
  return DailyWallpaperModule.registerDailyWallpaperService(type, sort);
}
