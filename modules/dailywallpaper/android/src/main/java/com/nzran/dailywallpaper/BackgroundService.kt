package com.nzran.dailywallpaper

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.IBinder
import android.util.Log
import androidx.preference.PreferenceManager

// Services work with Android version 30 and below

class BackgroundService : Service() {

    private val notificationManager by lazy { getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // register for tomorrow
        val sharedPref = PreferenceManager.getDefaultSharedPreferences(this)
        val iconUri = sharedPref.getString("iconUri", "")
        Utils.scheduleService(this, sharedPref.getLong("interval", 24 * 60 * 60 * 1000))

        // get the wallpaper
        Log.d(Companion.TAG, "Setting wallpaper");
        Log.d(Companion.TAG, iconUri ?: "")

        // push notification
        pushNotification("Setting wallpaper", iconUri ?: "")

        // dummy, wait 1 sec and push notification
        Thread.sleep(1000)
        pushNotification("Wallpaper set", iconUri ?: "")
        stopForeground(STOP_FOREGROUND_REMOVE)

        // set the wallpaper
        return START_NOT_STICKY
    }

    private fun pushNotification(message: String, iconUri: String) {
        createNotificationChannel()
        startForeground(456653, Utils.pushNotification(this, Companion.CHANNEL_ID, message, iconUri))
    }

    private fun createNotificationChannel() {
        val name = "Daily Wallpaper Service"
        val descriptionText = "Daily Wallpaper Service"
        val importance = NotificationManager.IMPORTANCE_DEFAULT
        val channel = NotificationChannel(Companion.CHANNEL_ID, name, importance).apply {
            description = descriptionText
        }
        notificationManager.createNotificationChannel(channel)
    }

    companion object {
        private const val TAG = "DailyWallpaperService"
        private const val CHANNEL_ID = "DailyWallpaperServiceChannel"
    }
}