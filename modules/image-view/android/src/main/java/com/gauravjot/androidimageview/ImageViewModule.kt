package com.gauravjot.androidimageview

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.content.Context
import android.provider.MediaStore
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.media.MediaScannerConnection
import android.net.Uri;
import android.util.Log
import com.squareup.picasso.Picasso;

class ImageViewModule : Module() {
  private val context
  get() = requireNotNull(appContext.reactContext)

  override fun definition() = ModuleDefinition {
    Name("ImageView")
    // Enables the module to be used as a native view. Definition components that are accepted as part of
    // the view definition: Prop, Events.
    View(NativeImageView::class) {
      // Defines a setter for the `path` prop.
      Prop("path") { view: NativeImageView, path: String ->
        Picasso.get().load(Uri.parse(path)).resize(480, 0).into(view.imageView)
      }
    }
  }
}
