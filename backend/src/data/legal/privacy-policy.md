# Privacy Policy

_Last updated: 2026-07-24_

RecDel ("the App") is a local-only Android utility. This policy explains what
the App does and does not do with your data.

## What RecDel does

- Reads WhatsApp's public Status media cache folder (while a status is still
  live) so you can preview and save it to your own device gallery.
- Listens to system notifications, **only for apps you explicitly select**,
  to keep a local copy of notification content (text/media previews) so it
  remains viewable if the sender later deletes the original message.

## What RecDel does not do

- RecDel does **not** upload, transmit, or store any message content, media,
  contact names, or notification data on any server. Everything stays on
  your device, in the App's local storage.
- RecDel does **not** read WhatsApp's (or any app's) encrypted database. It
  only ever replays notification content that has already been delivered to
  your device by the operating system.
- RecDel cannot and does not capture messages **you** send — Android does
  not generate a notification for the device owner's own outgoing messages,
  so only the other party's messages/reactions can ever be recovered.
- RecDel does not recover messages deleted **before** you granted
  Notification Access, and does not recover status posts that expired or
  were deleted before the App had a chance to read them while live.

## Data this App may send to our servers

The only network calls the App makes are to a stateless configuration API
that returns non-personal data: current app version (for update prompts),
feature flags, the list of apps RecDel has special integrations for, and
this legal text. If anonymous usage telemetry is enabled in Settings, only
non-identifying event counters (e.g. "app_opened") are sent — never message
content, filenames, or contact identifiers — and it can be disabled at any
time.

## Permissions

- **Notification Access** — required to capture notification content for
  apps you select. You can revoke this at any time from Settings.
- **Storage / SAF folder access** — required to read WhatsApp's Status
  folder and to save recovered media into your device's Download folder.
- **Exact Alarm** — used only to keep background status-checking reliable.

## Your control

You may revoke any permission, delete captured data (by clearing app
storage or uninstalling), and disable anonymous telemetry at any time from
the Settings screen.

## Contact

For privacy questions, contact the developer through the Play Store listing.
