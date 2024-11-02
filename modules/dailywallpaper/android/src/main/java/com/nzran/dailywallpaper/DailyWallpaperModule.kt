package com.nzran.dailywallpaper

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
    Function("registerService") { type: String, sort: String, iconUri: String ->
      val sharedPref = PreferenceManager.getDefaultSharedPreferences(context)
      // Check if service is already enabled
      if (sharedPref.getBoolean("enabled", false)) {
        throw IllegalStateException("Service already enabled")
      }
      val sharedPrefEditor = sharedPref.edit()
      // Save in shared preferences
      when (type) {
          "online" -> {
            sharedPrefEditor.putString("type", "online")
            sharedPrefEditor.putString("sort", sort)
          }
          "downloaded" -> {
            sharedPrefEditor.putString("type", "downloaded")
          }
          else -> {
            throw IllegalArgumentException("Invalid type")
          }
      }
      sharedPrefEditor.putBoolean("enabled", true)
      sharedPrefEditor.putLong("timestamp", Date().time)
      sharedPrefEditor.putString("iconUri", iconUri)
      sharedPrefEditor.apply()

      // Run daily starting now
      JobHandler.performJob(context)

      // Schedule for next run
      Utils.scheduleService(context)
    }

    // Unregister for the daily wallpaper service
    Function("unregisterService") {
      val sharedPreferences = PreferenceManager.getDefaultSharedPreferences(context)
      sharedPreferences.edit().putBoolean("enabled", false).apply()
      // Cancel the job scheduler
      val jobScheduler = context.getSystemService(JobScheduler::class.java)
      jobScheduler.cancel(Utils.JOB_ID)
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
      Prop("name") { view: DailyWallpaperView, prop: String ->
        println(prop)
      }
    }
  }
}
