/**
 * Image Service — Handles image selection and transformations
 */

import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import type { FileInfo } from '@utils/fileUtils';
import { getFileInfo } from '@utils/fileUtils';
import type { ImageFormat, ImageResizeOptions, ImageCompressionOptions } from '../types';

/**
 * Pick image from gallery
 */
export async function pickImages(allowMultiple = false): Promise<FileInfo[] | null> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: allowMultiple,
      quality: 1,
    });

    if (result.canceled || !result.assets.length) return null;

    const fileInfos = await Promise.all(
      result.assets.map(async (asset) => {
        return getFileInfo(asset.uri);
      })
    );

    return fileInfos;
  } catch (error) {
    console.error('Error picking images:', error);
    return null;
  }
}

/**
 * Capture image from camera
 */
export async function captureImage(): Promise<FileInfo | null> {
  try {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return null;

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (result.canceled || !result.assets.length) return null;

    const asset = result.assets[0];
    if (!asset) return null;

    return getFileInfo(asset.uri);
  } catch (error) {
    console.error('Error capturing image:', error);
    return null;
  }
}

/**
 * Compress image
 */
export async function compressImage(
  uri: string,
  options: ImageCompressionOptions
): Promise<FileInfo> {
  const formatStr = (options.format?.toLowerCase() || 'jpeg') as any;
  
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ rotate: 360 }], // Hack to force image processing on Android/iOS when no other actions are present
    { 
      compress: options.quality, 
      format: formatStr
    }
  );

  return getFileInfo(result.uri);
}

/**
 * Resize image
 */
export async function resizeImage(
  uri: string,
  options: ImageResizeOptions
): Promise<FileInfo> {
  const actions: ImageManipulator.Action[] = [];
  
  if (options.width || options.height) {
    actions.push({
      resize: {
        width: options.width,
        height: options.height,
      },
    });
  }

  const result = await ImageManipulator.manipulateAsync(uri, actions, {
    compress: 1,
    format: 'jpeg' as any,
  });

  return getFileInfo(result.uri);
}

/**
 * Crop image
 * Note: Typically we use ImagePicker's allowsEditing for simple crops,
 * but for complex ones we use Manipulator.
 */
export async function cropImage(
  uri: string,
  originX: number,
  originY: number,
  width: number,
  height: number
): Promise<FileInfo> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ crop: { originX, originY, width, height } }],
    { compress: 1, format: 'jpeg' as any }
  );

  return getFileInfo(result.uri);
}

/**
 * Convert image format
 */
export async function convertImage(
  uri: string,
  targetFormat: ImageFormat,
  quality = 1
): Promise<FileInfo> {
  // Pass the string directly as ImageManipulator expects 'jpeg', 'png', or 'webp'
  const saveFormat = targetFormat as any;
  
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { compress: quality, format: saveFormat }
    );
    return getFileInfo(result.uri);
  } catch (error) {
    console.error('Error converting image:', error);
    throw error;
  }
}
