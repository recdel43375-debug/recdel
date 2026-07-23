package com.recdel.statusreader

import android.content.Context

/**
 * Persists the SAF tree URI the user granted for the WhatsApp Status media
 * folder (Section 4.1: "persist the granted URI via takePersistableUriPermission").
 */
object StatusFolderPrefs {
  private const val PREFS_NAME = "recdel_status_folder"
  private const val KEY_TREE_URI = "tree_uri"

  fun getTreeUri(context: Context): String? =
    context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).getString(KEY_TREE_URI, null)

  fun setTreeUri(context: Context, uri: String?) {
    context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit().putString(KEY_TREE_URI, uri).apply()
  }
}
