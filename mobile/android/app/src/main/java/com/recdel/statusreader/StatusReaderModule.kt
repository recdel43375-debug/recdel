package com.recdel.statusreader

import android.app.Activity
import android.content.Intent
import androidx.documentfile.provider.DocumentFile
import com.facebook.react.bridge.*

private const val REQUEST_CODE_OPEN_TREE = 9021

/**
 * SAF-based reader/writer for WhatsApp's live Status media cache (Section 4.1).
 * On Android 11+, the app never gets direct filesystem access to
 * Android/media/com.whatsapp/... — the user must grant a persisted SAF tree
 * URI once via ACTION_OPEN_DOCUMENT_TREE, hinted at that folder.
 */
class StatusReaderModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext), ActivityEventListener {

  private var pendingFolderPromise: Promise? = null

  init {
    reactContext.addActivityEventListener(this)
  }

  override fun getName() = "StatusReaderModule"

  @ReactMethod
  fun requestFolderAccess(promise: Promise) {
    val activity = currentActivity
    if (activity == null) {
      promise.reject("NO_ACTIVITY", "No current activity to launch the folder picker from")
      return
    }

    pendingFolderPromise = promise
    val intent =
      Intent(Intent.ACTION_OPEN_DOCUMENT_TREE).apply {
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION)
        putExtra(
          "android.provider.extra.INITIAL_URI",
          android.provider.DocumentsContract.buildDocumentUri(
            "com.android.externalstorage.documents",
            "primary:Android/media/com.whatsapp/WhatsApp/Media/.Statuses",
          ),
        )
      }
    activity.startActivityForResult(intent, REQUEST_CODE_OPEN_TREE)
  }

  override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
    if (requestCode != REQUEST_CODE_OPEN_TREE) return
    val promise = pendingFolderPromise
    pendingFolderPromise = null

    if (resultCode != Activity.RESULT_OK || data?.data == null) {
      promise?.resolve(false)
      return
    }

    val treeUri = data.data!!
    reactContext.contentResolver.takePersistableUriPermission(
      treeUri,
      Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION,
    )
    StatusFolderPrefs.setTreeUri(reactContext, treeUri.toString())
    promise?.resolve(true)
  }

  override fun onNewIntent(intent: Intent?) = Unit

  @ReactMethod
  fun hasFolderAccess(promise: Promise) {
    val storedUri = StatusFolderPrefs.getTreeUri(reactContext)
    if (storedUri == null) {
      promise.resolve(false)
      return
    }
    val stillGranted =
      reactContext.contentResolver.persistedUriPermissions.any { it.uri.toString() == storedUri && it.isReadPermission }
    promise.resolve(stillGranted)
  }

  @ReactMethod
  fun listStatusFiles(packageName: String, promise: Promise) {
    val storedUri = StatusFolderPrefs.getTreeUri(reactContext)
    if (storedUri == null) {
      promise.resolve(Arguments.createArray())
      return
    }

    val treeDoc = DocumentFile.fromTreeUri(reactContext, android.net.Uri.parse(storedUri))
    if (treeDoc == null || !treeDoc.isDirectory) {
      promise.resolve(Arguments.createArray())
      return
    }

    val result = Arguments.createArray()
    for (file in treeDoc.listFiles()) {
      if (!file.isFile) continue
      val mediaType = mediaTypeFor(file.name)
      if (mediaType == null) continue // ignore .nomedia, thumbs, non-media cache entries

      val entry = Arguments.createMap()
      // A hash/size/mtime composite stands in for a full content hash — cheap
      // to compute and stable enough to diff/dedupe against the saved index.
      entry.putString("id", "${file.name}_${file.length()}_${file.lastModified()}")
      entry.putString("uri", file.uri.toString())
      entry.putString("fileName", file.name ?: "status")
      entry.putString("mediaType", mediaType)
      entry.putDouble("mtime", file.lastModified().toDouble())
      entry.putDouble("sizeBytes", file.length().toDouble())
      result.pushMap(entry)
    }

    promise.resolve(result)
  }

  @ReactMethod
  fun saveStatusFile(sourceUri: String, fileName: String, mediaType: String, promise: Promise) {
    try {
      val savedUri = MediaStoreSaver.save(reactContext, android.net.Uri.parse(sourceUri), fileName, mediaType)
      promise.resolve(savedUri.toString())
    } catch (error: Exception) {
      promise.reject("SAVE_FAILED", error.message, error)
    }
  }

  private fun mediaTypeFor(fileName: String?): String? {
    val lower = fileName?.lowercase() ?: return null
    return when {
      lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png") || lower.endsWith(".webp") -> "image"
      lower.endsWith(".mp4") || lower.endsWith(".mov") || lower.endsWith(".mkv") || lower.endsWith(".3gp") -> "video"
      else -> null
    }
  }
}
