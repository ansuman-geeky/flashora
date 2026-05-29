import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Platform, SafeAreaView, Pressable } from 'react-native';
import { CheckCircle2, AlertCircle, X } from 'lucide-react-native';
import { useTheme } from '@hooks/useTheme';
import { Colors, Shadow } from '@design-system/tokens';

type SnackbarType = 'success' | 'error' | 'info';

export interface SnackbarAction {
  label: string;
  onPress: () => void;
}

interface SnackbarContextState {
  showSnackbar: (message: string, type?: SnackbarType, action?: SnackbarAction, secondaryAction?: SnackbarAction) => void;
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
  const [action, setAction] = useState<SnackbarAction | undefined>();
  const [secondaryAction, setSecondaryAction] = useState<SnackbarAction | undefined>();
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

  const showSnackbar = useCallback((msg: string, msgType: SnackbarType = 'info', actionBtn?: SnackbarAction, secondaryActionBtn?: SnackbarAction) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setMessage(msg);
    setType(msgType);
    setAction(actionBtn);
    setSecondaryAction(secondaryActionBtn);
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

    // Only auto-hide if there are no action buttons, otherwise let user interact
    if (!actionBtn && !secondaryActionBtn) {
      timeoutRef.current = setTimeout(() => {
        hideSnackbar();
      }, 4000);
    } else {
      timeoutRef.current = setTimeout(() => {
        hideSnackbar();
      }, 6000); // Give more time if there are buttons
    }
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
              (action || secondaryAction) && styles.snackbarWithActions
            ]}
          >
            <View style={styles.content}>
              {type === 'success' && <CheckCircle2 size={20} color="#10B981" />}
              {type === 'error' && <AlertCircle size={20} color="#EF4444" />}
              {type === 'info' && <AlertCircle size={20} color={Colors.primary} />}
              <Text style={[styles.text, { color: isDark ? '#F1F5F9' : '#0F172A' }]}>
                {message}
              </Text>
              
              {(!action && !secondaryAction) && (
                <Pressable onPress={hideSnackbar} style={styles.closeButton}>
                  <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
                </Pressable>
              )}
            </View>
            
            {(action || secondaryAction) && (
              <View style={styles.actionsContainer}>
                {action && (
                  <Pressable 
                    onPress={() => { action.onPress(); hideSnackbar(); }}
                    style={styles.actionButton}
                  >
                    <Text style={[styles.actionText, { color: Colors.primary }]}>{action.label}</Text>
                  </Pressable>
                )}
                {secondaryAction && (
                  <Pressable 
                    onPress={() => { secondaryAction.onPress(); hideSnackbar(); }}
                    style={styles.actionButton}
                  >
                    <Text style={[styles.actionText, { color: Colors.primary }]}>{secondaryAction.label}</Text>
                  </Pressable>
                )}
              </View>
            )}
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
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: '85%',
    maxWidth: '95%',
    marginHorizontal: 16,
    elevation: 6,
  },
  snackbarWithActions: {
    paddingBottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  closeButton: {
    padding: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontWeight: '600',
    fontSize: 14,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});
