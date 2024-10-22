import {NativeModulesProxy, EventEmitter, Subscription} from "expo-modules-core";

// Import the native module. On web, it will be resolved to WallpaperManager.web.ts
// and on native platforms to WallpaperManager.ts
import WallpaperManagerModule from "./src/WallpaperManagerModule";
import WallpaperManagerView from "./src/WallpaperManagerView";
import {ChangeEventPayload, WallpaperManagerViewProps} from "./src/WallpaperManager.types";

export function setWallpaper(uri: string) {
  return WallpaperManagerModule.setWallpaper(uri);
}

const emitter = new EventEmitter(WallpaperManagerModule ?? NativeModulesProxy.WallpaperManager);

export function addChangeListener(listener: (event: ChangeEventPayload) => void): Subscription {
  return emitter.addListener<ChangeEventPayload>("onChange", listener);
}

export {WallpaperManagerView, WallpaperManagerViewProps, ChangeEventPayload};
