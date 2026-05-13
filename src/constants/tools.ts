/**
 * Tool Manifest — Single source of truth for all tools in Flashora.
 *
 * Every tool in the app is defined here. The UI reads from this manifest
 * to render the tool grid, search results, and navigation targets.
 */

import { Colors } from '@design-system/tokens';
import type { Tool } from '@app-types/tool';

export const TOOLS: Tool[] = [
  // --- PDF Tools ---
  {
    id: 'pdf_merge',
    name: 'Merge PDF',
    icon: 'file-plus-2',
    category: 'pdf',
    color: Colors.pdf,
    route: '/pdf/merge',
    description: 'Combine multiple PDFs into one file',
    isPremium: false,
  },
  {
    id: 'pdf_split',
    name: 'Split PDF',
    icon: 'scissors',
    category: 'pdf',
    color: Colors.pdf,
    route: '/pdf/split',
    description: 'Split a PDF into separate pages',
    isPremium: false,
  },
  {
    id: 'pdf_compress',
    name: 'Compress PDF',
    icon: 'minimize-2',
    category: 'pdf',
    color: Colors.pdf,
    route: '/pdf/compress',
    description: 'Reduce PDF file size',
    isPremium: false,
  },
  {
    id: 'pdf_image_to_pdf',
    name: 'Image to PDF',
    icon: 'image-plus',
    category: 'pdf',
    color: Colors.pdf,
    route: '/pdf/image-to-pdf',
    description: 'Convert images into a PDF document',
    isPremium: false,
  },
  {
    id: 'pdf_pdf_to_image',
    name: 'PDF to Image',
    icon: 'file-image',
    category: 'pdf',
    color: Colors.pdf,
    route: '/pdf/pdf-to-image',
    description: 'Extract pages as images from a PDF',
    isPremium: false,
  },
  {
    id: 'pdf_reorder',
    name: 'Reorder Pages',
    icon: 'arrow-up-down',
    category: 'pdf',
    color: Colors.pdf,
    route: '/pdf/reorder',
    description: 'Rearrange pages within a PDF',
    isPremium: false,
  },
  {
    id: 'pdf_password',
    name: 'Password Lock',
    icon: 'lock',
    category: 'pdf',
    color: Colors.pdf,
    route: '/pdf/password',
    description: 'Add password protection to a PDF',
    isPremium: true,
  },

  // --- QR Tools ---
  {
    id: 'qr_scan',
    name: 'Scan QR',
    icon: 'scan-line',
    category: 'qr',
    color: Colors.qr,
    route: '/qr/scan',
    description: 'Scan QR codes with your camera',
    isPremium: false,
  },
  {
    id: 'qr_generate',
    name: 'Generate QR',
    icon: 'qr-code',
    category: 'qr',
    color: Colors.qr,
    route: '/qr/generate',
    description: 'Create QR codes for URLs, text, WiFi, and more',
    isPremium: false,
  },

  // --- Image Tools ---
  {
    id: 'image_compress',
    name: 'Compress Image',
    icon: 'minimize-2',
    category: 'image',
    color: Colors.image,
    route: '/image/compress',
    description: 'Reduce image file size while preserving quality',
    isPremium: false,
  },
  {
    id: 'image_resize',
    name: 'Resize Image',
    icon: 'scaling',
    category: 'image',
    color: Colors.image,
    route: '/image/resize',
    description: 'Change image dimensions',
    isPremium: false,
  },
  {
    id: 'image_crop',
    name: 'Crop Image',
    icon: 'crop',
    category: 'image',
    color: Colors.image,
    route: '/image/crop',
    description: 'Crop images to custom dimensions',
    isPremium: false,
  },
  {
    id: 'image_convert',
    name: 'Convert Image',
    icon: 'repeat-2',
    category: 'image',
    color: Colors.image,
    route: '/image/convert',
    description: 'Convert between JPG, PNG, and WebP formats',
    isPremium: false,
  },
  {
    id: 'image_metadata',
    name: 'Remove Metadata',
    icon: 'shield-off',
    category: 'image',
    color: Colors.image,
    route: '/image/metadata',
    description: 'Strip EXIF data from images for privacy',
    isPremium: false,
  },

  // --- Converter Tools ---

  {
    id: 'converter_txt_pdf',
    name: 'TXT → PDF',
    icon: 'file-text',
    category: 'pdf',
    color: Colors.pdf,
    route: '/pdf/txt-to-pdf',
    description: 'Convert plain text files to PDF',
    isPremium: false,
  },

  // --- URL Shortener ---
  {
    id: 'url_shorten',
    name: 'Shorten URL',
    icon: 'link-2',
    category: 'url-shortener',
    color: Colors.urlShortener,
    route: '/url-shortener/shorten',
    description: 'Shorten long URLs and generate QR codes',
    isPremium: false,
  },
];

/** Tool lookup by ID for O(1) access */
export const TOOLS_BY_ID: Record<string, Tool> = Object.fromEntries(
  TOOLS.map((tool) => [tool.id, tool])
);

/** Tools grouped by category — helper function for better reliability */
export function getToolsByCategory(category: string): Tool[] {
  return TOOLS.filter((t) => t.category === category);
}

/** Tools grouped by category (Legacy constant for compatibility) */
export const TOOLS_BY_CATEGORY: Record<string, Tool[]> = TOOLS.reduce(
  (acc, tool) => {
    const existing = acc[tool.category];
    if (existing) {
      existing.push(tool);
    } else {
      acc[tool.category] = [tool];
    }
    return acc;
  },
  {} as Record<string, Tool[]>
);

/** Category display metadata */
export const CATEGORY_META: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  pdf: { label: 'PDF Tools', icon: 'file-text', color: Colors.pdf },
  qr: { label: 'QR Tools', icon: 'qr-code', color: Colors.qr },
  image: { label: 'Image Tools', icon: 'image', color: Colors.image },

  'url-shortener': {
    label: 'URL Shortener',
    icon: 'link-2',
    color: Colors.urlShortener,
  },
};
