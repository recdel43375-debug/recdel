# RecDel

Android-only WhatsApp status-saver & notification-based "deleted message recovery" utility. See `RecDel_Requirement_Spec (2).md` for the full product/technical spec this build follows.

## Structure

```
recdel/
├─ backend/   Node.js + Express — stateless config/legal/telemetry API (Section 5)
└─ mobile/    React Native (bare workflow) Android app (Sections 2-4, 6-8)
```

The two are independent projects with their own `package.json`, `node_modules`, and lifecycle — the mobile app talks to the backend only over HTTP (`mobile/src/services/api.ts`), never shares code or a build pipeline with it.

## Backend

```bash
cd backend
npm install
npm start      # http://localhost:4000
npm test
```

Endpoints: `/config/app-version`, `/config/remote-flags`, `/config/supported-apps`, `/legal/privacy-policy`, `/legal/terms`, `/telemetry/event`. No database — flat JSON files under `backend/src/data/`.

## Mobile

Still a **bare React Native project** (see Section 2 of the spec — Expo Go can't host this app's custom native modules: `NotificationListenerService`, the SAF folder picker, the foreground service, `PackageManager` enumeration). Builds are done via **EAS Build** (Expo's cloud build service) rather than a local Gradle/Android SDK toolchain, so no local JDK is required:

```bash
cd mobile
npm install
npx eas-cli login                       # one-time, needs a free expo.dev account
npx eas-cli build:configure              # links this project to your Expo account, writes expo.extra.eas.projectId into app.json
npx eas-cli build --platform android --profile development   # builds a debug APK in the cloud
```

Download the resulting APK from the link EAS prints (or the expo.dev dashboard) and install it on a device (`adb install <file>.apk`) or drag it onto an emulator. Build profiles live in `mobile/eas.json`:

- `development` — debug APK, fastest to build, unsigned/internal distribution.
- `preview` — release-type APK for handing to testers.
- `production` — `.aab` for a Play Store submission.

If you later get a local JDK 17 + Android SDK set up, the project also builds locally the normal RN way: `npx react-native run-android`.

Implemented so far:

- Full navigation shell: Disclaimer → Onboarding → bottom tabs (Notification / Trash Files / Status / Settings), matching Section 7.
- All screens from Section 3: Home feed, Choose App grid, AppStatusViewer (Photos/Videos/Saved Status), full-screen video player with scrubber, full-screen image viewer, Recovered Message Detail (paginated conversation log), Trash Files, Settings + sub-screens, Premium stub.
- Local persistence: MMKV for settings/metadata, filesystem JSONL append-logs for captured conversations (Section 4.2), a saved-status index for the download checkmark state (Section 4.1).
- Native Android modules (Kotlin) under `mobile/android/app/src/main/java/com/recdel/`:
  - `statusreader/` — SAF folder grant + status file listing/saving (Section 4.1)
  - `notification/` — `NotificationListenerService` + heuristic classification (text/emoji/reaction/media/voice) + **native-side persistence** of the append logs, so capture keeps working even when the JS/RN instance isn't running (Section 4.2)
  - `installedapps/` — PackageManager bridge for the Choose App grid (Section 3.5)
  - `settings/` — exact-alarm + OS settings deep links (Sections 3.4, 3.10, 3.12)
  - `foreground/` — the persistent "Status Saver" foreground service + boot receiver + periodic re-check alarm (Section 3.13, 3.4, 6)

### Known gaps / what to verify next

- **No Android build has been run yet** — neither a JDK nor the full local toolchain was available in the environment this was built in, so the Kotlin was hand-reviewed for correctness but not compiler-verified. TypeScript compiles cleanly and Metro bundles the JS side without errors. Run `npx eas-cli build --platform android --profile development` (see above) as the first real compile check — it'll surface any Kotlin/Gradle issues without needing a local JDK.
- The reaction-notification heuristic (`NotificationParser.kt`) is a best-effort regex — WhatsApp doesn't publish a stable notification-content contract, so this should be tuned against real captured notifications on a device.
- `StatusReaderModule` currently grants one SAF tree per install (assumes a single WhatsApp variant); multi-tree support for WhatsApp Business alongside WhatsApp is a straightforward extension if needed.
- Ads (Section 4.6) and full Premium paywall logic (Section 4.5) are intentionally out of scope per the spec — only stubs/reserved routes exist.
- App icons/splash art are the RN default template placeholders — swap `mobile/android/app/src/main/res/mipmap-*` before shipping.
