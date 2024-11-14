package com.nzran.downloadmanager

import android.annotation.SuppressLint
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.interfaces.permissions.Permissions
import expo.modules.kotlin.Promise

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
import androidx.core.database.getStringOrNull
import expo.modules.kotlin.exception.Exceptions

import java.io.File
import java.nio.file.Files
import java.util.ArrayList
import java.util.HashMap

class DownloadManagerModule : Module() {

  private val context
  get() = requireNotNull(appContext.reactContext)

  private val DOWNLOAD_LOCATION = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES);

  private val executor = Executors.newSingleThreadExecutor()
  var isDownloadComplete = false

  private val downloadProgressHandler = Handler(Looper.getMainLooper()) { msg ->
    if (msg.what == 1) {
      this@DownloadManagerModule.sendEvent("onDownloadProgress", msg.data)
    }
    true
  }

  private val permissionsManager: Permissions
    get() = appContext.permissions ?: throw Exceptions.PermissionsModuleNotFound()

  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  @SuppressLint("Range")
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
      val contentResolver: ContentResolver = context.contentResolver
      val projection = arrayOf(
        MediaStore.Images.Media.DISPLAY_NAME,
        MediaStore.Images.Media.HEIGHT,
        MediaStore.Images.Media.WIDTH
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
            val fileMap = HashMap<String, String>()
            fileMap["name"] = name
            fileMap["path"] = DOWNLOAD_LOCATION.resolve(name).absolutePath
            fileMap["width"] = cursor.getStringOrNull(cursor.getColumnIndex(MediaStore.Images.Media.WIDTH)) ?: ""
            fileMap["height"] = cursor.getStringOrNull(cursor.getColumnIndex(MediaStore.Images.Media.HEIGHT)) ?: ""
            result.add(fileMap)
          }
          cursor.close()
        }
      } catch (e: Exception) {
        Log.e("DownloadManagerModule", "Failed to get downloaded files", e)
      }
      result
    }

    // Permissions
    // Check if the app has permission to read external storage
    Function("hasPermissionForStorage") {
      hasPermissionForStorage()
    }
    // Request permission to read external storage
    AsyncFunction("requestStoragePermissionsAsync") { promise: Promise ->
      val permission: String = if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
        android.Manifest.permission.READ_EXTERNAL_STORAGE
      } else {
        android.Manifest.permission.READ_MEDIA_IMAGES
      }
      Permissions.askForPermissionsWithPermissionsManager(
        permissionsManager,
        promise,
        permission
      )
    }
    // Open App page in settings to allow permission
    Function("openAppInDeviceSettings") {
      val intent = Intent()
      intent.action = android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS
      intent.data = Uri.fromParts("package", context.packageName, null)
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
    }

    // Check if file exists
    AsyncFunction("checkFileExists") { path: String ->
      val file = File(path)
      return@AsyncFunction file.exists()
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of
    // the view definition: Prop, Events.
    View(DownloadManagerView::class) {
      // Defines a setter for the `name` prop.
      Prop("name") { _: DownloadManagerView, prop: String ->
        println(prop)
      }
    }
  }

  /**
   *
   */
  private fun hasPermissionForStorage(): Boolean {
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
  private var filename: String = ""
  private var fileExtension: String = ""

  @SuppressLint("Range", "UnspecifiedRegisterReceiverFlag")
  fun downloadImage(context: Context, url: String, filename: String, fileExtension: String): Long {
    val downloadManager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
    val downloadUri = Uri.parse(url)
    this.filename = filename
    this.fileExtension = fileExtension
    this.isDownloadComplete = false

    val request = DownloadManager.Request(downloadUri)
    request.setAllowedNetworkTypes(DownloadManager.Request.NETWORK_WIFI or DownloadManager.Request.NETWORK_MOBILE)
    request.setAllowedOverRoaming(false)
    request.setTitle("Downloading $filename")
    request.setDescription("Downloading image from $url")
    request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE)
    request.setDestinationInExternalPublicDir(Environment.DIRECTORY_PICTURES, "$filename.download")

    downloadId = downloadManager.enqueue(request)
    // register receiver to listen for download completion
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      context.registerReceiver(downloadReceiver, IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE), Context.RECEIVER_EXPORTED)
    } else {
        context.registerReceiver(downloadReceiver, IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE))
    }
    // setup executor to track download progress
    executor.execute {
      while (!isDownloadComplete && downloadId != 0L) {
        try {
          val cursor = downloadManager.query(DownloadManager.Query().setFilterById(downloadId))
          if (cursor != null && cursor.moveToFirst()) {
            val status = cursor.getInt(cursor.getColumnIndex(DownloadManager.COLUMN_STATUS))
            if (status == DownloadManager.STATUS_SUCCESSFUL) {
              isDownloadComplete = true
            }

            val bytesDownloaded =
              cursor.getInt(cursor.getColumnIndex(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR))
            val bytesTotal =
              cursor.getInt(cursor.getColumnIndex(DownloadManager.COLUMN_TOTAL_SIZE_BYTES))
            val progress = if (bytesTotal > 0) (bytesDownloaded * 100L / bytesTotal).toInt() else 0

            val message = Message.obtain()
            message.what = 1
            message.data = bundleOf(
                "progress" to progress,
                "filename" to filename,
                "downloadId" to downloadId
            )
            downloadProgressHandler.sendMessage(message)
            cursor.close()
          } else {
            isDownloadComplete = true
          }
        } catch (e: Exception) {
          Log.e("DownloadManagerModule", "Failed to track download progress", e)
        }
        Thread.sleep(200)
      }
    }
    return downloadId
  }

  // Broadcast receiver to listen for download completion
  private val downloadReceiver = object : BroadcastReceiver() {
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

  // Send event to JavaScript after processing downloaded file
  fun sendDownloadedFileInfo() {
    try {
      var file = File(DOWNLOAD_LOCATION,"$filename.download")
      if (!file.exists()) {
        throw Exception("Downloaded file not found")
      }
      // rename file to remove .download extension
      Files.move(file.toPath(), file.toPath().resolveSibling("$filename.$fileExtension"))
      file = File(DOWNLOAD_LOCATION, "$filename.$fileExtension")
      // Remove from MediaStore
      val contentResolver: ContentResolver = context.contentResolver
      val contentUri: Uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI
      val selection: String = MediaStore.Images.Media.DISPLAY_NAME + " = ?"
      contentResolver.delete(contentUri, selection, arrayOf("$filename.download"))
      // Add renamed file to MediaStore
      val values = ContentValues()
      values.put(MediaStore.Images.Media.DISPLAY_NAME, "$filename.$fileExtension")
      MediaScannerConnection.scanFile(context, arrayOf(file.absolutePath), null
      ) { _, uri ->
        val success = context.contentResolver.update(uri, values, null, null) == 1
        if (!success) {
          throw Exception("Failed to update renamed image in MediaStore")
        }
      }
      this@DownloadManagerModule.sendEvent("onDownloadComplete", bundleOf(
        "success" to true,
        "path" to file.absolutePath
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
