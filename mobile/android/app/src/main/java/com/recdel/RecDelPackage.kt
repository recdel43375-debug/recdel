package com.recdel

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import com.recdel.foreground.ForegroundServiceModule
import com.recdel.installedapps.InstalledAppsModule
import com.recdel.notification.NotificationCaptureModule
import com.recdel.settings.SystemSettingsModule
import com.recdel.statusreader.StatusReaderModule

/** Registers all of RecDel's custom native modules (Section 2: "Custom Kotlin/Java native modules"). */
class RecDelPackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
    listOf(
      StatusReaderModule(reactContext),
      NotificationCaptureModule(reactContext),
      InstalledAppsModule(reactContext),
      SystemSettingsModule(reactContext),
      ForegroundServiceModule(reactContext),
    )

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}
