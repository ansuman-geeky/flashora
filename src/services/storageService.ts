import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';

const { StorageModule } = NativeModules;

export type FileCategory = 'PDF' | 'Scanner' | 'Images' | 'QR' | 'Compressed' | 'Converted';

export interface SavedFile {
  id: string;
  name: string;
  uri: string;
  size: number;
  category: FileCategory;
  timestamp: number;
}

const FILES_KEY = '@flashora_files';

const mediaDirectoryCache: Record<string, string> = {};

/**
 * Gets the external media directory path for the app (e.g. /storage/emulated/0/Android/media/com.flashora.app/Flashora/)
 */
export async function getMediaDirectory(category: string = ''): Promise<string> {
  const cached = mediaDirectoryCache[category];
  if (cached) return cached;
  
  if (StorageModule && StorageModule.getMediaDirectory) {
    try {
      const dir = await StorageModule.getMediaDirectory(category);
      const formattedDir = dir.endsWith('/') ? dir : `${dir}/`;
      mediaDirectoryCache[category] = formattedDir;
      return formattedDir;
    } catch (e) {
      console.warn('Failed to get media directory from NativeModule', e);
    }
  }
  
  // Fallback to document directory if native module fails or on unsupported platforms
  const docDir = FileSystem.documentDirectory;
  const base = docDir ? `${docDir}Flashora/` : 'file:///Flashora/';
  const fallbackDir = category ? `${base}${category}/` : base;
  mediaDirectoryCache[category] = fallbackDir;
  return fallbackDir;
}

/**
 * Ensures the category folder exists in the media directory
 */
export async function ensureCategoryDirectory(category: FileCategory): Promise<string> {
  const dirPath = await getMediaDirectory(category);
  
  // Only use FileSystem.makeDirectoryAsync if we fell back to internal storage
  // Doing this on Android 11+ scoped external storage crashes the Expo module entirely!
  if (dirPath.includes(FileSystem.documentDirectory || 'file:///data/')) {
    const info = await FileSystem.getInfoAsync(dirPath);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
    }
  }
  
  return dirPath;
}

/**
 * Saves a file to the Flashora automatic storage.
 * @param sourceUri The temporary file uri
 * @param category The folder category
 * @param prefix Prefix for the generated file name (e.g. 'merge', 'compress')
 * @param extension Extension with dot (e.g. '.pdf')
 */
export async function saveToFlashora(sourceUri: string, category: FileCategory, prefix: string, extension: string = '.pdf'): Promise<SavedFile> {
  const timestamp = Date.now();
  // Format: flashora_merge_2026_05_27_103245.pdf
  const dateStr = new Date(timestamp).toISOString().replace(/T/, '_').replace(/:/g, '').split('.')[0];
  const filename = `flashora_${prefix}_${dateStr}${extension}`;
  
  // Determine mimeType
  let mimeType = 'application/pdf';
  if (extension.toLowerCase() === '.jpg' || extension.toLowerCase() === '.jpeg') {
    mimeType = 'image/jpeg';
  } else if (extension.toLowerCase() === '.png') {
    mimeType = 'image/png';
  }
  
  let destUri = '';
  
  if (StorageModule && StorageModule.copyFileToDownloads) {
    try {
      // This natively saves to the public Downloads/Flashora folder
      destUri = await StorageModule.copyFileToDownloads(sourceUri, filename, mimeType);
    } catch (e) {
      console.warn('Native copyFileToDownloads failed, falling back to FileSystem', e);
      // Fallback
      const categoryDir = await ensureCategoryDirectory(category);
      destUri = `${categoryDir}${filename}`;
      await FileSystem.copyAsync({ from: sourceUri, to: destUri });
    }
  } else {
    // Fallback
    const categoryDir = await ensureCategoryDirectory(category);
    destUri = `${categoryDir}${filename}`;
    await FileSystem.copyAsync({ from: sourceUri, to: destUri });
  }
  
  const info = await FileSystem.getInfoAsync(destUri);
  const size = info.exists ? info.size : 0;
  
  const fileRecord: SavedFile = {
    id: `${category}_${timestamp}`,
    name: filename,
    uri: destUri,
    size,
    category,
    timestamp,
  };
  
  await addFileToHistory(fileRecord);
  
  return fileRecord;
}

/**
 * Retrieves all saved files from AsyncStorage metadata
 */
export async function getSavedFiles(): Promise<SavedFile[]> {
  try {
    const data = await AsyncStorage.getItem(FILES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Adds a file record to history
 */
async function addFileToHistory(file: SavedFile) {
  try {
    const files = await getSavedFiles();
    files.unshift(file);
    await AsyncStorage.setItem(FILES_KEY, JSON.stringify(files));
  } catch (e) {
    console.error('Failed to save file history', e);
  }
}

/**
 * Removes a file record
 */
export async function deleteSavedFile(file: SavedFile): Promise<void> {
  try {
    // Delete physical file
    await FileSystem.deleteAsync(file.uri, { idempotent: true });
    
    // Remove from index
    const files = await getSavedFiles();
    const updated = files.filter(f => f.id !== file.id);
    await AsyncStorage.setItem(FILES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete file', e);
    throw e;
  }
}
