package com.recdel.notification

import android.content.Context
import android.graphics.Bitmap
import android.net.Uri
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream

/** Persists a notification-extras thumbnail bitmap so it survives after the StatusBarNotification is gone. */
object ThumbnailCache {
  private const val SUBDIR = "notification_thumbnails"

  fun save(context: Context, bitmap: Bitmap, keyHint: String): Uri? {
    return try {
      val dir = File(context.filesDir, SUBDIR).apply { if (!exists()) mkdirs() }
      val file = File(dir, "$keyHint.jpg")
      FileOutputStream(file).use { out -> bitmap.compress(Bitmap.CompressFormat.JPEG, 85, out) }
      FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
    } catch (error: Exception) {
      null
    }
  }
}
