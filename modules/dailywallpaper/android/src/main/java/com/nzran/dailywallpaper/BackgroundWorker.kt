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
import androidx.work.Worker
import androidx.work.WorkerParameters


// Worker class is used to perform background task

class BackgroundWorker(context: Context, workerParams: WorkerParameters) :
    Worker(context, workerParams) {
    @SuppressLint("UnspecifiedRegisterReceiverFlag")
    override fun doWork(): Result {
        val sharedPrefs = PreferenceManager.getDefaultSharedPreferences(applicationContext)
        Log.d(TAG, "Scheduled worker started")
        if (!sharedPrefs.getBoolean("enabled", false)) {
            Log.d(TAG, "Daily wallpaper is not enabled. Worker is exiting.")
            return Result.success()
        }

        // get the wallpaper
        Log.d(TAG, "Getting wallpaper")
        val wallpaper = Utils.getWallpaper(applicationContext, sharedPrefs.getString("type", "online") ?: "online",
            sharedPrefs.getString("sort", "new.json") ?: "new.json")

        // if wallpaper type is Long, then it is a download id and we need to wait for the download to complete
        if (wallpaper is HashMap<*, *>) {
            // wait for the download to complete
            Log.d(TAG, "Waiting for download to complete")
            downloadId = wallpaper["downloadId"] as Long
            filepath = wallpaper["path"] as String
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                applicationContext.registerReceiver(downloadReceiver, IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE), Context.RECEIVER_EXPORTED)
            } else {
                applicationContext.registerReceiver(downloadReceiver, IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE))
            }
        } else {
            // set wallpaper
            Log.d(TAG, "Setting wallpaper")
            Utils.setWallpaper(applicationContext, wallpaper as String)
        }

        return Result.success()
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
        private var filepath: String? = null
        private var downloadId: Long = -1
    }
}