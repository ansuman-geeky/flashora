/**
 * URL Shortener Screen — Input URL → Shorten → Result (QR + Link)
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, Text, Clipboard, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@components/ScreenHeader';
import { Button } from '@components/Button';
import { Input } from '@components/Input';
import { Card } from '@components/Card';
import { ErrorDisplay } from '@components/ErrorDisplay';
import { ProcessingView } from '@features/pdf/components';
import { QrGenerator } from '@features/qr/components/QrGenerator';
import { urlShortenerService, type ShortenResult } from '@features/url-shortener/services/urlShortenerService';
import { useToolProcessor } from '@hooks/useToolProcessor';
import { useTheme } from '@hooks/useTheme';
import { Colors } from '@design-system/tokens';
import { useRouter } from 'expo-router';
import { Copy, Share2 } from 'lucide-react-native';

export default function UrlShortenerScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ShortenResult | null>(null);
  const processor = useToolProcessor({ toolId: 'url_shorten', toolName: 'Shorten URL', category: 'url-shortener' });

  const handleShorten = useCallback(() => {
    if (!url) return;
    void processor.execute(async () => {
      const res = await urlShortenerService.shorten(url);
      setResult(res);
      // Return a dummy result to processor as we handle UI locally
      return {
        outputUris: [],
        outputNames: [],
        durationMs: 0,
        fileSizeBytes: 0,
      };
    });
  }, [url, processor]);

  const handleCopy = useCallback(() => {
    if (result) {
      Clipboard.setString(result.shortUrl);
    }
  }, [result]);

  const handleShare = useCallback(async () => {
    if (result) {
      try {
        await Share.share({
          message: result.shortUrl,
          url: result.shortUrl, // iOS support
        });
      } catch (error) {
        console.error('Sharing failed:', error);
      }
    }
  }, [result]);

  const handleReset = useCallback(() => {
    setUrl('');
    setResult(null);
    processor.reset();
  }, [processor]);

  if (processor.status === 'processing') {
    return (
      <SafeAreaView className="flex-1 bg-bg dark:bg-bg-dark" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenHeader title="Shorten URL" showBack={false} />
        <ProcessingView toolName="Creating short link..." progress={processor.progress} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-bg-dark" edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title="Shorten URL" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {processor.error && (
          <View className="px-2 mb-2">
            <ErrorDisplay errorCode={processor.error.code} onRetry={handleShorten} onDismiss={() => processor.reset()} />
          </View>
        )}

        {!result ? (
          <View className="px-4 mt-4">
            <Input
              label="Enter Long URL"
              placeholder="https://example.com/very-long-link..."
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <View className="mt-6">
              <Button label="Shorten Now" variant="primary" size="lg" fullWidth onPress={handleShorten} disabled={!url} />
            </View>
          </View>
        ) : (
          <View className="px-2 mt-2">
            <Card variant="flat" className="p-4 mb-4 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark">
              <Text className="text-xs text-text-tertiary mb-1">Original URL</Text>
              <Text className="text-sm text-text-secondary dark:text-text-secondary-dark mb-4" numberOfLines={1}>{result.longUrl}</Text>
              
              <Text className="text-xs text-text-tertiary mb-1">Shortened URL</Text>
              <View className="flex-row items-center gap-2 mb-4">
                <Text className="flex-1 text-lg font-bold text-primary">{result.shortUrl}</Text>
                <Button label="" variant="ghost" size="sm" onPress={handleCopy} leftIcon={<Copy size={16} color={Colors.urlShortener} />} />
              </View>

              <Button label="Share Link" variant="outline" onPress={handleShare} leftIcon={<Share2 size={18} color={Colors.urlShortener} />} />
            </Card>

            <Text className="text-sm font-bold text-text-primary dark:text-text-primary-dark mx-2 mb-2 mt-4">QR Code for Link</Text>
            <QrGenerator 
              value={result.shortUrl} 
              onReset={handleReset}
              onBackToTools={() => router.replace('/(tabs)/tools')} 
            />
            
            <View className="mt-6 px-2">
              <Button label="Shorten Another" variant="ghost" fullWidth onPress={handleReset} />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
