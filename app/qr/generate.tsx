/**
 * QR Generate Screen — Form for creating QR codes
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@components/ScreenHeader';
import { Input } from '@components/Input';
import { Button } from '@components/Button';
import { QrGenerator } from '@features/qr/components/QrGenerator';
import { QrType } from '@features/qr/types';
import { useToolProcessor } from '@hooks/useToolProcessor';
import { Link2, Type, Phone, Mail, Wifi } from 'lucide-react-native';
import { Colors } from '@design-system/tokens';
import { useRouter } from 'expo-router';
import { useTheme } from '@hooks/useTheme';

const QR_TYPES: { type: QrType; label: string; icon: any }[] = [
  { type: 'url', label: 'URL', icon: Link2 },
  { type: 'text', label: 'Text', icon: Type },
  { type: 'phone', label: 'Phone', icon: Phone },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'wifi', label: 'WiFi', icon: Wifi },
];

export default function QrGenerateScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selectedType, setSelectedType] = useState<QrType>('url');
  const [value, setValue] = useState('');
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [generatedValue, setGeneratedValue] = useState<string | null>(null);

  const processor = useToolProcessor({
    toolId: 'qr_generate',
    toolName: 'Generate QR',
    category: 'qr',
  });

  const handleGenerate = () => {
    let finalValue = value;
    if (selectedType === 'wifi') {
      finalValue = `WIFI:S:${ssid};T:WPA;P:${password};;`;
    } else if (selectedType === 'phone') {
      finalValue = `tel:${value}`;
    } else if (selectedType === 'email') {
      finalValue = `mailto:${value}`;
    }

    setGeneratedValue(finalValue);

    void processor.execute(async () => {
      return {
        outputUris: [],
        outputNames: [`QR: ${selectedType}`],
        durationMs: 0,
        fileSizeBytes: 0,
      };
    });
  };

  const handleReset = () => {
    setGeneratedValue(null);
    setValue('');
    setSsid('');
    setPassword('');
    processor.reset();
  };

  return (
    <SafeAreaView
      className="flex-1 bg-bg dark:bg-bg-dark"
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScreenHeader title="Generate QR Code" />

      {generatedValue ? (
        <QrGenerator
          value={generatedValue}
          label={`${selectedType.toUpperCase()} QR Code`}
          onReset={handleReset}
          onBackToTools={() => router.replace('/(tabs)/tools')}
        />
      ) : (
        <ScrollView className="flex-1 px-4 pt-2">
          <Text className="text-sm font-medium text-onSurfaceVariant dark:text-onSurfaceVariant-dark mb-2">
            Select Type
          </Text>

          <View className="flex-row flex-wrap gap-2 mb-4">
            {QR_TYPES.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedType === item.type;
              return (
                <Pressable
                  key={item.type}
                  onPress={() => setSelectedType(item.type)}
                  className={`flex-row items-center px-3 py-2 rounded-full border ${
                    isSelected
                      ? 'bg-primary border-primary'
                      : 'bg-surface dark:bg-surface-dark border-outlineVariant dark:border-outlineVariant-dark'
                  }`}
                >
                  <Icon size={16} color={isSelected ? '#FFFFFF' : Colors.textSecondary} />
                  <Text
                    className={`ml-1.5 text-sm font-medium ${
                      isSelected ? 'text-white' : 'text-onSurfaceVariant dark:text-onSurfaceVariant-dark'
                    }`}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {selectedType === 'wifi' ? (
            <View className="gap-3">
              <Input
                label="SSID (Network Name)"
                value={ssid}
                onChangeText={setSsid}
                placeholder="Enter WiFi name"
              />
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                secureTextEntry
              />
            </View>
          ) : (
            <Input
              label={selectedType === 'url' ? 'URL' : selectedType === 'phone' ? 'Phone Number' : selectedType === 'email' ? 'Email Address' : 'Text'}
              value={value}
              onChangeText={setValue}
              placeholder={`Enter ${selectedType} here...`}
              multiline={selectedType === 'text'}
              keyboardType={selectedType === 'url' ? 'url' : selectedType === 'phone' ? 'phone-pad' : selectedType === 'email' ? 'email-address' : 'default'}
            />
          )}

          <View className="mt-6 mb-8">
            <Button
              label="Generate QR Code"
              variant="primary"
              size="lg"
              onPress={handleGenerate}
              disabled={selectedType === 'wifi' ? !ssid : !value}
              fullWidth
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
