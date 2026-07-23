package com.recdel.notification

import android.content.Context

/**
 * Persisted set of package names the user selected in Choose App (Section
 * 3.5), shared between the JS bridge (writer) and the always-running
 * NotificationListenerService (reader) — the service process may outlive
 * the RN JS instance, so this can't just live in memory.
 */
object MonitoredPackagesStore {
  private const val PREFS_NAME = "recdel_monitored_packages"
  private const val KEY_PACKAGES = "packages"

  fun getPackages(context: Context): Set<String> =
    context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).getStringSet(KEY_PACKAGES, emptySet()) ?: emptySet()

  fun setPackages(context: Context, packages: Set<String>) {
    context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit().putStringSet(KEY_PACKAGES, packages).apply()
  }
}
