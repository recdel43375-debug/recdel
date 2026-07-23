package com.recdel.notification

import android.content.Intent
import android.provider.Settings
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.*

class NotificationCaptureModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  init {
    NotificationEventBridge.attach(reactContext)
  }

  override fun getName() = "NotificationCaptureModule"

  @ReactMethod
  fun hasNotificationAccess(promise: Promise) {
    val enabledPackages = NotificationManagerCompat.getEnabledListenerPackages(reactContext)
    promise.resolve(enabledPackages.contains(reactContext.packageName))
  }

  @ReactMethod
  fun openNotificationAccessSettings() {
    val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) }
    reactContext.startActivity(intent)
  }

  @ReactMethod
  fun setMonitoredPackages(packages: ReadableArray) {
    val set = mutableSetOf<String>()
    for (i in 0 until packages.size()) {
      packages.getString(i)?.let { set.add(it) }
    }
    MonitoredPackagesStore.setPackages(reactContext, set)
  }

  @ReactMethod
  fun getMonitoredPackages(promise: Promise) {
    val result = Arguments.createArray()
    MonitoredPackagesStore.getPackages(reactContext).forEach { result.pushString(it) }
    promise.resolve(result)
  }

  // Required by RN's NativeEventEmitter contract on Android even though
  // events are emitted directly via NotificationEventBridge / RCTDeviceEventEmitter.
  @ReactMethod
  fun addListener(eventName: String) = Unit

  @ReactMethod
  fun removeListeners(count: Int) = Unit
}
