package com.flashora.app

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class StorageModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "StorageModule"
    }

    @ReactMethod
    fun getMediaDirectory(category: String, promise: Promise) {
        try {
            val mediaDirs = reactApplicationContext.externalMediaDirs
            if (mediaDirs.isNotEmpty() && mediaDirs[0] != null) {
                // Ensure it returns a string that works well with expo-file-system (file:///)
                var path = mediaDirs[0].absolutePath + "/Flashora"
                if (category.isNotEmpty()) {
                    path += "/$category"
                }
                val dir = java.io.File(path)
                if (!dir.exists()) {
                    dir.mkdirs()
                }
                promise.resolve("file://$path/")
            } else {
                promise.reject("UNAVAILABLE", "External media directory is not available.")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}
