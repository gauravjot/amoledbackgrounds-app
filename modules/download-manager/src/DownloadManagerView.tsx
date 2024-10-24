import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import { DownloadManagerViewProps } from './DownloadManager.types';

const NativeView: React.ComponentType<DownloadManagerViewProps> =
  requireNativeViewManager('DownloadManager');

export default function DownloadManagerView(props: DownloadManagerViewProps) {
  return <NativeView {...props} />;
}
