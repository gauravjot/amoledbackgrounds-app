package com.nzran.dailywallpaper

import android.annotation.SuppressLint
import android.app.job.JobParameters
import android.app.job.JobService
import android.content.Context
import android.os.StrictMode
import android.os.StrictMode.ThreadPolicy
import androidx.preference.PreferenceManager
import androidx.work.OneTimeWorkRequest
import androidx.work.WorkManager

@SuppressLint("SpecifyJobSchedulerIdRange")
class JobHandler: JobService() {

    override fun onCreate() {
        super.onCreate()
        val policy = ThreadPolicy.Builder().permitAll().build()
        StrictMode.setThreadPolicy(policy)
    }

    override fun onStartJob(params: JobParameters?): Boolean {
        val sharedPrefs = PreferenceManager.getDefaultSharedPreferences(this);
        if (sharedPrefs.getBoolean("enabled", false)) {
            performJob(this)
        }
        return false
    }

    override fun onStopJob(params: JobParameters?): Boolean {
        return false
    }

    companion object {
        fun performJob(context: Context) {
            val workManager = WorkManager.getInstance(context)
            val workRequest = OneTimeWorkRequest.Builder(BackgroundWorker::class.java).build()
            workManager.enqueue(workRequest)
        }
    }
}