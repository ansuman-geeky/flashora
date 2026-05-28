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

    @ReactMethod
    fun copyFile(sourceUriString: String, destUriString: String, promise: Promise) {
        try {
            val sourceUri = android.net.Uri.parse(sourceUriString)
            val destUri = android.net.Uri.parse(destUriString)
            
            val inputStream = reactApplicationContext.contentResolver.openInputStream(sourceUri)
                ?: throw Exception("Could not open source file")
            
            val destFile = java.io.File(destUri.path!!)
            val outputStream = java.io.FileOutputStream(destFile)
            
            val buffer = ByteArray(1024 * 8)
            var bytesRead: Int
            while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                outputStream.write(buffer, 0, bytesRead)
            }
            
            inputStream.close()
            outputStream.flush()
            outputStream.close()
            
            promise.resolve(destFile.absolutePath)
        } catch (e: Exception) {
            promise.reject("COPY_ERROR", e.message)
        }
    }
}
