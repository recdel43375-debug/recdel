package com.recdel.notification

import android.app.Notification
import android.content.Context
import android.graphics.Bitmap
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Icon
import android.os.Build
import android.service.notification.StatusBarNotification
import androidx.core.os.BundleCompat

data class ParsedNotification(
  val type: String, // "text" | "emoji" | "reaction" | "media" | "voice"
  val contactName: String,
  val text: String? = null,
  val reactionEmoji: String? = null,
  val quotedSnippet: String? = null,
  val thumbnail: Bitmap? = null,
)

// Best-effort heuristics for classifying WhatsApp-style notifications
// (Section 4.2). WhatsApp does not publish a stable notification-content
// contract, so these patterns may need tuning against real device output;
// unmatched notifications safely fall back to a plain "text" record rather
// than being dropped.
private val REACTION_PATTERN = Regex("""^(\S+)\s+to\s+["“](.+)["”]$""")
private val VOICE_PATTERN = Regex("""voice message""", RegexOption.IGNORE_CASE)
private val EMOJI_ONLY_PATTERN = Regex("""^[\p{So}\p{Cn}\p{Sk}\s‍️]+$""")

object NotificationParser {
  fun parse(context: Context, sbn: StatusBarNotification): ParsedNotification {
    val extras = sbn.notification.extras
    val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString()?.trim().orEmpty()
    val bigText = extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString()
    val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString()
    val content = (bigText ?: text ?: "").trim()

    val contactName = title.ifEmpty { sbn.packageName }
    val thumbnail = extractThumbnail(context, sbn.notification)

    if (thumbnail != null) {
      return ParsedNotification(type = "media", contactName = contactName, text = content.ifEmpty { null }, thumbnail = thumbnail)
    }

    if (VOICE_PATTERN.containsMatchIn(content)) {
      return ParsedNotification(type = "voice", contactName = contactName)
    }

    val reactionMatch = REACTION_PATTERN.find(content)
    if (reactionMatch != null) {
      val (emoji, quoted) = reactionMatch.destructured
      return ParsedNotification(type = "reaction", contactName = contactName, reactionEmoji = emoji, quotedSnippet = quoted)
    }

    if (content.isNotEmpty() && EMOJI_ONLY_PATTERN.matches(content)) {
      return ParsedNotification(type = "emoji", contactName = contactName, text = content)
    }

    return ParsedNotification(type = "text", contactName = contactName, text = content)
  }

  private fun extractThumbnail(context: Context, notification: Notification): Bitmap? {
    val extras = notification.extras

    val legacyPicture = BundleCompat.getParcelable(extras, Notification.EXTRA_PICTURE, Bitmap::class.java)
    if (legacyPicture != null) return legacyPicture

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      val icon = BundleCompat.getParcelable(extras, Notification.EXTRA_PICTURE_ICON, Icon::class.java)
      val drawable = icon?.loadDrawable(context)
      if (drawable is BitmapDrawable) return drawable.bitmap
    }

    return null
  }
}
