package com.nzran.errorlogger

import android.os.Build
import android.util.Log
import androidx.preference.PreferenceManager
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class BackgroundWorker(context: Context, workerParams: WorkerParameters) :
CoroutineWorker(context, workerParams) {

  override suspend fun doWork(): Result {
  }
}