package com.nzran.dailywallpaper

import android.annotation.SuppressLint
import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.util.Log
import androidx.preference.PreferenceManager
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

// Worker class is used to perform background task
class BackgroundWorker(context: Context, workerParams: WorkerParameters) :
    CoroutineWorker(context, workerParams) {

    private var filepath: String? = null
    private var downloadId: Long = -1

    @SuppressLint("UnspecifiedRegisterReceiverFlag")
    override suspend fun doWork(): Result {
        return withContext(Dispatchers.IO) {
            Log.d(TAG, "Scheduled worker started")
            val sharedPrefs = PreferenceManager.getDefaultSharedPreferences(applicationContext)
            if (!sharedPrefs.getBoolean("enabled", false)) {
                Log.d(TAG, "Daily wallpaper is not enabled. Worker is exiting.")
                return@withContext Result.success()
            }

            // get the wallpaper
            Log.d(TAG, "Getting wallpaper: " + sharedPrefs.getString("type", "online") + ", " + sharedPrefs.getString("sort", "new.json"))
            val wallpaper = Utils.getWallpaper(
                applicationContext, sharedPrefs.getString("type", "online") ?: "online",
                sharedPrefs.getString("sort", "new.json") ?: "new.json"
            )

            // if wallpaper type is HashMap, then it has a download id and we need to wait for the download to complete
            if (wallpaper is HashMap<*, *>) {
                // wait for the download to complete
                Log.d(TAG, "Waiting for download to complete")
                downloadId = wallpaper["downloadId"] as Long
                filepath = wallpaper["path"] as String
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    applicationContext.registerReceiver(
                        downloadReceiver,
                        IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE),
                        Context.RECEIVER_EXPORTED
                    )
                } else {
                    applicationContext.registerReceiver(
                        downloadReceiver,
                        IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE)
                    )
                }
            } else if (wallpaper is String && wallpaper.isNotEmpty()) {
                // if wallpaper is a String, then it is path to the wallpaper
                // set wallpaper
                Log.d(TAG, "Setting wallpaper")
                Utils.setWallpaper(applicationContext, wallpaper)
            } else {
                Log.d(TAG, "Failed to get wallpaper")
                Log.d(TAG, wallpaper.toString())
            }
            return@withContext Result.success()
        }
    }

    // Broadcast receiver to listen for download completion
    private val downloadReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1)
            if (id == downloadId) {
                // set wallpaper
                Log.d(TAG, "Setting wallpaper")
                Utils.setWallpaper(context, filepath!!)
                // unregister receiver
                context.unregisterReceiver(this)
            }
        }
    }

    companion object {
        private const val TAG = "DailyWallpaperBackgroundWorker"
    }
}