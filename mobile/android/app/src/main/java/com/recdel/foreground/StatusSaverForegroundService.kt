package com.recdel.foreground

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.recdel.MainActivity
import com.recdel.R

private const val CHANNEL_ID = "recdel_status_saver"
private const val NOTIFICATION_ID = 1001

/**
 * Persistent "Status Saver / Watching for new Statuses" foreground service
 * (Section 3.13) — required both by Android's foreground-service rules and
 * as an honest disclosure that background capture is running. Its second
 * job is to keep the process alive so the bound NotificationListenerService
 * survives OEM background-kill more reliably.
 */
class StatusSaverForegroundService : Service() {

  companion object {
    @Volatile var isRunning: Boolean = false
      private set
  }

  override fun onCreate() {
    super.onCreate()
    isRunning = true
    createChannelIfNeeded()
    startForeground(NOTIFICATION_ID, buildNotification())
    StatusPollScheduler.scheduleRepeating(applicationContext)
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int = START_STICKY

  override fun onDestroy() {
    isRunning = false
    StatusPollScheduler.cancel(applicationContext)
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null

  private fun createChannelIfNeeded() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val manager = getSystemService(NotificationManager::class.java)
      val existing = manager.getNotificationChannel(CHANNEL_ID)
      if (existing == null) {
        val channel =
          NotificationChannel(CHANNEL_ID, "Status Saver", NotificationManager.IMPORTANCE_MIN).apply {
            description = "Shows while RecDel is watching for new WhatsApp statuses and messages."
          }
        manager.createNotificationChannel(channel)
      }
    }
  }

  private fun buildNotification(): Notification {
    val contentIntent =
      PendingIntent.getActivity(
        this,
        0,
        Intent(this, MainActivity::class.java),
        PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
      )

    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("Status Saver")
      .setContentText("Watching for new Statuses")
      .setSmallIcon(R.mipmap.ic_launcher)
      .setOngoing(true)
      .setPriority(NotificationCompat.PRIORITY_MIN)
      .setContentIntent(contentIntent)
      .build()
  }
}

/** Starts/stops the foreground service from outside (native or JS bridge). */
object ForegroundServiceController {
  fun start(context: Context) {
    val intent = Intent(context, StatusSaverForegroundService::class.java)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      context.startForegroundService(intent)
    } else {
      context.startService(intent)
    }
  }

  fun stop(context: Context) {
    context.stopService(Intent(context, StatusSaverForegroundService::class.java))
  }

  fun restart(context: Context) {
    stop(context)
    start(context)
  }
}
