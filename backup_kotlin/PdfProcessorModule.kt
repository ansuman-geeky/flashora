package com.flashora.app

import android.graphics.Bitmap
import android.net.Uri
import com.facebook.react.bridge.*
import com.tom_roush.pdfbox.pdmodel.PDDocument
import com.tom_roush.pdfbox.pdmodel.encryption.AccessPermission
import com.tom_roush.pdfbox.pdmodel.encryption.StandardProtectionPolicy
import com.tom_roush.pdfbox.rendering.PDFRenderer
import com.tom_roush.pdfbox.android.PDFBoxResourceLoader
import com.tom_roush.pdfbox.pdmodel.graphics.image.JPEGFactory
import com.tom_roush.pdfbox.pdmodel.graphics.image.PDImageXObject
import com.tom_roush.pdfbox.io.MemoryUsageSetting
import com.tom_roush.pdfbox.multipdf.PDFMergerUtility
import com.tom_roush.pdfbox.pdmodel.PDPage
import com.tom_roush.pdfbox.pdmodel.PDPageContentStream
import com.tom_roush.pdfbox.pdmodel.common.PDRectangle
import android.graphics.BitmapFactory
import java.io.File
import java.io.FileOutputStream
import java.util.UUID

class PdfProcessorModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    init {
        PDFBoxResourceLoader.init(reactContext)
    }

    override fun getName(): String {
        return "PdfProcessor"
    }

    @ReactMethod
    fun compressPdf(uriString: String, qualityLevel: String, promise: Promise) {
        try {
            val uri = Uri.parse(uriString)
            val inputStream = reactContext.contentResolver.openInputStream(uri)
                ?: throw Exception("Could not open input stream")
            
            val document = PDDocument.load(inputStream, MemoryUsageSetting.setupTempFileOnly())
            
            // "high" compression -> 0.3f quality
            // "medium" compression -> 0.6f quality 
            // "low" compression -> 0.8f quality
            val quality = when (qualityLevel) {
                "high" -> 0.3f
                "medium" -> 0.6f
                "low" -> 0.8f
                else -> 0.6f
            }

            for (page in document.pages) {
                val resources = page.resources
                if (resources != null) {
                    for (name in resources.xObjectNames.toList()) {
                        val xObject = resources.getXObject(name)
                        if (xObject is PDImageXObject) {
                            try {
                                val bitmap = xObject.image
                                if (bitmap != null) {
                                    val newImage = JPEGFactory.createFromImage(document, bitmap, quality)
                                    resources.put(name, newImage)
                                    bitmap.recycle()
                                }
                            } catch (e: Throwable) {
                                // ignore this image if it throws (e.g. OOM), keep original
                            }
                        }
                    }
                }
            }
            
            val outputPath = File(reactContext.cacheDir, "compressed_${UUID.randomUUID()}.pdf")
            document.save(outputPath)
            document.close()
            inputStream.close()
            
            promise.resolve(outputPath.absolutePath)
        } catch (e: Throwable) {
            promise.reject("COMPRESS_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun encryptPdf(uriString: String, userPass: String, ownerPass: String, promise: Promise) {
        try {
            val uri = Uri.parse(uriString)
            val inputStream = reactContext.contentResolver.openInputStream(uri)
                ?: throw Exception("Could not open input stream")
            
            val document = PDDocument.load(inputStream, MemoryUsageSetting.setupTempFileOnly())
            
            val ap = AccessPermission()
            ap.setCanModify(false)
            ap.setCanExtractContent(false)
            
            val spp = StandardProtectionPolicy(ownerPass, userPass, ap)
            spp.encryptionKeyLength = 128
            document.protect(spp)
            
            val outputPath = File(reactContext.cacheDir, "protected_${UUID.randomUUID()}.pdf")
            document.save(outputPath)
            document.close()
            inputStream.close()
            
            promise.resolve(outputPath.absolutePath)
        } catch (e: Throwable) {
            promise.reject("ENCRYPT_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun renderPageThumbnails(uriString: String, promise: Promise) {
        try {
            val uri = Uri.parse(uriString)
            val inputStream = reactContext.contentResolver.openInputStream(uri)
                ?: throw Exception("Could not open input stream")
            
            val document = PDDocument.load(inputStream, MemoryUsageSetting.setupTempFileOnly())
            val renderer = PDFRenderer(document)
            val pageCount = document.numberOfPages
            val uriArray = Arguments.createArray()
            
            for (i in 0 until pageCount) {
                // Render at 72 DPI (good enough for thumbnails)
                val bitmap = renderer.renderImageWithDPI(i, 72f)
                val thumbFile = File(reactContext.cacheDir, "thumb_${UUID.randomUUID()}_page_$i.jpg")
                val out = FileOutputStream(thumbFile)
                bitmap.compress(Bitmap.CompressFormat.JPEG, 80, out)
                out.close()
                bitmap.recycle()
                uriArray.pushString(thumbFile.absolutePath)
            }
            
            document.close()
            inputStream.close()
            
            promise.resolve(uriArray)
        } catch (e: Throwable) {
            promise.reject("THUMBNAIL_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getPageCount(uriString: String, promise: Promise) {
        try {
            val uri = Uri.parse(uriString)
            val inputStream = reactContext.contentResolver.openInputStream(uri)
                ?: throw Exception("Could not open input stream")
            
            val document = PDDocument.load(inputStream, MemoryUsageSetting.setupTempFileOnly())
            val count = document.numberOfPages
            
            document.close()
            inputStream.close()
            
            promise.resolve(count)
        } catch (e: Throwable) {
            promise.reject("COUNT_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun mergePdfs(uriArray: ReadableArray, promise: Promise) {
        try {
            val merger = PDFMergerUtility()
            val outputPath = File(reactContext.cacheDir, "merged_${UUID.randomUUID()}.pdf")
            merger.destinationFileName = outputPath.absolutePath
            
            val streams = mutableListOf<java.io.InputStream>()
            for (i in 0 until uriArray.size()) {
                val uriString = uriArray.getString(i)
                val uri = Uri.parse(uriString)
                val inputStream = reactContext.contentResolver.openInputStream(uri)
                    ?: throw Exception("Could not open input stream for $uriString")
                streams.add(inputStream)
                merger.addSource(inputStream)
            }
            
            merger.mergeDocuments(MemoryUsageSetting.setupTempFileOnly())
            
            for (s in streams) {
                s.close()
            }
            
            promise.resolve(outputPath.absolutePath)
        } catch (e: Throwable) {
            promise.reject("MERGE_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun splitPdf(uriString: String, pageIndices: ReadableArray, promise: Promise) {
        try {
            val uri = Uri.parse(uriString)
            val inputStream = reactContext.contentResolver.openInputStream(uri)
                ?: throw Exception("Could not open input stream")
            val srcDoc = PDDocument.load(inputStream, MemoryUsageSetting.setupTempFileOnly())
            val newDoc = PDDocument()
            
            val maxPages = srcDoc.numberOfPages
            for (i in 0 until pageIndices.size()) {
                val idx = pageIndices.getInt(i)
                if (idx in 0 until maxPages) {
                    newDoc.addPage(srcDoc.getPage(idx))
                }
            }
            
            val outputPath = File(reactContext.cacheDir, "split_${UUID.randomUUID()}.pdf")
            newDoc.save(outputPath)
            newDoc.close()
            srcDoc.close()
            inputStream.close()
            
            promise.resolve(outputPath.absolutePath)
        } catch (e: Throwable) {
            promise.reject("SPLIT_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun imagesToPdf(uriArray: ReadableArray, promise: Promise) {
        try {
            val newDoc = PDDocument()
            
            for (i in 0 until uriArray.size()) {
                val uriString = uriArray.getString(i)
                val uri = Uri.parse(uriString)
                val inputStream = reactContext.contentResolver.openInputStream(uri)
                    ?: throw Exception("Could not open input stream")
                
                val bitmap = BitmapFactory.decodeStream(inputStream)
                inputStream.close()
                
                if (bitmap != null) {
                    val pdImage = JPEGFactory.createFromImage(newDoc, bitmap)
                    val page = PDPage(PDRectangle(pdImage.width.toFloat(), pdImage.height.toFloat()))
                    newDoc.addPage(page)
                    
                    val contentStream = PDPageContentStream(newDoc, page)
                    contentStream.drawImage(pdImage, 0f, 0f, pdImage.width.toFloat(), pdImage.height.toFloat())
                    contentStream.close()
                    bitmap.recycle()
                }
            }
            
            val outputPath = File(reactContext.cacheDir, "images_${UUID.randomUUID()}.pdf")
            newDoc.save(outputPath)
            newDoc.close()
            
            promise.resolve(outputPath.absolutePath)
        } catch (e: Throwable) {
            promise.reject("IMAGES_PDF_ERROR", e.message, e)
        }
    }
}
