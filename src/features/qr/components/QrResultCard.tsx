/**
 * QrResultCard — Displays details of a scanned QR code
 */

import React from 'react';
import { View, Text, Linking, Share } from 'react-native';
import { Card } from '@components/Card';
import { Button } from '@components/Button';
import { ExternalLink, Copy, Share2, Phone, Mail, Wifi } from 'lucide-react-native';
import { Colors } from '@design-system/tokens';
import { QrData } from '../types';
import * as Clipboard from 'expo-clipboard';

interface QrResultCardProps {
  data: QrData;
  onClose: () => void;
  onBackToTools: () => void;
}

export function QrResultCard({ data, onClose, onBackToTools }: QrResultCardProps) {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(data.value);
  };

  const handleAction = () => {
    if (data.type === 'url') {
      void Linking.openURL(data.value);
    } else if (data.type === 'phone') {
      void Linking.openURL(`tel:${data.value}`);
    } else if (data.type === 'email') {
      void Linking.openURL(`mailto:${data.value}`);
    }
  };

  const getIcon = () => {
    switch (data.type) {
      case 'url': return <ExternalLink size={20} color={Colors.primary} />;
      case 'phone': return <Phone size={20} color={Colors.primary} />;
      case 'email': return <Mail size={20} color={Colors.primary} />;
      case 'wifi': return <Wifi size={20} color={Colors.primary} />;
      default: return <Copy size={20} color={Colors.primary} />;
    }
  };

  const getActionLabel = () => {
    switch (data.type) {
      case 'url': return 'Open Link';
      case 'phone': return 'Call';
      case 'email': return 'Send Email';
      case 'wifi': return 'Connect';
      default: return 'Copy Text';
    }
  };

  return (
    <View className="px-4 pt-4">
      <Card variant="raised" className="p-4">
        <View className="flex-row items-center mb-3">
          <View className="w-[40px] h-[40px] rounded-full bg-primary-muted items-center justify-center mr-3">
            {getIcon()}
          </View>
          <View className="flex-1">
            <Text className="text-xs text-outline uppercase font-bold tracking-wider">
              {data.type}
            </Text>
            <Text className="text-base font-semibold text-onSurface dark:text-onSurface-dark" numberOfLines={1}>
              {data.label}
            </Text>
          </View>
        </View>

        <Text className="text-sm text-onSurfaceVariant dark:text-onSurfaceVariant-dark mb-4 leading-5">
          {data.value}
        </Text>

        <View className="gap-2">
          {data.type !== 'wifi' && (
            <Button
              label={getActionLabel()}
              onPress={data.type === 'text' ? handleCopy : handleAction}
              variant="primary"
              fullWidth
            />
          )}
          <View className="flex-row gap-2">
            <Button
              label="Copy"
              onPress={handleCopy}
              variant="outline"
              className="flex-1"
              leftIcon={<Copy size={18} color={Colors.textPrimary} />}
            />
            <Button
              label="Share"
              onPress={() => Share.share({ message: data.value })}
              variant="outline"
              className="flex-1"
              leftIcon={<Share2 size={18} color={Colors.textPrimary} />}
            />
          </View>
          <Button
            label="Back to Tools"
            onPress={onBackToTools}
            variant="outline"
            fullWidth
          />
          <Button
            label="Scan Another"
            onPress={onClose}
            variant="ghost"
            fullWidth
          />
        </View>
      </Card>
    </View>
  );
}
