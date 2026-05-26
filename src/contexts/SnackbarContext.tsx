import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Platform, SafeAreaView } from 'react-native';
import { CheckCircle2, AlertCircle, X } from 'lucide-react-native';
import { useTheme } from '@hooks/useTheme';
import { Colors, Shadow } from '@design-system/tokens';

type SnackbarType = 'success' | 'error' | 'info';

interface SnackbarContextState {
  showSnackbar: (message: string, type?: SnackbarType) => void;
}

const SnackbarContext = createContext<SnackbarContextState | undefined>(undefined);

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
}

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const { isDark } = useTheme();
  const [message, setMessage] = useState('');
  const [type, setType] = useState<SnackbarType>('info');
  const [isVisible, setIsVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const timeoutRef = useRef<NodeJS.Timeout>();

  const hideSnackbar = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setIsVisible(false));
  }, [opacity, translateY]);

  const showSnackbar = useCallback((msg: string, msgType: SnackbarType = 'info') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setMessage(msg);
    setType(msgType);
    setIsVisible(true);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    timeoutRef.current = setTimeout(() => {
      hideSnackbar();
    }, 4000);
  }, [hideSnackbar, opacity, translateY]);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      {isVisible && (
        <SafeAreaView style={styles.container} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.snackbar,
              {
                opacity,
                transform: [{ translateY }],
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                ...Shadow.lg,
              },
            ]}
          >
            <View style={styles.content}>
              {type === 'success' && <CheckCircle2 size={20} color="#10B981" />}
              {type === 'error' && <AlertCircle size={20} color="#EF4444" />}
              {type === 'info' && <AlertCircle size={20} color={Colors.primary} />}
              <Text style={[styles.text, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>
                {message}
              </Text>
            </View>
          </Animated.View>
        </SafeAreaView>
      )}
    </SnackbarContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 90 : 80, // Above bottom tab bar
    zIndex: 9999,
  },
  snackbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: '85%',
    maxWidth: '95%',
    marginHorizontal: 16,
    elevation: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});
