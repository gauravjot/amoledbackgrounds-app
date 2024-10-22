import * as React from 'react';

import { WallpaperManagerViewProps } from './WallpaperManager.types';

export default function WallpaperManagerView(props: WallpaperManagerViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
