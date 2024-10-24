package com.nzran.downloadmanager

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

import android.app.AlertDialog
import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.ContentResolver
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.graphics.Color
import android.media.MediaScannerConnection
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.os.Handler
import android.provider.MediaStore
import android.util.Log;
import androidx.core.os.bundleOf

import java.io.File
import java.nio.file.Files
import java.text.SimpleDateFormat
import java.util.ArrayList
import java.util.Date
import java.util.HashMap
import java.util.Objects
import java.util.concurrent.Executors

class DownloadManagerModule : Module() {

  private val context
  get() = requireNotNull(appContext.reactContext)

  val downloadPath: String = "/storage/emulated/0/Pictures/"

  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('DownloadManager')` in JavaScript.
    Name("DownloadManager")

    Function("downloadImage") { uri: String, filename: String, file_extension: String ->
      downloadImage(context, uri, filename, file_extension)
    }

    Events("onDownloadComplete")

    Function("getDownloadedFiles") {
      val files = File(downloadPath).listFiles()
      val downloadedFiles = ArrayList<HashMap<String, String>>()
      if (files != null) {
        for (file in files) {
          val fileMap = HashMap<String, String>()
          fileMap["name"] = file.name
          fileMap["path"] = file.absolutePath
          downloadedFiles.add(fileMap)
        }
      }
      downloadedFiles
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { value: String ->
      // Send an event to JavaScript.
      sendEvent("onChange", mapOf(
        "value" to value
      ))
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of
    // the view definition: Prop, Events.
    View(DownloadManagerView::class) {
      // Defines a setter for the `name` prop.
      Prop("name") { view: DownloadManagerView, prop: String ->
        println(prop)
      }
    }
  }

  var downloadId: Long = 0
  var filename: String = ""
  var file_extension: String = ""

  fun downloadImage(context: Context, url: String, filename: String, file_extension: String): Boolean {
    val downloadManager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
    val downloadUri = Uri.parse(url)
    this.filename = filename
    this.file_extension = file_extension

    val request = DownloadManager.Request(downloadUri)
    request.setAllowedNetworkTypes(DownloadManager.Request.NETWORK_WIFI or DownloadManager.Request.NETWORK_MOBILE)
    request.setAllowedOverRoaming(false)
    request.setTitle("Downloading " + filename)
    request.setDescription("Downloading image from " + url)
    request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE)
    request.setDestinationInExternalPublicDir(Environment.DIRECTORY_PICTURES, filename+".download")

    downloadId = downloadManager.enqueue(request)
    // register receiver to listen for download completion
    context.registerReceiver(downloadReceiver, IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE), android.content.Context.RECEIVER_EXPORTED)
    return true
  }

  // Broadcast receiver to listen for download completion
  val downloadReceiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
      val id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1)
      if (id == downloadId) {
        try {
          var file: File = File(downloadPath + filename + ".download")
          if (!file.exists()) {
            throw Exception("Downloaded file not found")
          }
          // rename file to remove .download extension
          Files.move(file.toPath(), file.toPath().resolveSibling(filename+"."+file_extension))
          file = File(downloadPath + filename + "." + file_extension)
          // Remove from MediaStore
          val contentResolver: ContentResolver = context.getContentResolver()
          val contentUri: Uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI
          val selection: String = MediaStore.Images.Media.DISPLAY_NAME + " = ?"
          contentResolver.delete(contentUri, selection, arrayOf(filename+".download"))
          // Add renamed file to MediaStore
          val values = ContentValues()
          values.put(MediaStore.Images.Media.DISPLAY_NAME, filename + "." + file_extension)
          MediaScannerConnection.scanFile(context, arrayOf(file.getAbsolutePath()), null,
            object : MediaScannerConnection.OnScanCompletedListener {
              override fun onScanCompleted(path: String, uri: Uri) {
                val success = context.getContentResolver().update(uri, values, null, null) == 1
                if (!success) {
                  throw Exception("Failed to update renamed image in MediaStore")
                }
              }
            }
          )
          this@DownloadManagerModule.sendEvent("onDownloadComplete", bundleOf(
            "success" to true,
            "path" to file.getAbsolutePath()
          ))
        } catch (e: Exception) {
          Log.e("DownloadManagerModule", "Failed to download image", e)
          // TODO: send error to JavaScript or handle it here

          // send event to JavaScript
          this@DownloadManagerModule.sendEvent("onDownloadComplete", bundleOf(
            "success" to false,
            "path" to ""
          ))
        }
        // unregister receiver
        context.unregisterReceiver(this)
      }
    }
  }
}
