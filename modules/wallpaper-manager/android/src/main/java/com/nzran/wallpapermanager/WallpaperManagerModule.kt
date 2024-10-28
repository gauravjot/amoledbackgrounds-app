package com.nzran.wallpapermanager

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.content.Context
import android.app.WallpaperManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import java.io.IOException
import android.provider.MediaStore
import android.net.Uri
import android.media.MediaScannerConnection
import androidx.core.os.bundleOf

class WallpaperManagerModule : Module() {

  private val context
  get() = requireNotNull(appContext.reactContext)

  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('WallpaperManager')` in JavaScript.
    Name("WallpaperManager")

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    Function("setWallpaper") { path: String ->
      setWallpaper(context, path)
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of
    // the view definition: Prop, Events.
    View(WallpaperManagerView::class) {
      // Defines a setter for the `name` prop.
      Prop("name") { view: WallpaperManagerView, prop: String ->
        println(prop)
      }
    }
  }


  fun setWallpaper(context: Context, path: String) {
    // Set wallpaper
    val wallpaperManager = WallpaperManager.getInstance(context)

    val options: BitmapFactory.Options = BitmapFactory.Options()
    options.inPreferredConfig = Bitmap.Config.ARGB_8888

    MediaScannerConnection.scanFile(context, arrayOf(path), null,
      object : MediaScannerConnection.OnScanCompletedListener {
        override fun onScanCompleted(path: String, uri: Uri) {
          val bitmap: Bitmap = MediaStore.Images.Media.getBitmap(context.getContentResolver(), uri);
          if (bitmap != null) {
            try {
              wallpaperManager.setBitmap(bitmap)
              // send event to JavaScript
              this@WallpaperManagerModule.sendEvent("onChange", bundleOf(
                "success" to true
              ))
            } catch (e: IOException) {
              e.printStackTrace()
              // send event to JavaScript
              this@WallpaperManagerModule.sendEvent("onChange", bundleOf(
                "success" to false
              ))
            }
          }
        }
      }
    )
  }
}