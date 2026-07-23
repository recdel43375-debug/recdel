package com.recdel.foreground

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * Fired by AlarmManager on the schedule set up in StatusPollScheduler.
 * The actual status-folder diff/copy work happens JS-side when the user
 * opens the app (Section 4.1); this receiver's job is just to nudge the
 * foreground service back to life and re-arm the next alarm, so status
 * monitoring survives even if the process was killed in between.
 */
class StatusPollAlarmReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    ForegroundServiceController.start(context)
    StatusPollScheduler.scheduleRepeating(context)
  }
}
