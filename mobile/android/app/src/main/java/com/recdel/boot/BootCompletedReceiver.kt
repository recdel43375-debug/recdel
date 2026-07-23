package com.recdel.boot

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.recdel.foreground.ForegroundServiceController
import com.recdel.notification.MonitoredPackagesStore

/** Restarts monitoring after a device reboot (Section 6), if the user has apps configured. */
class BootCompletedReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != Intent.ACTION_BOOT_COMPLETED) return
    if (MonitoredPackagesStore.getPackages(context).isEmpty()) return
    ForegroundServiceController.start(context)
  }
}
