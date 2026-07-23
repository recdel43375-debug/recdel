package com.recdel.foreground

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.SystemClock

private const val REQUEST_CODE = 9101
private const val INTERVAL_MS = 15 * 60 * 1000L // matches remote-flags.json statusPollIntervalMinutes default

/**
 * Schedules a periodic wake-up so the status folder gets re-checked even if
 * the foreground service is killed by an OEM battery optimizer (Section
 * 3.4). Falls back to an inexact repeating alarm when exact-alarm
 * permission hasn't been granted, rather than failing silently.
 */
object StatusPollScheduler {
  private fun pendingIntent(context: Context): PendingIntent {
    val intent = Intent(context, StatusPollAlarmReceiver::class.java)
    return PendingIntent.getBroadcast(context, REQUEST_CODE, intent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
  }

  fun scheduleRepeating(context: Context) {
    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    val triggerAt = SystemClock.elapsedRealtime() + INTERVAL_MS
    val pending = pendingIntent(context)

    val canScheduleExact = Build.VERSION.SDK_INT < Build.VERSION_CODES.S || alarmManager.canScheduleExactAlarms()
    if (canScheduleExact) {
      alarmManager.setExactAndAllowWhileIdle(AlarmManager.ELAPSED_REALTIME_WAKEUP, triggerAt, pending)
    } else {
      alarmManager.setInexactRepeating(AlarmManager.ELAPSED_REALTIME_WAKEUP, triggerAt, INTERVAL_MS, pending)
    }
  }

  fun cancel(context: Context) {
    val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    alarmManager.cancel(pendingIntent(context))
  }
}
