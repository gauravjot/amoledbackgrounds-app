import {NativeModulesProxy, EventEmitter, Subscription} from "expo-modules-core";

// Import the native module. On web, it will be resolved to WallpaperManager.web.ts
// and on native platforms to WallpaperManager.ts
import WallpaperManagerModule from "./src/WallpaperManagerModule";
import WallpaperManagerView from "./src/WallpaperManagerView";
import {ChangeEventPayload, WallpaperManagerViewProps} from "./src/WallpaperManager.types";

export async function setWallpaper(path: string): Promise<boolean> {
  return WallpaperManagerModule.setWallpaper(path);
}

const emitter = new EventEmitter(WallpaperManagerModule ?? NativeModulesProxy.WallpaperManager);

export function onChangeListener(listener: (event: ChangeEventPayload) => void): Subscription {
  return emitter.addListener<ChangeEventPayload>("onChange", listener);
}

export {WallpaperManagerView, WallpaperManagerViewProps, ChangeEventPayload};
