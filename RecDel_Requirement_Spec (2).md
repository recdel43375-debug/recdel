# RecDel — Product & Technical Requirement Specification (v2 — Extended)
*(Clone reference: "Undel Recover Deleted Messages" — Android status-saver / notification-capture utility)*

---

## 1. Product Summary

RecDel is an **Android-only utility app** (WhatsApp/social-app "status saver" + "notification-based deleted message capture" tool). It does **not** actually recover anything from WhatsApp's own database — it works by:

1. **Reading WhatsApp's public Status media cache folder** (`.Statuses`) while a status is still live (before the poster deletes it), letting the user preview and download it to their own gallery.
2. **Listening to system notifications** via `NotificationListenerService` for selected apps, caching the notification text/media the moment it arrives — so if the sender later deletes the message from the chat (WhatsApp replaces it with its own **"This message was deleted"** placeholder, confirmed in the reference screenshots), RecDel still has the earlier-captured copy and can display it in a **reconstructed conversation view**.

There is **no server-side storage of user content** — everything lives in local device storage (filesystem + on-device key/value store). Everything below is architected around that constraint.

> ⚠️ **Play Store compliance note** (must be resolved before launch): apps requesting `NotificationListenerService` must complete Google's **Sensitive Notification Content access** declaration form, publish a compliant Privacy Policy, and clearly disclose local-only storage. Marketing copy must avoid implying the app reads WhatsApp's encrypted database — it only ever replays notifications that already reached the device. Several apps in this category have been removed from Play for overstating this claim; keep in-app and store-listing copy aligned with the disclaimer screen (Section 3.1).
>
> ⚠️ **Important functional limitation to design around** (confirmed by the reference screenshots — see Section 3.9): `NotificationListenerService` only ever receives notifications for **messages/reactions the device receives from other people**. WhatsApp does **not** generate a system notification for messages the phone's own user sends. Therefore the "recovered conversation" view is inherently **one-sided** — it can only ever reconstruct the *other party's* deleted messages/reactions/voice notes, never the user's own outgoing messages. This must be reflected in the UI copy (e.g. no fabricated "sent" bubbles) and called out in onboarding/disclaimer text to avoid misleading users.

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Mobile app | **React Native** (bare workflow, not Expo managed — required for native modules below) | Android-first; iOS has no equivalent APIs — ship Android-only, or an iOS stub with "not supported on iOS" messaging |
| Native modules | Custom Kotlin/Java native modules | `NotificationListenerService`, Storage Access Framework (SAF) folder picker, exact-alarm scheduling, foreground service, `PackageManager` bridge for installed-app enumeration |
| Backend | **Node.js + Express** | No database. Stateless REST API only for: remote config/feature flags, forced-update version check, "known app" metadata for the Choose App grid, legal text delivery, optional anonymous usage counters |
| Local persistence | **MMKV** (or `AsyncStorage`) for settings/metadata + a **JSON index per monitored conversation** for captured notifications; **device filesystem** (`react-native-fs`) for actual media files | No SQLite/Realm required — no relational queries are needed, just per-conversation append logs and per-status-folder diff indexes |
| Media playback | `react-native-video` | Needed for both the WhatsApp Videos-tab preview and the dedicated full-screen video player (Section 3.6.2) |
| i18n | `react-i18next` (or equivalent) | Confirmed languages in source: English (default), Bengali; UI text elsewhere mixes Urdu — architect for easy locale addition |

---

## 3. Screen-by-Screen Specification

### 3.1 Splash / Disclaimer Screen
- Full-screen green background, app icon (trash-can-with-refresh-arrows, "2026" ribbon badge), app name title.
- Scrollable card with legal disclaimer copy, must state (verbatim intent):
  - App works independently of WhatsApp; all data stored **locally**, nothing collected/shared.
  - "Deleted Message Recovery" only works via Notification Listener permission, and **only for messages received after the permission is enabled** — pre-install deletions are not recoverable.
  - **Only messages/media the other person sent can ever be recovered** — the app cannot capture or reconstruct the current user's own sent messages (see Section 3.9 for why).
  - User is solely responsible for legal use; personal use only; misuse may be subject to legal action.
