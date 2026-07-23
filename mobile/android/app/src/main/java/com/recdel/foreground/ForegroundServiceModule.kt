package com.recdel.foreground

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/** JS bridge for the persistent "Status Saver" foreground service (Section 3.13, Settings > Restart Services). */
class ForegroundServiceModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "ForegroundServiceModule"

  @ReactMethod
  fun start() {
    ForegroundServiceController.start(reactContext)
  }

  @ReactMethod
  fun stop() {
    ForegroundServiceController.stop(reactContext)
  }

  @ReactMethod
  fun restart() {
    ForegroundServiceController.restart(reactContext)
  }

  @ReactMethod
  fun isRunning(promise: Promise) {
    promise.resolve(StatusSaverForegroundService.isRunning)
  }
}
