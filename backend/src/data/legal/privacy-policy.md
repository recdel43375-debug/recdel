# Privacy Policy

_Last updated: 2026-08-24_

Reshow ("the App") is a local-only Android utility. This policy explains what
the App does and does not do with your data.

## What Reshow does

- Reads WhatsApp's public Status media cache folder (while a status is still
  live) so you can preview and save it to your own device gallery.
- Listens to system notifications, **only for apps you explicitly select**,
  to keep a local copy of notification content (text/media previews) so it
  remains viewable if the sender later deletes the original message.

## What Reshow does not do

- Reshow does **not** upload, transmit, or store any message content, media,
  contact names, or notification data on any server. Everything stays on
  your device, in the App's local storage.
- Reshow does **not** read WhatsApp's (or any app's) encrypted database. It
  only ever replays notification content that has already been delivered to
  your device by the operating system.
- Reshow cannot and does not capture messages **you** send — Android does
  not generate a notification for the device owner's own outgoing messages,
  so only the other party's messages/reactions can ever be recovered.
- Reshow does not recover messages deleted **before** you granted
  Notification Access, and does not recover status posts that expired or
  were deleted before the App had a chance to read them while live.

## Data this App may send to our servers

The only network calls the App makes are to a stateless configuration API
that returns non-personal data: current app version (for update prompts),
feature flags, the list of apps Reshow has special integrations for, and
this legal text. The App also sends anonymous, non-identifying event
counters (e.g. "app_opened") so we can see aggregate usage patterns —
never message content, filenames, or contact identifiers, and never
anything that identifies you individually.

## Permissions

- **Notification Access** — required to capture notification content for
  apps you select. You can revoke this at any time from Settings.
- **Storage / SAF folder access** — required to read WhatsApp's Status
  folder and to save recovered media into your device's Download folder.
- **Exact Alarm** — used only to keep background status-checking reliable.

## Your control

You may revoke any permission, and delete captured data at any time, by
clearing app storage or uninstalling the App.

## Contact

For privacy questions, contact the developer through the Play Store listing.
