package com.recdel.notification

import android.content.Context
import org.json.JSONObject
import java.io.File
import java.util.UUID

/**
 * Writes captured notifications straight to the same append-only JSONL
 * files (and JSON conversation index) that the JS layer reads via
 * react-native-fs (see notificationCaptureStore.ts). This is the primary
 * persistence path: it must not depend on the RN/JS instance being alive,
 * since NotificationListenerService keeps running long after the app UI
 * is backgrounded or killed by an OEM battery manager.
 *
 * `RNFS.DocumentDirectoryPath` on Android resolves to `context.filesDir`,
 * so writing there directly keeps both runtimes reading/writing the exact
 * same files without any IPC.
 */
object ConversationLogWriter {
  private const val CONVERSATIONS_SUBDIR = "conversations"
  private const val INDEX_FILE_NAME = "conversation_index.json"

  fun sanitizeContactId(contactId: String): String = contactId.replace(Regex("[^A-Za-z0-9_-]"), "_")

  @Synchronized
  fun appendMessage(
    context: Context,
    contactId: String,
    packageName: String,
    contactName: String,
    avatarUri: String?,
    message: JSONObject,
    previewText: String,
    capturedAt: Long,
  ) {
    val conversationsDir = File(context.filesDir, CONVERSATIONS_SUBDIR).apply { if (!exists()) mkdirs() }
    val logFile = File(conversationsDir, "${sanitizeContactId(contactId)}.jsonl")
    logFile.appendText(message.toString() + "\n")

    updateIndex(context, contactId, packageName, contactName, avatarUri, previewText, capturedAt)
  }

  fun newMessageId(contactId: String, capturedAt: Long): String = "$contactId-$capturedAt-${UUID.randomUUID().toString().take(8)}"

  private fun updateIndex(
    context: Context,
    contactId: String,
    packageName: String,
    contactName: String,
    avatarUri: String?,
    previewText: String,
    capturedAt: Long,
  ) {
    val indexFile = File(context.filesDir, INDEX_FILE_NAME)
    val index = if (indexFile.exists()) JSONObject(indexFile.readText()) else JSONObject()

    val entry =
      JSONObject().apply {
        put("contactId", contactId)
        put("packageName", packageName)
        put("contactName", contactName)
        if (avatarUri != null) put("avatarUri", avatarUri)
        put("lastMessageAt", capturedAt)
        put("lastMessagePreview", previewText)
      }
    index.put(contactId, entry)
    indexFile.writeText(index.toString())
  }
}
