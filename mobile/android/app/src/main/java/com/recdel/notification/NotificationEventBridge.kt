package com.recdel.notification

import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule

private const val CAPTURED_EVENT = "RecDelNotificationCaptured"

/**
 * The NotificationListenerService and the NativeModule that JS talks to are
 * different Android components with independent lifecycles — this singleton
 * is the hand-off point so the service can emit a "something changed,
 * refresh your UI" event to JS when a ReactContext happens to be alive.
 * Persistence itself does NOT depend on this (see ConversationLogWriter) —
 * this is purely a live-refresh nicety for when the app is foregrounded.
 */
object NotificationEventBridge {
  @Volatile private var reactContext: ReactContext? = null

  fun attach(context: ReactContext) {
    reactContext = context
  }

  fun emitCaptured(payload: WritableMap) {
    reactContext
      ?.takeIf { it.hasActiveReactInstance() }
      ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      ?.emit(CAPTURED_EVENT, payload)
  }
}
