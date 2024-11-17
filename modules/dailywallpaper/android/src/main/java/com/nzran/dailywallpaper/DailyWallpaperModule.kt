package com.nzran.dailywallpaper

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import androidx.preference.PreferenceManager
import android.util.Log
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.Date

class DailyWallpaperModule : Module() {

  private val context
    get() = requireNotNull(appContext.reactContext)

  override fun definition() = ModuleDefinition {
    Name("DailyWallpaper")

    // Register for the daily wallpaper service
    AsyncFunction("registerService") { type: String, sort: String ->
      val sharedPref = PreferenceManager.getDefaultSharedPreferences(context)
      // Check if service is already enabled
      if (sharedPref.getBoolean("enabled", false)) {
        throw IllegalStateException("Service already enabled")
      }
      val sharedPrefEditor = sharedPref.edit()
      // Save in shared preferences
      sharedPrefEditor.putString("type", type)
      sharedPrefEditor.putString("sort", sort)
      sharedPrefEditor.putBoolean("enabled", true)
      sharedPrefEditor.putLong("timestamp", Date().time)
      sharedPrefEditor.apply()

      // Schedule the worker
      val workManager = WorkManager.getInstance(context)
      val workRequest = PeriodicWorkRequestBuilder<BackgroundWorker>(1, java.util.concurrent.TimeUnit.DAYS)
        .addTag("dailyWallpaper")
        .build()
      workManager.enqueueUniquePeriodicWork("dailyWallpaper", ExistingPeriodicWorkPolicy.REPLACE, workRequest)

      return@AsyncFunction workRequest.id.toString()
    }

    // Unregister for the daily wallpaper service
    AsyncFunction("unregisterService") {
      val sharedPreferences = PreferenceManager.getDefaultSharedPreferences(context)
      sharedPreferences.edit().putBoolean("enabled", false).apply()
      // Cancel the worker
      val workManager = WorkManager.getInstance(context)
      workManager.cancelAllWorkByTag("dailyWallpaper")
      workManager.cancelUniqueWork("dailyWallpaper")
      Log.d(TAG, "Worker cancelled")
      return@AsyncFunction true
    }

    // Check if the daily wallpaper service is enabled
    Function("isServiceEnabled") {
      val sharedPreferences = PreferenceManager.getDefaultSharedPreferences(context)
      return@Function sharedPreferences.getBoolean("enabled", false)
    }

    Function("changeType") { type: String ->
        val sharedPreferences = PreferenceManager.getDefaultSharedPreferences(context)
        sharedPreferences.edit().putString("type", type).apply()
    }

    Function("changeSort") { sort: String ->
        val sharedPreferences = PreferenceManager.getDefaultSharedPreferences(context)
        sharedPreferences.edit().putString("sort", sort).apply()
    }
  }

  companion object {
    private const val TAG = "DailyWallpaperModule"
  }
}
