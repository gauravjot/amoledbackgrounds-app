package com.nzran.dailywallpaper

import android.annotation.SuppressLint
import android.app.DownloadManager
import android.app.Notification
import android.app.WallpaperManager
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.ImageDecoder
import android.media.MediaScannerConnection
import android.net.Uri
import android.os.Environment
import android.util.Base64
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.graphics.drawable.IconCompat
import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.util.Scanner

class Utils {
    companion object {
        fun getWallpaper(context: Context, type: String, sort: String = ""): Any? {
            when (type) {
                "online" -> {
                    // get online wallpaper
                    val wallpaper = getWallpaperFromReddit(sort)
                    if (wallpaper != null) {
                        val filepath = "/storage/emulated/0/Pictures/${wallpaper["title"]!!}.${wallpaper["extension"]!!}"
                        return if (doesFileExist(filepath)) {
                            // already downloaded
                            filepath;
                        } else {
                            val item = HashMap<String, Any>()
                            // start downloading the wallpaper and return the download id
                            item["downloadId"] = downloadWallpaper(
                                context,
                                wallpaper["url"]!!,
                                wallpaper["title"]!!,
                                wallpaper["extension"]!!
                            )
                            item["path"] = filepath
                            item;
                        }
                    } else {
                        return null;
                    }
                }
                "downloaded" -> {
                    // get downloaded wallpaper
                    println("Getting downloaded wallpaper")
                    return null;
                }
                else -> {
                    throw IllegalArgumentException("Invalid type")
                }
            }
        }

        @SuppressLint("MissingPermission")
        fun setWallpaper(context: Context, filepath: String) {
            // Set wallpaper
            val wallpaperManager = WallpaperManager.getInstance(context)

            val options: BitmapFactory.Options = BitmapFactory.Options()
            options.inPreferredConfig = Bitmap.Config.ARGB_8888

            MediaScannerConnection.scanFile(context, arrayOf(filepath), null
            ) { path, uri ->
                try {
                    val source: ImageDecoder.Source =
                        ImageDecoder.createSource(context.contentResolver, uri)
                    val bitmap: Bitmap = ImageDecoder.decodeBitmap(source);
                    wallpaperManager.setBitmap(bitmap)
                } catch (e: Exception) {
                    Log.e("WallpaperManagerModule", "Attempted to set wallpaper: $path")
                    e.printStackTrace()
                }
            }
        }

        fun pushNotification(context: Context, channel: String, message: String, iconUri: String): Notification {
            val decodedBytes: ByteArray = Base64.decode(iconUri, Base64.DEFAULT)
            val notification = NotificationCompat.Builder(context, channel)
                .setContentTitle("Daily Wallpaper")
                .setContentText(message)
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setAutoCancel(true)
                .setContentIntent(null)
                .setSmallIcon(IconCompat.createWithBitmap(BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)))
                .build()
            return notification
        }

        private fun doesFileExist(filepath: String): Boolean {
            try {
                // check if the wallpaper exists
                val file = java.io.File(filepath)
                return file.exists()
            } catch (e: Exception) {
                return false
            }
        }

        private fun downloadWallpaper(context: Context, url: String, title: String, extension: String): Long {
            val downloadManager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            val downloadUri = Uri.parse(url)

            val request = DownloadManager.Request(downloadUri)
            request.setAllowedNetworkTypes(DownloadManager.Request.NETWORK_WIFI or DownloadManager.Request.NETWORK_MOBILE)
            request.setAllowedOverRoaming(false)
            request.setTitle("Downloading $title")
            request.setDescription("Downloading image from $url")
            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE)
            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_PICTURES, "$title.$extension")

            return downloadManager.enqueue(request)
        }

        private fun getWallpaperFromReddit(sort: String): HashMap<String, String>? {
            val item = HashMap<String, String>()
            // get wallpaper from reddit
            val url = "https://www.reddit.com/r/amoledbackgrounds/${sort}${if(sort.contains("?")) {"&"} else {"?"}}limit=5"
            Log.d("DailyWallpaper", "Fetching wallpaper from $url")
            val contents = jsonGetRequest(url) ?: return null

            // parse the json
            val jsonObject = JSONObject(contents.trim())
            val objList = jsonObject.getJSONObject("data").getJSONArray("children")

            for (i in 0 until objList.length()) {
                val obj = objList.getJSONObject(i).getJSONObject("data")
                if (!obj.has("preview")) {
                    continue
                }
                if (obj.getJSONObject("preview").getJSONArray("images").getJSONObject(0)
                        .getJSONArray("resolutions").length() < 1) {
                    continue
                }
                val title = obj.getString("title").replace("\\(.*?\\) ?", "")
                    .replace("\\[.*?\\] ?", "")
                    .replace("\\{[^}]*\\}", "")
                    .replace("\\u00A0", " ")
                    .replace("[\\s\\s+]".toRegex(), " ")
                    .replace(" ", "_")
                    .replace("[^\\x00-\\x7F]".toRegex(), "")
                    .replace("[/\\\\#,+()|~%'\":*?<>{}]".toRegex(), "")
                    .trim()
                item["title"] = "${title}_-_${obj.getString("id")}_amoled_droidheat"
                item["url"] = obj.getString("url")
                item["extension"] = obj.getString("url").substringAfterLast(".")
                break
            }
            return if (item.containsKey("url")) {
                item
            } else {
                null
            }
        }

        private fun jsonGetRequest(urlQueryString: String): String? {
            var json: String? = null
            try {
                val url = URL(urlQueryString)
                val connection = url.openConnection() as HttpURLConnection
                connection.readTimeout = 10000
                connection.connectTimeout = 15000
                connection.requestMethod = "GET"
                connection.connect()
                val inStream = connection.inputStream
                json = Scanner(inStream, "UTF-8").useDelimiter("\\Z").next()
            } catch (ex: IOException) {
                ex.printStackTrace()
            }
            return json
        }

    }
}