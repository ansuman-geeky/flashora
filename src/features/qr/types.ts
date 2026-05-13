/**
 * QR Feature — Type definitions
 */

export type QrType = 'url' | 'text' | 'phone' | 'email' | 'wifi' | 'vcard';

export interface QrData {
  type: QrType;
  value: string;
  label: string;
}

export interface WifiData {
  ssid: string;
  password?: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
}

export interface ContactData {
  firstName: string;
  lastName?: string;
  phone?: string;
  email?: string;
}
