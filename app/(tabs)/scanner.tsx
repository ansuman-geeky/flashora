import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

export default function ScannerTabScreen() {
  const router = useRouter();
  
  useEffect(() => {
    // Fallback redirect to full-screen camera stack route
    router.replace('/scanner/camera');
  }, [router]);
  
  return <View style={{ flex: 1, backgroundColor: '#000' }} />;
}
