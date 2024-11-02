package com.nzran.wallpapermanager

import android.annotation.SuppressLint
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.content.Context
import android.app.WallpaperManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.ImageDecoder
import java.io.IOException
import android.provider.MediaStore
import android.net.Uri
import android.media.MediaScannerConnection
import android.util.Log
import androidx.core.os.bundleOf
import java.util.concurrent.Executors

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

    AsyncFunction("setWallpaper") { path: String ->
      Executors.newSingleThreadExecutor().execute{
        setWallpaper(context, path)
      }
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


  @SuppressLint("MissingPermission")
  private fun setWallpaper(context: Context, path: String) {
    // Set wallpaper
    val wallpaperManager = WallpaperManager.getInstance(context)

    val options: BitmapFactory.Options = BitmapFactory.Options()
    options.inPreferredConfig = Bitmap.Config.ARGB_8888

    MediaScannerConnection.scanFile(context, arrayOf(path), null
    ) { path, uri ->
      try {
        val source: ImageDecoder.Source = ImageDecoder.createSource(context.contentResolver, uri)
        val bitmap: Bitmap = ImageDecoder.decodeBitmap(source);
        wallpaperManager.setBitmap(bitmap)
        // send event to JavaScript
        this@WallpaperManagerModule.sendEvent(
          "onChange", bundleOf(
            "success" to true,
            "path" to path
          )
        )
      } catch (e: Exception) {
        Log.e("WallpaperManagerModule", "Attempted to set wallpaper: $path")
        e.printStackTrace()
        // send event to JavaScript
        this@WallpaperManagerModule.sendEvent(
          "onChange", bundleOf(
            "success" to false,
            "path" to path
          )
        )
      }
    }
  }
}
