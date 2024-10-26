package com.nzran.downloadmanager

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.ContentResolver
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.media.MediaScannerConnection
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Log
import androidx.core.os.bundleOf
import java.util.concurrent.Executors
import android.os.Handler
import android.os.Looper
import android.os.Message

import java.io.File
import java.nio.file.Files
import java.util.ArrayList
import java.util.HashMap

class DownloadManagerModule : Module() {

  private val context
  get() = requireNotNull(appContext.reactContext)

  val executor = Executors.newSingleThreadExecutor()
  val downloadPath: String = "/storage/emulated/0/Pictures/"
  var isDownloadComplete = false

  val downloadProgressHandler = Handler(Looper.getMainLooper(), Handler.Callback { msg ->
    if (msg.what == 1) {
        this@DownloadManagerModule.sendEvent("onDownloadProgress", bundleOf("progress" to msg.arg1))
    }
    true
  })

  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    Name("DownloadManager")


    // Download image function
    Function("downloadImage") { url: String, filename: String, file_extension: String ->
      downloadImage(context, url, filename, file_extension)
    }

    // Event to notify
    Events("onDownloadComplete", "onDownloadProgress")

    // Function to get downloaded files
    Function("getDownloadedFiles") { matchNameStr: String ->
      val result = ArrayList<HashMap<String, String>>()
      val contentResolver: ContentResolver = context.getContentResolver()
      val projection = arrayOf(
        MediaStore.Images.Media._ID,
        MediaStore.Images.Media.DISPLAY_NAME,
        MediaStore.Images.Media.HEIGHT,
        MediaStore.Images.Media.WIDTH,
        MediaStore.Images.Media.RELATIVE_PATH
      )
      val selection = ""
      val selectionArgs = arrayOf<String>()
      val sortOrder = "${MediaStore.Images.Media.DATE_ADDED} ASC"

      try {
        val cursor = contentResolver.query(
          MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
          projection,
          selection,
          selectionArgs,
          sortOrder
        )
        if (cursor != null) {
          while (cursor.moveToNext()) {
            val name = cursor.getString(cursor.getColumnIndex(MediaStore.Images.Media.DISPLAY_NAME))
            if (matchNameStr.isNotEmpty() && !name.contains(matchNameStr)) {
              continue
            }
            val path = cursor.getString(cursor.getColumnIndex(MediaStore.Images.Media.RELATIVE_PATH))
            val fileMap = HashMap<String, String>()
            fileMap["name"] = name
            fileMap["path"] = "/storage/emulated/0/" + path + name
            fileMap["width"] = cursor.getString(cursor.getColumnIndex(MediaStore.Images.Media.WIDTH))
            fileMap["height"] = cursor.getString(cursor.getColumnIndex(MediaStore.Images.Media.HEIGHT))
            result.add(fileMap)
          }
          cursor.close()
        }
      } catch (e: Exception) {
        Log.e("DownloadManagerModule", "Failed to get downloaded files", e)
      }
      result
    }

    // Permission
    Function("hasPermissionForStorage") {
      hasPermissionForStorage()
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

  /**
   *
   */
  fun hasPermissionForStorage(): Boolean {
    var permission = android.Manifest.permission.READ_EXTERNAL_STORAGE
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      permission = android.Manifest.permission.READ_MEDIA_IMAGES
    }
    if (context.checkSelfPermission(permission) == PackageManager.PERMISSION_GRANTED) {
      return true
    }
    return false
  }

  /**
   * Download image from given URL
   */
  var downloadId: Long = 0
  var filename: String = ""
  var file_extension: String = ""

  fun downloadImage(context: Context, url: String, filename: String, file_extension: String): Boolean {
    val downloadManager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
    val downloadUri = Uri.parse(url)
    this.filename = filename
    this.file_extension = file_extension
    this.isDownloadComplete = false

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
    // setup executor to track download progress
    executor.execute(Runnable {
      while (isDownloadComplete == false && downloadId != 0L) {
        try {
          val cursor = downloadManager.query(DownloadManager.Query().setFilterById(downloadId))
          if (cursor != null && cursor.moveToFirst()) {
            val status = cursor.getInt(cursor.getColumnIndex(DownloadManager.COLUMN_STATUS))
            if (status == DownloadManager.STATUS_SUCCESSFUL) {
                isDownloadComplete = true
            }

            val bytesDownloaded = cursor.getInt(cursor.getColumnIndex(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR))
            val bytesTotal = cursor.getInt(cursor.getColumnIndex(DownloadManager.COLUMN_TOTAL_SIZE_BYTES))
            val progress = if (bytesTotal > 0) (bytesDownloaded * 100L / bytesTotal).toInt() else 0

            val message = Message.obtain()
            message.what = 1
            message.arg1 = progress
            downloadProgressHandler.sendMessage(message)
            cursor?.close()
          } else {
            isDownloadComplete = true
          }
        } catch (e: Exception) {
          Log.e("DownloadManagerModule", "Failed to track download progress", e)
        }
        Thread.sleep(1000)
      }
    })
    return true
  }

  // Broadcast receiver to listen for download completion
  val downloadReceiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
      val id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1)
      if (id == downloadId) {
        isDownloadComplete = true
        sendDownloadedFileInfo()
        // unregister receiver
        context.unregisterReceiver(this)
      }
    }
  }

  fun sendDownloadedFileInfo() {
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
  }
}
