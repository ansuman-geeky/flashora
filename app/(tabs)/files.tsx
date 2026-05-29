import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@hooks/useTheme';
import { Colors } from '@design-system/tokens';
import { ScreenHeader } from '@components/ScreenHeader';
import { Input } from '@components/Input';
import { EmptyState } from '@components/EmptyState';
import { getSavedFiles, SavedFile, deleteSavedFile, FileCategory } from '../../src/services/storageService';
import { Search, Folder, File, Grid, List, Share2, Trash2, ExternalLink } from 'lucide-react-native';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import { useSnackbar } from '../../src/contexts/SnackbarContext';

export default function FilesScreen() {
  const { colors, isDark } = useTheme();
  const { showSnackbar } = useSnackbar();
  
  const [files, setFiles] = useState<SavedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedCategory, setSelectedCategory] = useState<FileCategory | 'All'>('All');

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSavedFiles();
      setFiles(data);
    } catch (e) {
      showSnackbar('Failed to load files', 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  const handleShare = async (file: SavedFile) => {
    try {
      await Sharing.shareAsync(file.uri);
    } catch (e) {
      showSnackbar('Sharing failed', 'error');
    }
  };

  const handleOpen = async (file: SavedFile) => {
    try {
      if (Platform.OS === 'android') {
        const { NativeModules } = require('react-native');
        if (NativeModules.StorageModule && NativeModules.StorageModule.openFile) {
          let mimeType = 'application/pdf';
          if (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) mimeType = 'image/jpeg';
          if (file.name.endsWith('.png')) mimeType = 'image/png';
          
          await NativeModules.StorageModule.openFile(file.uri, mimeType);
        } else {
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: file.uri,
            flags: 1,
          });
        }
      } else {
        await Sharing.shareAsync(file.uri);
      }
    } catch (e) {
      showSnackbar('Could not open file', 'error');
    }
  };

  const handleDelete = async (file: SavedFile) => {
    try {
      await deleteSavedFile(file);
      setFiles(prev => prev.filter(f => f.id !== file.id));
      showSnackbar('File deleted', 'success');
    } catch (e) {
      showSnackbar('Failed to delete file', 'error');
    }
  };

  const categories: (FileCategory | 'All')[] = ['All', 'PDF', 'Scanner', 'Images', 'QR', 'Compressed', 'Converted'];

  const filteredFiles = files.filter(f => {
    if (selectedCategory !== 'All' && f.category !== selectedCategory) return false;
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const renderItem = ({ item }: { item: SavedFile }) => {
    const isGrid = viewMode === 'grid';
    
    return (
      <Pressable 
        onPress={() => handleOpen(item)}
        className={`bg-surface dark:bg-surface-dark rounded-xl border border-outlineVariant dark:border-outlineVariant-dark p-3 ${isGrid ? 'flex-1 m-1 items-center' : 'mb-2 flex-row items-center'}`}
      >
        <View className={`${isGrid ? 'mb-2' : 'mr-3'} p-2 rounded-full bg-primary/10`}>
          <File size={isGrid ? 32 : 24} color={Colors.primary} />
        </View>
        <View className={isGrid ? 'items-center' : 'flex-1'}>
          <Text className="text-sm font-medium text-onSurface dark:text-onSurface-dark" numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="text-xs text-onSurfaceVariant dark:text-onSurfaceVariant-dark mt-0.5">
            {(item.size / 1024).toFixed(1)} KB • {new Date(item.timestamp).toLocaleDateString()}
          </Text>
        </View>
        <View className={isGrid ? 'flex-row mt-2 space-x-2' : 'flex-row space-x-1 ml-2'}>
          <Pressable onPress={() => handleShare(item)} className="p-1.5">
            <Share2 size={18} color={colors.onSurfaceVariant} />
          </Pressable>
          <Pressable onPress={() => handleDelete(item)} className="p-1.5">
            <Trash2 size={18} color="#EF4444" />
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg dark:bg-bg-dark" style={{ backgroundColor: colors.bg }}>
      <ScreenHeader title="Files" />
      
      <View className="px-4 py-2">
        <Input 
          placeholder="Search files..." 
          value={search} 
          onChangeText={setSearch} 
          leftIcon={<Search size={20} color={colors.onSurfaceVariant} />}
        />
      </View>

      <View className="px-4 py-2 flex-row items-center justify-between">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedCategory(item)}
              className={`px-4 py-1.5 rounded-full mr-2 border ${
                selectedCategory === item 
                  ? 'bg-primary border-primary' 
                  : 'bg-transparent border-outlineVariant dark:border-outlineVariant-dark'
              }`}
            >
              <Text className={`text-sm font-medium ${selectedCategory === item ? 'text-white' : 'text-onSurfaceVariant dark:text-onSurfaceVariant-dark'}`}>
                {item}
              </Text>
            </Pressable>
          )}
        />
        <Pressable 
          onPress={() => setViewMode(prev => prev === 'list' ? 'grid' : 'list')}
          className="ml-2 p-2 rounded-full bg-surface dark:bg-surface-dark border border-outlineVariant dark:border-outlineVariant-dark"
        >
          {viewMode === 'list' ? <Grid size={20} color={colors.onSurface} /> : <List size={20} color={colors.onSurface} />}
        </Pressable>
      </View>

      <FlatList
        key={viewMode}
        data={filteredFiles}
        keyExtractor={item => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadFiles} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon={<Folder size={48} color={colors.onSurfaceVariant} />}
              title="No files found"
              description="Generated files will automatically appear here."
            />
          ) : null
        }
      />
    </SafeAreaView>
  );
}
