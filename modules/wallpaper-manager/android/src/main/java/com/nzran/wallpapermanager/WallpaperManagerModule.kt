package com.nzran.wallpapermanager

import android.annotation.SuppressLint
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.content.Context
import android.app.WallpaperManager
import android.content.ContentUris
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.ImageDecoder
import java.io.IOException
import android.provider.MediaStore
import android.net.Uri
import android.media.MediaScannerConnection
import android.os.Binder
import android.util.Log
import androidx.core.app.ActivityCompat.startIntentSenderForResult
import androidx.core.os.bundleOf

class WallpaperManagerModule : Module() {

  private val context
  get() = requireNotNull(appContext.reactContext)

  override fun definition() = ModuleDefinition {
    Name("WallpaperManager")

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    AsyncFunction("setWallpaper") { path: String ->
      setWallpaper(context, path)
    }

    AsyncFunction("deleteWallpaper") { path: String ->
      deleteWallpaper(context, path)
    }

    View(WallpaperManagerView::class) {
      // Defines a setter for the `name` prop.
      Prop("name") { view: WallpaperManagerView, prop: String ->
        println(prop)
      }
    }
  }

  /**
   * Set wallpaper provided by path
   */
  @SuppressLint("MissingPermission")
  private fun setWallpaper(context: Context, path: String) {
    try {
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
    } catch (e: IOException) {
      Log.e("WallpaperManagerModule", "An error occurred while setting wallpaper")
      e.printStackTrace()
      // send event to JavaScript
    }
  }

  /**
   * Delete wallpaper provided by path
   */
  private fun deleteWallpaper(context: Context, path: String): Boolean {
    var result = false
    try {
      val uri = getImageUri(context, path)
      if (uri != null) {
        try {
          result = context.contentResolver.delete(uri, null, null) > 0
        } catch (e: Exception) {
          Log.e("WallpaperManagerModule", "Attempted to delete wallpaper: $path")
          e.printStackTrace()
        }
      }
    } catch (e: Exception) {
      Log.e("WallpaperManagerModule", "An error occurred while deleting wallpaper")
      e.printStackTrace()
      // send event to JavaScript
    }
    return result
  }

  fun getImageUri(context: Context, path: String): Uri? {
    val cursor = context.contentResolver.query(
      MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
      arrayOf(MediaStore.Images.Media._ID),
      MediaStore.Images.Media.DATA + " = ?",
      arrayOf(path),
      null
    )
    val uri = if (cursor != null && cursor.moveToFirst())
      ContentUris.withAppendedId(
        MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
        cursor.getLong(cursor.getColumnIndexOrThrow(MediaStore.Images.Media._ID))
      ) else null
    cursor?.close()
    return uri
  }
}
