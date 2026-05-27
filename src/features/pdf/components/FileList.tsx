/**
 * FileList — Displays selected files with remove action
 */

import React from 'react';
import { View, Text } from 'react-native';
import { FileText, X } from 'lucide-react-native';
import { Card } from '@components/Card';
import { IconButton } from '@components/IconButton';
import { Colors } from '@design-system/tokens';
import { formatFileSize } from '@utils/formatters';
import { useTheme } from '@hooks/useTheme';
import type { FileInfo } from '@utils/fileUtils';

interface FileListProps {
  files: FileInfo[];
  onRemove?: (index: number) => void;
}

export function FileList({ files, onRemove }: FileListProps) {
  const { colors } = useTheme();

  if (files.length === 0) return null;

  return (
    <View className="px-2 mt-1.5">
      <Text className="text-sm font-medium text-onSurfaceVariant dark:text-onSurfaceVariant-dark mb-1">
        {files.length} file{files.length !== 1 ? 's' : ''} selected
      </Text>
      {files.map((file, index) => (
        <Card key={`${file.name}-${index}`} variant="flat" className="flex-row items-center p-1.5 mb-1">
          <View className="w-[36px] h-[36px] rounded-sm bg-error-muted items-center justify-center mr-1.5">
            <FileText size={18} color={Colors.pdf} />
          </View>
          <View className="flex-1 mr-1">
            <Text className="text-sm font-medium text-onSurface dark:text-onSurface-dark" numberOfLines={1}>
              {file.name}
            </Text>
            <Text className="text-xs text-outline">
              {formatFileSize(file.size)}
            </Text>
          </View>
          {onRemove && (
            <IconButton
              icon={<X size={16} color={colors.textTertiary} />}
              onPress={() => onRemove(index)}
              size="sm"
              variant="ghost"
              accessibilityLabel={`Remove ${file.name}`}
            />
          )}
        </Card>
      ))}
    </View>
  );
}
