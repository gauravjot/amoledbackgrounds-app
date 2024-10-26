import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import { ImageViewProps } from './ImageView.types';

const NativeView: React.ComponentType<ImageViewProps> =
  requireNativeViewManager('ImageView');

export default function ImageView(props: ImageViewProps) {
  return <NativeView {...props} />;
}
