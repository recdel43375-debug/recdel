package com.recdel.installedapps

import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import com.facebook.react.bridge.*
import java.io.File
import java.io.FileOutputStream

/**
 * Enumerates installed apps via PackageManager for the Choose App grid
 * (Section 3.5). RecDel itself is included by the caller matching the
 * requirement to self-list; here we simply expose every launchable app.
 */
class InstalledAppsModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "InstalledAppsModule"

  @ReactMethod
  fun listInstalledApps(promise: Promise) {
    try {
      val pm = reactContext.packageManager
      val launchables = pm.getInstalledApplications(PackageManager.GET_META_DATA)

      val result = Arguments.createArray()
      for (appInfo: ApplicationInfo in launchables) {
        // Skip apps with no launcher entry point — matches what a user
        // would recognize from their home screen / app drawer.
        val launchIntent = pm.getLaunchIntentForPackage(appInfo.packageName) ?: continue

        val entry = Arguments.createMap()
        entry.putString("packageName", appInfo.packageName)
        entry.putString("displayName", pm.getApplicationLabel(appInfo).toString())
        val iconUri = cacheIcon(appInfo)
        if (iconUri != null) entry.putString("iconUri", iconUri)
        result.pushMap(entry)
      }

      promise.resolve(result)
    } catch (error: Exception) {
      promise.reject("LIST_APPS_FAILED", error.message, error)
    }
  }

  private fun cacheIcon(appInfo: ApplicationInfo): String? {
    return try {
      val pm = reactContext.packageManager
      val iconDir = File(reactContext.cacheDir, "app_icons").apply { if (!exists()) mkdirs() }
      val iconFile = File(iconDir, "${appInfo.packageName}.png")

      if (!iconFile.exists()) {
        val drawable = pm.getApplicationIcon(appInfo)
        val bitmap = drawableToBitmap(drawable)
        FileOutputStream(iconFile).use { out -> bitmap.compress(Bitmap.CompressFormat.PNG, 90, out) }
      }

      "file://${iconFile.absolutePath}"
    } catch (error: Exception) {
      null
    }
  }

  private fun drawableToBitmap(drawable: Drawable): Bitmap {
    if (drawable is BitmapDrawable) return drawable.bitmap

    val width = if (drawable.intrinsicWidth > 0) drawable.intrinsicWidth else 96
    val height = if (drawable.intrinsicHeight > 0) drawable.intrinsicHeight else 96
    val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bitmap)
    drawable.setBounds(0, 0, canvas.width, canvas.height)
    drawable.draw(canvas)
    return bitmap
  }
}
