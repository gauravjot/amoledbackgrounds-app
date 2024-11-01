package com.nzran.dailywallpaper

import android.content.Intent
import androidx.core.content.ContextCompat.startForegroundService
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import androidx.preference.PreferenceManager
import android.app.job.JobScheduler
import java.util.Date

class DailyWallpaperModule : Module() {

  private val context
    get() = requireNotNull(appContext.reactContext)

  override fun definition() = ModuleDefinition {
    Name("DailyWallpaper")

    // Register for the daily wallpaper service
    Function("registerDailyWallpaperService") { type: String, sort: String ->
      val sharedPrefEditor = PreferenceManager.getDefaultSharedPreferences(context).edit()
      // Save in shared preferences
      if (type == "online") {
        sharedPrefEditor.putString("type", "online")
        sharedPrefEditor.putString("sort", sort)
      } else if (type == "downloaded") {
        sharedPrefEditor.putString("type", "downloaded")
      } else {
        throw IllegalArgumentException("Invalid type")
      }
      sharedPrefEditor.putBoolean("enabled", true)
      sharedPrefEditor.putLong("timestamp", Date().time)
      sharedPrefEditor.apply()

      // Run daily starting now
      startForegroundService(context, Intent(context, DailyWallpaperService::class.java))

      DailyWallpaperService.scheduleService(context);
    }

    // Unregister for the daily wallpaper service
    Function("unregisterDailyWallpaperService") {
      val sharedPreferences = PreferenceManager.getDefaultSharedPreferences(context)
      sharedPreferences.edit().putBoolean("enabled", false).apply()
      // Cancel the job scheduler
      val jobScheduler = context.getSystemService(JobScheduler::class.java)
      jobScheduler.cancel(5799435)
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of
    // the view definition: Prop, Events.
    View(DailyWallpaperView::class) {
      // Defines a setter for the `name` prop.
      Prop("name") { view: DailyWallpaperView, prop: String ->
        println(prop)
      }
    }
  }
}
