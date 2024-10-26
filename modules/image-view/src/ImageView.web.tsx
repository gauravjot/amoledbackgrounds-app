import * as React from 'react';

import { ImageViewProps } from './ImageView.types';

export default function ImageView(props: ImageViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
