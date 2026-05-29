package com.flashora.app

import android.app.Activity
import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableArray
import com.google.mlkit.vision.documentscanner.GmsDocumentScannerOptions
import com.google.mlkit.vision.documentscanner.GmsDocumentScannerOptions.RESULT_FORMAT_JPEG
import com.google.mlkit.vision.documentscanner.GmsDocumentScannerOptions.RESULT_FORMAT_PDF
import com.google.mlkit.vision.documentscanner.GmsDocumentScannerOptions.SCANNER_MODE_FULL
import com.google.mlkit.vision.documentscanner.GmsDocumentScanning
import com.google.mlkit.vision.documentscanner.GmsDocumentScanningResult

class DocumentScannerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private var scanPromise: Promise? = null

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String {
        return "DocumentScanner"
    }

    @ReactMethod
    fun startScan(options: ReadableMap, promise: Promise) {
        if (scanPromise != null) {
            promise.reject("SCAN_IN_PROGRESS", "A scan is already in progress.")
            return
        }

        scanPromise = promise

        val scannerOptionsBuilder = GmsDocumentScannerOptions.Builder()
            .setGalleryImportAllowed(true)
            .setResultFormats(RESULT_FORMAT_JPEG, RESULT_FORMAT_PDF)
            .setScannerMode(SCANNER_MODE_FULL)

        if (options.hasKey("pageLimit") && options.getInt("pageLimit") > 0) {
            scannerOptionsBuilder.setPageLimit(options.getInt("pageLimit"))
        }

        val scannerOptions = scannerOptionsBuilder.build()
        val scanner = GmsDocumentScanning.getClient(scannerOptions)

        currentActivity?.let { activity ->
            scanner.getStartScanIntent(activity)
                .addOnSuccessListener { intentSender ->
                    try {
                        activity.startIntentSenderForResult(intentSender, SCAN_REQUEST_CODE, null, 0, 0, 0)
                    } catch (e: Exception) {
                        scanPromise?.reject("INTENT_ERROR", "Failed to start scanner intent", e)
                        scanPromise = null
                    }
                }
                .addOnFailureListener { e ->
                    scanPromise?.reject("SCANNER_ERROR", "Failed to initialize scanner", e)
                    scanPromise = null
                }
        } ?: run {
            scanPromise?.reject("ACTIVITY_ERROR", "Current activity is null")
            scanPromise = null
        }
    }

    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == SCAN_REQUEST_CODE) {
            val promise = scanPromise
            scanPromise = null

            if (resultCode == Activity.RESULT_OK) {
                val result = GmsDocumentScanningResult.fromActivityResultIntent(data)
                
                val resultMap = Arguments.createMap()
                
                result?.pdf?.let { pdf ->
                    val pdfMap = Arguments.createMap()
                    pdfMap.putString("uri", pdf.uri.toString())
                    pdfMap.putInt("pageCount", pdf.pageCount)
                    resultMap.putMap("pdf", pdfMap)
                }
                
                result?.pages?.let { pages ->
                    val pagesArray: WritableArray = Arguments.createArray()
                    for (page in pages) {
                        val pageMap = Arguments.createMap()
                        pageMap.putString("imageUri", page.imageUri.toString())
                        pagesArray.pushMap(pageMap)
                    }
                    resultMap.putArray("pages", pagesArray)
                }

                promise?.resolve(resultMap)
            } else if (resultCode == Activity.RESULT_CANCELED) {
                promise?.reject("USER_CANCELED", "User canceled the scan")
            } else {
                promise?.reject("SCAN_FAILED", "Scan failed with result code: $resultCode")
            }
        }
    }

    override fun onNewIntent(intent: Intent?) {
        // No-op
    }

    companion object {
        private const val SCAN_REQUEST_CODE = 4422
    }
}
