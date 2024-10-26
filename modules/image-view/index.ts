// Import the native module. On web, it will be resolved to ImageView.web.ts
// and on native platforms to ImageView.ts
import ImageViewModule from "./src/ImageViewModule";
import ImageView from "./src/ImageView";
import {ChangeEventPayload, ImageViewProps} from "./src/ImageView.types";

export {ImageView, ImageViewProps, ChangeEventPayload};
