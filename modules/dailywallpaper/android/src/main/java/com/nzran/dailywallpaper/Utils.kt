package com.nzran.dailywallpaper

import android.annotation.SuppressLint
import android.app.DownloadManager
import android.app.Notification
import android.app.WallpaperManager
import android.content.ContentResolver
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.ImageDecoder
import android.media.MediaScannerConnection
import android.net.Uri
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.graphics.drawable.IconCompat
import androidx.preference.PreferenceManager
import org.json.JSONObject
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.util.ArrayList
import java.util.Scanner

class Utils {
    companion object {

        /**
         * Get a wallpaper based on the type
         * @param context The context
         * @param type The type of wallpaper to get
         * @param sort The sort parameter for online wallpapers
         * @return Any of the following:
         *- If type is online and wallpaper is downloading, returns a HashMap with downloadId and path.
         *- If type is online and wallpaper is downloaded, returns the path of the wallpaper.
         *- If type is downloaded, returns the path of the wallpaper.
         *- If invalid, throws IllegalArgumentException.
         */
        fun getWallpaper(context: Context, type: String, sort: String = "new.json"): Any? {
            if (type == "online") {
                // get online wallpaper
                val wallpaper = getWallpaperFromReddit(sort)
                if (wallpaper != null) {
                    val location = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES)
                    val file = location?.resolve("${wallpaper["title"]!!}.${wallpaper["extension"]!!}")
                    if (file != null) {
                        if (file.exists()) {
                            Log.d("DailyWallpaperUtils", "Wallpaper already downloaded")
                            return file.absolutePath // already downloaded
                        } else {
                            val item = HashMap<String, Any>()
                            // start downloading the wallpaper and return the download id
                            item["downloadId"] = downloadWallpaper(
                                context,
                                wallpaper["url"]!!,
                                wallpaper["title"]!!,
                                wallpaper["extension"]!!
                            )
                            item["path"] = file.absolutePath
                            return item
                        }
                    }
                }
                return null
            }
            return getWallpaperFromStorage(context)
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
                    val bitmap: Bitmap = ImageDecoder.decodeBitmap(source)
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
                Log.e("DailyWallpaperUtils", "Failed to check if file exists", e)
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
                val title = obj.getString("title").trim().replace("[\\[(].*?[])]".toRegex(), "")
                    .replace("[^\\x00-\\x7F]".toRegex(), "")
                    .replace("\\u00A0", " ")
                    .replace("\\s{2,}".toRegex(), " ")
                    .replace("[/\\\\#,+()|~%'\":*?<>{}]".toRegex(), "")
                    .trim()
                    .replace(" ", "_")
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

        /**
         * Get a wallpaper from the storage that has not been set in the last 14 times
         */
        @SuppressLint("Range")
        fun getWallpaperFromStorage(context: Context): String? {
            val result = ArrayList<HashMap<String, String>>()
            val contentResolver: ContentResolver = context.contentResolver
            val projection = arrayOf(
                MediaStore.Images.Media._ID,
                MediaStore.Images.Media.DISPLAY_NAME,
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
                        if (!name.contains("amoled_droidheat")) {
                            continue
                        }
                        val path = cursor.getString(cursor.getColumnIndex(MediaStore.Images.Media.RELATIVE_PATH))
                        val fileMap = java.util.HashMap<String, String>()
                        fileMap["name"] = name
                        fileMap["path"] = "/storage/emulated/0/$path$name"
                        result.add(fileMap)
                    }
                    cursor.close()
                }
            } catch (e: Exception) {
                Log.e("DailyWallpaperUtils", "Failed to get downloaded files", e)
            }

            if (result.isEmpty()) {
                return null
            }

            // Get a wallpaper that has not been set in last 14
            val sharedPrefs = PreferenceManager.getDefaultSharedPreferences(context)
            var lastWallpaper = parseJsonToList(sharedPrefs.getString("lastWallpaper", "")!!)
            if (sharedPrefs.contains("lastWallpaper")) {
                for(i in 0 until result.size) {
                    val hash = result[i]["path"].hashCode()
                    if (!lastWallpaper.contains(hash)) {
                        // remove the oldest wallpaper if the list is full
                        if (lastWallpaper.size >= 14) {
                            lastWallpaper = lastWallpaper.filterIndexed({ index, _ -> index != 0 })
                        }
                        // add the new wallpaper to the list
                        sharedPrefs.edit().putString("lastWallpaper", jsonStringify(lastWallpaper.plus(hash))).apply()
                        return result[i]["path"]!!
                    }
                }
            }
            // return random wallpaper
            val randomIndex = (0 until result.size).random()
            sharedPrefs.edit().putString("lastWallpaper", jsonStringify(lastWallpaper.plus(result[randomIndex]["path"].hashCode()))).apply()
            return result[randomIndex]["path"]!!
        }

        // Function to JSON stringify a list of integers
        private fun jsonStringify(intList: List<Int>): String {
            return "[${intList.joinToString(",")}]"
        }

        // Function to parse JSON string back to a list of integers
        private fun parseJsonToList(jsonString: String): List<Int> {
            // Remove the brackets and split by comma
            return jsonString.removeSurrounding("[", "]")
                .split(",")
                .mapNotNull { it -> it.trim().takeIf { it.isNotEmpty() }?.toInt() } // Convert each string to Int
        }

    }
}