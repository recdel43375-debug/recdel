package com.recdel.notification

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import com.facebook.react.bridge.Arguments
import org.json.JSONObject

/**
 * The system routes all device notifications here once the user grants
 * Notification Access (Section 4.2). Captures are filtered to only the
 * package names the user selected in Choose App, classified, and persisted
 * directly to the append-only per-conversation log — this service never
 * removes anything from its own log, so a later "This message was deleted"
 * in the live app doesn't affect what RecDel already captured.
 *
 * Persistence happens here (native), not in JS, because this service can
 * keep running long after the RN JS instance has been torn down.
 */
class RecDelNotificationListenerService : NotificationListenerService() {

  override fun onNotificationPosted(sbn: StatusBarNotification) {
    val monitored = MonitoredPackagesStore.getPackages(applicationContext)
    if (sbn.packageName !in monitored) return

    // Ongoing/foreground-service notifications (e.g. our own "Watching for
    // new Statuses" row, or WhatsApp's own persistent connection notice)
    // aren't user messages — skip them.
    if (sbn.notification.flags and Notification.FLAG_ONGOING_EVENT != 0) return

    val parsed = NotificationParser.parse(applicationContext, sbn)
    val contactId = resolveContactId(sbn, parsed.contactName)
    val capturedAt = sbn.postTime

    var thumbnailUri: String? = null
    val thumbnail = parsed.thumbnail
    if (thumbnail != null) {
      thumbnailUri = ThumbnailCache.save(applicationContext, thumbnail, "$contactId-$capturedAt")?.toString()
    }

    val messageId = ConversationLogWriter.newMessageId(contactId, capturedAt)
    val messageJson =
      JSONObject().apply {
        put("id", messageId)
        put("contactId", contactId)
        put("type", parsed.type)
        put("capturedAt", capturedAt)
        parsed.text?.let { put("text", it) }
        parsed.reactionEmoji?.let { put("reactionEmoji", it) }
        parsed.quotedSnippet?.let { put("quotedSnippet", it) }
        thumbnailUri?.let { put("thumbnailUri", it) }
      }

    ConversationLogWriter.appendMessage(
      context = applicationContext,
      contactId = contactId,
      packageName = sbn.packageName,
      contactName = parsed.contactName,
      avatarUri = null,
      message = messageJson,
      previewText = previewFor(parsed),
      capturedAt = capturedAt,
    )

    val payload =
      Arguments.createMap().apply {
        putString("packageName", sbn.packageName)
        putString("contactId", contactId)
        putString("contactName", parsed.contactName)
        putString("type", parsed.type)
        putDouble("capturedAt", capturedAt.toDouble())
        parsed.text?.let { putString("text", it) }
        parsed.reactionEmoji?.let { putString("reactionEmoji", it) }
        parsed.quotedSnippet?.let { putString("quotedSnippet", it) }
        thumbnailUri?.let { putString("thumbnailUri", it) }
      }
    NotificationEventBridge.emitCaptured(payload)
  }

  private fun previewFor(parsed: ParsedNotification): String =
    when (parsed.type) {
      "text", "emoji" -> parsed.text.orEmpty()
      "reaction" -> "Reacted ${parsed.reactionEmoji} to \"${parsed.quotedSnippet}\""
      "media" -> parsed.text ?: "Sent media"
      "voice" -> "Voice message received"
      else -> ""
    }

  /** Prefers WhatsApp's own conversation shortcut/group key so all notifications from one thread collapse to one contact. */
  private fun resolveContactId(sbn: StatusBarNotification, fallbackName: String): String {
    val shortcutId = sbn.notification.shortcutId
    if (!shortcutId.isNullOrBlank()) return shortcutId

    val group = sbn.notification.group
    if (!group.isNullOrBlank()) return group

    return fallbackName.trim().lowercase().replace(Regex("\\s+"), "_").ifEmpty { sbn.packageName }
  }
}
