package com.nzran.dailywallpaper

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import androidx.preference.PreferenceManager
import android.util.Log
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequest
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.Date
import java.util.UUID

class DailyWallpaperModule : Module() {

  private val context
    get() = requireNotNull(appContext.reactContext)

  override fun definition() = ModuleDefinition {
    Name("DailyWallpaper")

    // Register for the daily wallpaper service
    AsyncFunction("registerService") { type: String, sort: String, iconUri: String ->
      val sharedPref = PreferenceManager.getDefaultSharedPreferences(context)
      // Check if service is already enabled
      if (sharedPref.getBoolean("enabled", false)) {
        throw IllegalStateException("Service already enabled")
      }
      val sharedPrefEditor = sharedPref.edit()
      // Save in shared preferences
      sharedPrefEditor.putString("type", type)
      sharedPrefEditor.putString("sort", sort)
      sharedPrefEditor.putString("iconUri", iconUri)
      sharedPrefEditor.putBoolean("enabled", true)
      sharedPrefEditor.putLong("timestamp", Date().time)

      // Schedule the worker
      val workManager = WorkManager.getInstance(context)
      val workRequest = PeriodicWorkRequestBuilder<BackgroundWorker>(15, java.util.concurrent.TimeUnit.MINUTES)
        .addTag("dailyWallpaper")
        .build()
      workManager.enqueueUniquePeriodicWork("dailyWallpaper", ExistingPeriodicWorkPolicy.REPLACE, workRequest)
      sharedPrefEditor.apply()
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

    // Enables the module to be used as a native view. Definition components that are accepted as part of
    // the view definition: Prop, Events.
    View(DailyWallpaperView::class) {
      // Defines a setter for the `name` prop.
      Prop("name") { _: DailyWallpaperView, prop: String ->
        println(prop)
      }
    }
  }

  companion object {
    private const val TAG = "DailyWallpaperModule"
  }
}
