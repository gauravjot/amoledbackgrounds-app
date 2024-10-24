import * as React from 'react';

import { DownloadManagerViewProps } from './DownloadManager.types';

export default function DownloadManagerView(props: DownloadManagerViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