- Single **Accept** button (full width, rounded, white bg), pinned to bottom.
- Store `hasAcceptedDisclaimer: true` locally; skip on subsequent launches.

### 3.2 Onboarding Carousel — 3 slides
- Top-right **Skip** link on every slide.
- Illustration centered, differs per slide:
  1. "Recover Deleted Messages" — chat bubble illustration, subtitle "Accidentally deleted? Get your messages back in seconds!"
  2. "Restore Deleted Images" — phone gallery grid illustration, subtitle "Restore every memory, every moment, every photo."
  3. "Restore Deleted Videos" — illustration of person + settings/play icons, subtitle "Get your important videos back — fast and easy."
- Pagination dots (3 total, active dot filled green).
- Bottom row: **Previous** (hidden/disabled on slide 1) and **Next**; slide 3 shows **Finish**.
- On Finish/Skip → Home screen, set `hasSeenOnboarding: true`.

### 3.3 Home Screen ("Notification" tab, default landing tab)
- Header bar (dark green): app name, **crown icon** (opens Premium/paywall stub), **"+" icon** (shortcut to Add App).
- Row 1 — app tiles: **Add App** tile (dashed outline circle + "+", always first) followed by one tile per monitored app the user has added (e.g., **WhatsApp**, shown with a small green checkmark badge once actively granted/monitoring — confirmed in later screenshots).
- Row 2 onward — **Captured Notification Feed** (this is the key addition confirmed by the newest screenshots): below the app tiles, the screen streams a reverse-chronological list of things RecDel has captured:
  - **Captured conversation rows**: contact avatar (pulled from the notification's `android.icon`/large icon if available), contact/sender name (e.g. "Homaira"), timestamp of the most recent captured notification (e.g. "11:33 PM"), and a muted preview line showing the last captured message text (e.g. "Ka jor shu").
  - *(Note: reference screenshots also showed in-feed native ad cards and cross-promo banners interleaved in this feed — ads are deferred for now per Section on monetization below, and will be added back into this feed layout in a later update.)*
  - Tapping a conversation row navigates to the **Recovered Message Detail screen** (Section 3.8) for that contact/thread.
- Empty state (no monitored app added yet, or no notifications captured yet for it): centered **"No Chat Found!"**.
- Bottom navigation bar (4 tabs): **Notification | Trash Files | Status | Settings**
  - **Notification** = the feed described above (per-conversation captured-message inbox).
  - **Trash Files** = aggregated media-centric recovery view (deleted/recovered images, videos, voice notes surfaced across all monitored apps) — kept distinct from the text/reaction feed.
  - **Status** = shortcut into the WhatsApp-style live Status Photos/Videos/Saved Status viewer (Section 3.6) — only meaningful once a status-capable app (WhatsApp) is added.
  - **Settings** = Section 3.12 below.
**Permission Required modal** (first Home visit if permissions not granted):
  - Title: "Permission Required"
  - Copy: "Please allow the following permissions to get selected apps notifications and whatsapp statuses."
  - Two checkbox rows: **Folder access Android 11** (SAF grant) and **Notification Access** (NotificationListenerService).
  - **Skip for now** link dismisses without granting.

### 3.4 Exact Alarm Permission Prompt
- After granting notification access, custom dialog: **"Allow Exact Alarm"** — explains this keeps auto-save & status monitoring stable.
- Buttons: **Not now** / **Open Settings** → deep-links to system "Alarms & reminders" page, where the user toggles **"Allow setting alarms and reminders"**.
- Purpose: schedule periodic `WorkManager`/`AlarmManager` jobs to re-check the WhatsApp status folder even if the foreground service is killed by OEM battery optimizers.

### 3.5 Choose App Screen
- Header: back arrow + "Choose App".
- Grid (4 columns) of installed-app icons pulled from the device's actual `PackageManager` app list (WhatsApp, Messages, Instagram, Gmail, ChatGPT, Reddit, JazzCash, etc. — plus RecDel itself, self-listed).
- Each tile: circular icon, app name label, radio-style checkbox; selected tile shows a filled dark-green circle with white checkmark.
- Multi-select supported; selection persisted locally (array of package names).
- Bottom pinned **Done** button commits selection and returns to Home with the newly added app tile(s).

### 3.6 Per-App Status Viewer — "WhatsApp" screen
Reached by tapping the WhatsApp tile on Home. Header: "WhatsApp" title, crown icon, **filter icon** (funnel, top-right — filter by date/type or "not yet saved").

Three tabs: **Photos | Videos | Saved Status**

#### 3.6.1 Photos tab
- 3-column grid of currently-live WhatsApp status images, read directly from WhatsApp's status media folder via the persisted SAF URI.
- Each thumbnail has a circular **download icon overlay**. Tapping it copies the file into `Download/Recovered Media/`, flips the overlay to a **green checkmark**, and shows a **"File saved in gallery"** toast. State persists across app restarts (re-verified against the local saved-index, not re-derived each launch).

#### 3.6.2 Videos tab + Full-Screen Video Player
- Same 3-column grid; each tile shows a **play button overlay** plus the download icon (independent download state per item — confirmed: previously-saved videos keep their green-checkmark state even after navigating away and back).
- Tapping a thumbnail (not the download icon) opens a **dedicated full-screen video player screen**, distinct from the grid:
  - Header bar (green): **back arrow**, a **truncated content-hash/filename** as the title (e.g. `7143093f0bc144ca92d06f45f...` — status videos are cached by WhatsApp under hashed filenames, so the player should show this raw name unless/until a friendlier display name is derivable), a **download icon**, and a **share icon** (native share sheet, share the video file directly to other apps).
  - Video surface fills the screen; original video content (including any burned-in captions/overlay text from the original poster, e.g. "Corrupt Politicians enjoying their life's on public taxes") plays back untouched — RecDel does not transcode or alter status content.
  - Center playback controls overlay: **rewind (◄◄, ~10s skip back)**, **play/pause (toggle icon)**, **fast-forward (►►, ~10s skip forward)**.
  - Bottom scrubber: draggable seek bar with **elapsed time** (left, `00:00`) and **total duration** (right, e.g. `00:04`) labels; green playhead fill.
  - Tapping download icon here performs the same copy-to-gallery action as the grid's overlay icon and should reflect the saved state back on the grid when the user returns.

#### 3.6.3 Saved Status tab
- Shows only files already copied into RecDel's own Recovered Media directory — persists after the original status expires from WhatsApp (24h) or is deleted by the poster, since it now lives in local app storage rather than WhatsApp's ephemeral cache.

### 3.7 Notification Tab — Detailed behavior (see also 3.3)
The **Notification** bottom-tab is the home/landing surface (Section 3.3) doubling as the message-capture inbox. Key implementation notes:
- List is a flat, reverse-chronological feed **per monitored app** (in current scope: WhatsApp), not grouped by contact at the top level — each row already represents "most recent activity for this contact," similar to a normal chat-app inbox.
- Rows update live as new notifications arrive while the foreground service is running (no manual refresh needed).

### 3.8 Recovered Message Detail Screen (per-contact conversation reconstruction)
Reached by tapping a captured-conversation row from the Notification feed (e.g. "Homaira").

- Header: green bar, back arrow, contact avatar, contact name — styled with RecDel's own branding (not a WhatsApp-style dark theme), signaling clearly to the user this is **RecDel's reconstruction**, not the live WhatsApp thread.
- Body: chronological list of **white rounded message cards**, one per captured notification, each showing:
  - The captured content: plain text (e.g. "Do you need help? I'll pay for your therapy"), stand-alone emoji-only messages (e.g. 😂), stand-alone sticker/media notifications (e.g. a knife emoji sent as a message), and **reaction notifications** rendered as their own descriptive card (e.g. `Reacted 😂 to "Che za single yam bal sok ba sanga mingle kegi"` — WhatsApp posts reactions as their own notification event with a quoted snippet of the original message, and RecDel must parse/store/render that distinctly from a plain message).
  - A relative/day timestamp per card (e.g. "Today"), right-aligned under the content.
- **All cards represent messages from the other party only** — per the limitation noted in Section 1, there is no mechanism to capture the device owner's own sent messages, since Android never posts a notification for the local user's own outgoing message. The UI must not imply a two-sided chat replay; it is strictly a log of what the other person sent/reacted with, including anything later deleted.
- This screen is what actually delivers on the "recover deleted messages" pitch: even though the live WhatsApp thread (Section 3.9) now shows **"This message was deleted"** in place of an in-between message, RecDel's log still shows the original captured text/emoji for that same timestamp, because it was captured via notification *before* the sender deleted it.
- Scroll should support loading older captured history in pages (append-log file per contact, paginate by reading in chunks rather than one giant JSON blob).

### 3.9 Reference: Native WhatsApp Chat Screen (for context only, not built by us)
Included in the source screenshots purely to demonstrate the problem RecDel solves — this is WhatsApp's own UI, unmodified:
- Standard WhatsApp dark-theme chat screen (back arrow, avatar, contact name, video-call icon, voice-call icon, overflow menu; green outgoing bubbles / dark incoming bubbles; standard input bar with emoji/attach/camera icons and mic button).
- When a message is deleted by the sender, WhatsApp replaces the original content with a greyed-out, italic placeholder row: **"This message was deleted."**
- RecDel's value proposition is precisely the gap between this screen (what WhatsApp shows *after* deletion) and the Recovered Message Detail screen in Section 3.8 (what RecDel had already captured *before* deletion via the notification).

### 3.10 System Notification Access Screen — *native Android settings, not custom UI*
- Standard Android "Notification read, reply and control" settings page. App deep-links here via `Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS` when the in-app permission card is tapped.
- OS-controlled toggles: Allow notification access (master), Real-time, Conversations, Notifications, Silent, "See all apps."

### 3.11 System "Danger" Warning Dialog — *native OS dialog, not custom UI*
- Standard OS warning when granting NotificationListenerService access: "Read and control notifications is a highly sensitive permission…" listing Read all SMS / Read notifications from instant messengers / Read all notifications.
- Requires checkbox "I'm aware of the possible risks…" before **OK** is tappable; OS enforces a **6-second countdown** on the OK button (`OK (6)`) — this is OS behavior, app only needs to trigger the intent and handle the return/callback.

### 3.12 Settings Screen
Header: "Settings".

**Section 1 — Download Location**: display-only row, default `storage/emulated/0/Download/Recovered Media`.

**Section 2 — Advance Settings**
- **Notification** toggle — notify when new statuses are available.
- **Auto Save** toggle — auto-copy every newly detected status to Recovered Media without a manual tap.
- **Restart Services** (chevron) — manually restart the background listener/foreground service after an OEM battery-kill.
- **Permissions** (chevron) — "We use permissions only to recover statuses and keep notifications working. You can allow them anytime." → re-opens the permission grant flow.
- **Choose Language** (chevron) — current language shown (English default / Bengali confirmed in source); opens language picker.

**Section 3 — General Settings**
- **Remember & Limitations** (chevron) — restates disclaimer/limitations (including the one-sided-recovery caveat from Section 1).
- **Share App** (chevron) — native share sheet with Play Store link.
- **Rate Us** (chevron) — deep-links to Play Store listing.
- **Privacy Policy** / **Terms and Conditions** (chevrons) — open hosted legal text (WebView or external browser).

### 3.13 Persistent Foreground Service Notification
- While monitoring is active, an ongoing notification titled **"Status Saver"** with body **"Watching for new Statuses"** must be shown — required both by Android's foreground-service rules and as an honest disclosure that background capture is running.
- Implement via `startForeground()`; declare `foregroundServiceType` in the manifest (verify current Play-allowed types — `dataSync`/`specialUse` at time of writing, subject to policy changes).

---

## 4. Core Functional Modules

### 4.1 Status Reader Module (WhatsApp Status Scraper)
- **Android 10 and below**: direct file path read of `/storage/emulated/0/WhatsApp/Media/.Statuses/` (`READ_EXTERNAL_STORAGE`).
- **Android 11+ (scoped storage)**: use **Storage Access Framework** — prompt once via `ACTION_OPEN_DOCUMENT_TREE` targeted at `Android/media/com.whatsapp/WhatsApp/Media/.Statuses` (and the WhatsApp Business variant path), persist the granted URI (`takePersistableUriPermission`), and use `DocumentFile` APIs to list/copy files on each check.
- On each poll (app foreground, WorkManager periodic job, or exact alarm), diff folder contents against a locally cached index (filename → hash/size/mtime) to detect new/removed statuses and update the Photos/Videos tabs.
- **Save/download action**: copy bytes from the SAF `DocumentFile` into `Download/Recovered Media/` (via `MediaStore` insert on Android 10+ so it's gallery-visible), and mark the file "saved" in the local index — this drives the checkmark overlay in the grid and populates the Saved Status tab.
- **Full-screen player integration** (Section 3.6.2): the player screen receives a content URI (either the live SAF URI or the already-saved local file URI) and a display title derived from the underlying filename/hash; download and share actions operate on whichever URI is currently backing playback.

### 4.2 Notification Capture Module ("Deleted Message Recovery")
- Native `NotificationListenerService` subclass registered in the manifest; the system routes all device notifications to `onNotificationPosted()`.
- Filter to only the **package names the user selected** in Choose App (e.g. `com.whatsapp`).
- Parse and classify each captured notification into one of:
  - **Plain text message** — sender + `android.text`/`android.bigText` extras + timestamp.
  - **Emoji-only / sticker message** — same pipeline, content is just an emoji/short glyph.
  - **Reaction event** — WhatsApp posts these with a distinct notification shape (reactor emoji + quoted original-message snippet); store as its own record type so the Detail screen (3.8) can render it as `Reacted {emoji} to "{quoted snippet}"` rather than as a normal message bubble.
  - **Media-attached notification** — extract `android.picture`/thumbnail extras where present for image previews; voice-note notifications typically carry only text metadata (no audio payload in the notification itself — cannot be recovered as playable audio, only as a "voice message received" log entry — document this limitation explicitly in Remember & Limitations copy).
- Persist per-contact/thread as an **append-only local log** (e.g. one JSON-lines file per conversation, keyed by contact identifier derived from the notification's conversation/group extras), never a single global blob, so the Detail screen can page through history efficiently.
- Detect the counterpart WhatsApp "message deleted" system event only insofar as it affects what WhatsApp itself displays — RecDel does **not** need to detect deletion explicitly; it simply never removes anything from its own log, so anything that later disappears/turns into "This message was deleted" in the live app remains untouched and viewable in RecDel's Detail screen.
- **Explicitly out of scope**: capturing the device owner's own outgoing messages (no notification is generated for these by the OS/WhatsApp), and recovering deleted **status** posts by contacts beyond whatever was already cached by the Status Reader module while live.
- Respect the **Notification** and **Auto Save** toggles from Settings for whether captured events also raise a local user-visible alert and/or auto-persist thumbnail media.

### 4.3 Trash Files Module
- Aggregated cross-app view (bottom-nav tab) of recovered **media** specifically — deleted/expired status images & videos, and any media thumbnails salvaged from notification extras — kept distinct from the text/reaction feed under the Notification tab.
- List/timeline UI grouped by app + date; each entry shows sender/source, thumbnail, captured timestamp, and an "open/view full" action (reuses the full-screen media viewer from 3.6.2 for video, and a simple zoomable image view for photos).
- Deletion of a Trash Files entry is local-only (no backend call).

### 4.4 Settings/Config Module
- Local key/value store for: language, auto-save flag, notification flag, download path override, permission-granted flags, disclaimer/onboarding-seen flags.
- i18n: English (default) + Bengali confirmed; architect so Urdu and others can be added without code changes (string-table driven).

### 4.5 Premium/Crown Module (stub for now)
- Crown icon present in headers across screens, implying a paywall/premium tier (likely: unlimited saved statuses, more monitored apps, and — once added — ad removal). Reserve a `Premium` route and an `isPremium` local (or remote-config-gated) flag for future work; MVP can leave this as a non-functional placeholder screen.

### 4.6 Monetization (deferred)
- Reference screenshots showed AdMob banner ads and in-feed native ad cards (bottom-docked banner across most screens, plus native ad cards interleaved in the Notification feed and cross-promo rows in Settings). **Ads are intentionally excluded from this build** and will be added in a later update — no ad SDK, ad unit IDs, or ad-related UI placeholders are part of this spec for now. When reintroduced, this section should specify the ad SDK, placement points (Home feed, Settings, full-screen video player), and how the Premium tier suppresses them.

---

## 5. Backend (Node.js + Express) — Responsibilities

No user content or PII is ever sent to a server, so the backend stays intentionally thin and stateless:

| Endpoint | Purpose |
|---|---|
| `GET /config/app-version` | Force/soft-update check against Play Store version |
| `GET /config/remote-flags` | Feature flags (auto-save default, premium price, which notification-event types to parse) |
| `GET /config/supported-apps` | Metadata (display name + icon reference) for apps RecDel specially integrates with (status-folder logic vs. notification-only apps) — the Choose App grid itself still enumerates the device's actual installed packages locally |
| `GET /legal/privacy-policy`, `GET /legal/terms` | Serve current hosted legal text, mirrored into Settings |
| `POST /telemetry/event` *(optional, anonymous, opt-out-able)* | Aggregate non-PII counters only ("app_opened", "status_saved_count") — never message content, filenames, or contact identifiers |

No auth, no accounts, no database — a stateless Express app backed by a config JSON file (git-managed or simple CMS) is sufficient; flat-file persistence if any server-side state is ever needed, consistent with the "no database" requirement.

---

## 6. Required Android Permissions & Manifest Declarations

| Permission / API | Why | Reference |
|---|---|---|
| `BIND_NOTIFICATION_LISTENER_SERVICE` | Capture notifications for selected apps | Sections 3.3, 3.10, 3.11 |
| SAF grant (`ACTION_OPEN_DOCUMENT_TREE`) targeting WhatsApp media folder | Read live status files on Android 11+ | Section 3.3 ("Folder access Android 11") |
| `READ_EXTERNAL_STORAGE` / `READ_MEDIA_IMAGES` / `READ_MEDIA_VIDEO` (API-level gated) | Legacy read + saving to gallery | Section 4.1 |
| `SCHEDULE_EXACT_ALARM` (Android 12+) | Reliable periodic status re-check | Section 3.4 |
| `FOREGROUND_SERVICE` + `FOREGROUND_SERVICE_DATA_SYNC` (or currently-allowed type) | Persistent "Watching for new Statuses" service | Section 3.13 |
| `POST_NOTIFICATIONS` (Android 13+) | Required to show the app's own notifications/toasts | implicit |
| `RECEIVE_BOOT_COMPLETED` | Restart monitoring service after device reboot | implicit |

---

## 7. Navigation Structure (React Navigation)

```
RootStack
 ├─ DisclaimerScreen        (shown once)
 ├─ OnboardingCarousel      (shown once)
 └─ MainTabs (bottom tab navigator)
     ├─ NotificationTab       -> Home: Add-App row + Captured Notification Feed
     │    ├─ ChooseAppScreen  (stack push)
     │    ├─ AppStatusViewer  (stack push; tabs: Photos | Videos | SavedStatus)
     │    │     └─ FullScreenVideoPlayer (stack push; back/download/share, scrubber controls)
     │    │     └─ FullScreenImageViewer (stack push; pinch-zoom)
     │    └─ RecoveredMessageDetail (stack push; per-contact reconstructed log)
     ├─ TrashFilesTab          -> aggregated recovered/deleted media list
     │    └─ (reuses FullScreenVideoPlayer / FullScreenImageViewer)
     ├─ StatusTab              -> shortcut/alias into AppStatusViewer for status-capable apps
     └─ SettingsTab
          ├─ PermissionsScreen   (deep-link launcher to OS screens)
          ├─ LanguagePicker
          ├─ PremiumScreen       (stub)
          └─ WebView screens: PrivacyPolicy, Terms, RememberLimitations
```

Global modals (not part of the stack): PermissionRequiredModal, ExactAlarmDialog (custom pre-prompt shown before the OS dialog).

---

## 8. Non-Functional Requirements

- **Android-only** for v1 — iOS lacks NotificationListenerService and any equivalent to WhatsApp's status-folder access; ship iOS only as a "Coming soon" info screen if a build is required at all.
- **No backend storage of user content** — must be reflected accurately in the Privacy Policy and Play Store Data Safety form.
- **One-sided recovery is a hard architectural limit**, not a bug — the product copy, onboarding, and Remember & Limitations screen must set this expectation clearly (Section 1, Section 4.2).
- **Battery/OEM-kill resilience**: document for users (via "Restart Services") that aggressive OEM battery managers (MIUI, ColorOS, etc.) can kill the listener; consider a battery-optimization-exemption prompt in onboarding.
- **Play Store policy risk**: keep store-listing language conservative — "captures notification content while active, before deletion," never "reads deleted WhatsApp messages from WhatsApp's database."
- **Performance**: status folder diffing must be incremental (hash/mtime index), not a full re-scan/re-copy on every check; per-conversation notification logs should be paginated append-logs, not one growing blob.
- **Localization**: minimum EN + BN, string-table driven for easy expansion (UR next, per screenshot evidence).

---

## 9. Suggested MVP Build Order

1. Disclaimer + Onboarding screens (pure UI, no native deps) — validates RN setup.
2. Bottom-tab shell + Settings screen (static, local-storage-backed toggles) — validates MMKV/AsyncStorage wiring.
3. Native module: SAF folder permission + status folder read/copy (Android 11+ path) — highest-risk native piece, build first.
4. Choose App grid (installed-package enumeration via native `PackageManager` bridge).
5. AppStatusViewer (Photos/Videos/Saved Status tabs) wired to module from step 3.
6. Full-Screen Video Player (scrubber, rewind/forward, download, share) + Full-Screen Image Viewer.
7. Native module: NotificationListenerService + local per-conversation capture store — second highest-risk native piece; include reaction-event parsing from day one, not as an afterthought.
8. Notification Tab feed (captured-conversation list) + Recovered Message Detail screen (reconstruction view).
9. Trash Files aggregated media view.
10. Foreground service + exact alarm scheduling for background reliability.
11. Premium stub (non-functional placeholder; ad SDK and monetization to be added in a later update per Section 4.6).
12. Express backend: version check + remote flags + legal text endpoints.
13. QA pass against Play Store sensitive-permissions declaration + Data Safety form before submission.
