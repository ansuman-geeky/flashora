import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { FileText, Image as ImageIcon, FileType } from 'lucide-react-native';
import { ScannerColors } from '../constants';

export type ExportFormatId = 'pdf' | 'image' | 'docx';

interface ExportFormatCardProps {
  id: ExportFormatId;
  name: string;
  description: string;
  isSelected: boolean;
  isPremium?: boolean;
  onSelect: (id: ExportFormatId) => void;
}

export function ExportFormatCard({
  id,
  name,
  description,
  isSelected,
  isPremium,
  onSelect
}: ExportFormatCardProps) {
  
  const getIcon = () => {
    const size = 18;
    switch (id) {
      case 'pdf': return <FileText size={size} color={ScannerColors.pdfIconColor} />;
      case 'image': return <ImageIcon size={size} color={ScannerColors.imgIconColor} />;
      case 'docx': return <FileText size={size} color={ScannerColors.docIconColor} />; // Use FileText as per spec
      default: return null;
    }
  };

  const getIconBg = () => {
    switch (id) {
      case 'pdf': return ScannerColors.pdfIconBg;
      case 'image': return ScannerColors.imgIconBg;
      case 'docx': return ScannerColors.docIconBg;
      default: return ScannerColors.bgElevated;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer
      ]}
      onPress={() => onSelect(id)}
      activeOpacity={0.8}
    >
      <View style={[styles.iconBox, { backgroundColor: getIconBg() }]}>
        {getIcon()}
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      {isPremium ? (
        <View style={styles.proBadge}>
          <Text style={styles.proText}>PRO</Text>
        </View>
      ) : (
        <View style={[styles.radio, isSelected && styles.radioChecked]}>
          {isSelected && <View style={styles.radioDot} />}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: ScannerColors.bgCard,
    borderWidth: 0.5,
    borderColor: ScannerColors.border,
    marginBottom: 8,
    gap: 12,
  },
  selectedContainer: {
    backgroundColor: ScannerColors.accentBg,
    borderColor: ScannerColors.accentBorder,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: '500',
    color: ScannerColors.textPrimary,
    marginBottom: 2,
  },
  description: {
    fontSize: 11,
    color: ScannerColors.textTertiary,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: ScannerColors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioChecked: {
    borderColor: ScannerColors.accent,
    backgroundColor: ScannerColors.accent,
  },
  radioDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFFFFF',
  },
  proBadge: {
    backgroundColor: ScannerColors.premiumBg,
    borderColor: ScannerColors.premiumBorder,
    borderWidth: 0.5,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 7,
  },
  proText: {
    fontSize: 10,
    color: ScannerColors.premiumText,
    fontWeight: 'bold',
  },
});
