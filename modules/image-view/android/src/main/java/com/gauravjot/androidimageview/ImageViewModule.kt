package com.gauravjot.androidimageview

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.graphics.BitmapFactory
import java.io.File

class ImageViewModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ImageView")
    // Enables the module to be used as a native view. Definition components that are accepted as part of
    // the view definition: Prop, Events.
    View(ImageView::class) {
      // Defines a setter for the `path` prop.
      Prop("path") { view: ImageView, path: String ->
        view.imageView.setImageBitmap(BitmapFactory.decodeFile(File(path).absolutePath))
      }
    }
  }
}
