package com.recdel.statusreader

import android.content.ContentValues
import android.content.Context
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import java.io.File
import java.io.FileOutputStream

private const val RECOVERED_MEDIA_SUBDIR = "Recovered Media"

/**
 * Copies a status file (identified by its live SAF content URI) into the
 * device's shared Downloads/Recovered Media folder, gallery-visible via
 * MediaStore on Android 10+ (Section 4.1).
 */
object MediaStoreSaver {
  fun save(context: Context, sourceUri: Uri, fileName: String, mediaType: String): Uri {
    val mimeType = if (mediaType == "video") "video/mp4" else "image/jpeg"

    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      saveViaMediaStore(context, sourceUri, fileName, mediaType, mimeType)
    } else {
      saveViaLegacyFile(context, sourceUri, fileName)
    }
  }

  private fun saveViaMediaStore(context: Context, sourceUri: Uri, fileName: String, mediaType: String, mimeType: String): Uri {
    val collection =
      if (mediaType == "video") MediaStore.Video.Media.EXTERNAL_CONTENT_URI else MediaStore.Images.Media.EXTERNAL_CONTENT_URI

    val relativePath = "${Environment.DIRECTORY_DOWNLOAD}/$RECOVERED_MEDIA_SUBDIR"
    val values =
      ContentValues().apply {
        put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
        put(MediaStore.MediaColumns.MIME_TYPE, mimeType)
        put(MediaStore.MediaColumns.RELATIVE_PATH, relativePath)
      }

    val destinationUri =
      context.contentResolver.insert(collection, values) ?: throw IllegalStateException("Unable to create MediaStore entry for $fileName")

    context.contentResolver.openInputStream(sourceUri).use { input ->
      context.contentResolver.openOutputStream(destinationUri).use { output ->
        if (input == null || output == null) throw IllegalStateException("Unable to open stream for $fileName")
        input.copyTo(output)
      }
    }

    return destinationUri
  }

  private fun saveViaLegacyFile(context: Context, sourceUri: Uri, fileName: String): Uri {
    val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
    val targetDir = File(downloadsDir, RECOVERED_MEDIA_SUBDIR)
    if (!targetDir.exists()) targetDir.mkdirs()

    val targetFile = File(targetDir, fileName)
    context.contentResolver.openInputStream(sourceUri).use { input ->
      FileOutputStream(targetFile).use { output ->
        if (input == null) throw IllegalStateException("Unable to open stream for $fileName")
        input.copyTo(output)
      }
    }

    // Make the file visible to the gallery/other apps immediately.
    android.media.MediaScannerConnection.scanFile(context, arrayOf(targetFile.absolutePath), null, null)

    return Uri.fromFile(targetFile)
  }
}
