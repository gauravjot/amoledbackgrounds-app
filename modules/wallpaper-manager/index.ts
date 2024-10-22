import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to WallpaperManager.web.ts
// and on native platforms to WallpaperManager.ts
import WallpaperManagerModule from './src/WallpaperManagerModule';
import WallpaperManagerView from './src/WallpaperManagerView';
import { ChangeEventPayload, WallpaperManagerViewProps } from './src/WallpaperManager.types';

// Get the native constant value.
export const PI = WallpaperManagerModule.PI;

export function hello(): string {
  return WallpaperManagerModule.hello();
}

export async function setValueAsync(value: string) {
  return await WallpaperManagerModule.setValueAsync(value);
}

const emitter = new EventEmitter(WallpaperManagerModule ?? NativeModulesProxy.WallpaperManager);

export function addChangeListener(listener: (event: ChangeEventPayload) => void): Subscription {
  return emitter.addListener<ChangeEventPayload>('onChange', listener);
}

export { WallpaperManagerView, WallpaperManagerViewProps, ChangeEventPayload };
