import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import { WallpaperManagerViewProps } from './WallpaperManager.types';

const NativeView: React.ComponentType<WallpaperManagerViewProps> =
  requireNativeViewManager('WallpaperManager');

export default function WallpaperManagerView(props: WallpaperManagerViewProps) {
  return <NativeView {...props} />;
}
