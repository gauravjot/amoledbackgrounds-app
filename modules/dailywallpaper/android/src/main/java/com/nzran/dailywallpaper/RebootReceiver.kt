package com.nzran.dailywallpaper

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.preference.PreferenceManager
import java.util.Date

class RebootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        if (intent?.action == "android.intent.action.BOOT_COMPLETED") {
            // Check shared preferences for timestamp
            val sharedPreferences = context?.let { PreferenceManager.getDefaultSharedPreferences(it) }
            if (sharedPreferences?.getBoolean("enabled", false) == true) {
                val timestamp = sharedPreferences.getLong("timestamp", 0)
                if (timestamp > 0) {
                    // Get current Date time
                    val currentTime = Date().time
                    // ignore date between timestamp and currentTime and only get the time difference
                    val timeDifference = currentTime - timestamp
                    // Reduce the time difference from 24 hours
                    val timeToSchedule = 24 * 60 * 60 * 1000 - timeDifference
                    // Schedule the service
                    DailyWallpaperService.scheduleService(context, timeToSchedule)
                }
            }
        }
    }
}