package com.nzran.dailywallpaper

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.app.WallpaperManager
import android.app.job.JobInfo
import android.app.job.JobScheduler
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.IBinder
import androidx.preference.PreferenceManager
import java.util.Date

class DailyWallpaperService : Service() {
    private val TAG = "DailyWallpaperService"
    private val CHANNEL_ID = "DailyWallpaperServiceChannel"
    private val CHANNEL_NAME = "Daily Wallpaper Service Channel"
    private val CHANNEL_DESCRIPTION = "This is the channel for Daily Wallpaper Service"

    private val wallpaperManager by lazy { WallpaperManager.getInstance(this) }
    private val notificationManager by lazy { getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager }
    private val alarmManager by lazy { getSystemService(Context.ALARM_SERVICE) as AlarmManager }


    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // register for tomorrow
        scheduleService(this)
        val sharedPrefEditor = PreferenceManager.getDefaultSharedPreferences(this).edit()
        sharedPrefEditor.putLong("timestamp", Date().time)
        sharedPrefEditor.apply()

        // get the wallpaper

        // set the wallpaper
        return super.onStartCommand(intent, flags, startId)
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_DEFAULT).apply {
            description = CHANNEL_DESCRIPTION
        }
        notificationManager.createNotificationChannel(channel)
    }

    companion object {
        fun scheduleService(context: Context, delay: Long = 0) {
            var timeGap: Long = 1000 * 60 * 60 * 24 // 24 hours
            if (delay > 0) {
                timeGap = delay
            }
            // Alarm the service for tomorrow  tomorrow Date() + 1d
            val serviceComponent = ComponentName(context, DailyWallpaperService::class.java)
            val builder = JobInfo.Builder(5799435, serviceComponent)
            builder.setMinimumLatency(timeGap)
            builder.setOverrideDeadline(timeGap)
            builder.setRequiresCharging(false)
            builder.setRequiresDeviceIdle(false)
            val jobScheduler = context.getSystemService(JobScheduler::class.java)
            jobScheduler.schedule(builder.build())
        }
    }
}