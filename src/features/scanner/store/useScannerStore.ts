import { create } from 'zustand';
import type { ScanSession, ScannedPage, DocumentQuad, EnhancementMode } from '../types/scanner';

export interface ScannerStore {
  // State
  session:         ScanSession | null;
  flashMode:       'off' | 'on' | 'auto';
  enhancementMode: EnhancementMode;
  isProcessing:    boolean;
  error:           string | null;

  // Actions
  startSession:    () => void;
  addPage:         (page: ScannedPage) => void;
  removePage:      (pageId: string) => void;
  reorderPages:    (fromIndex: number, toIndex: number) => void;
  updatePageQuad:  (pageId: string, quad: DocumentQuad) => void;
  setFlashMode:    (mode: 'off' | 'on' | 'auto') => void;
  setEnhancement:  (mode: EnhancementMode) => void;
  setProcessing:   (val: boolean) => void;
  setError:        (msg: string | null) => void;
  clearSession:    () => void;
}

export const useScannerStore = create<ScannerStore>((set) => ({
  session: null,
  flashMode: 'off',
  enhancementMode: 'auto',
  isProcessing: false,
  error: null,

  startSession: () => set({
    session: {
      id: Date.now().toString(),
      pages: [],
      createdAt: Date.now(),
    },
    error: null,
  }),

  addPage: (page) => set((state) => ({
    session: state.session
      ? { ...state.session, pages: [...state.session.pages, page] }
      : null
  })),

  removePage: (pageId) => set((state) => ({
    session: state.session
      ? { ...state.session, pages: state.session.pages.filter(p => p.id !== pageId) }
      : null
  })),

  reorderPages: (fromIndex, toIndex) => set((state) => {
    if (!state.session) return state;
    const newPages = [...state.session.pages];
    const [movedItem] = newPages.splice(fromIndex, 1);
    if (movedItem) {
      newPages.splice(toIndex, 0, movedItem);
    }
    return { session: { ...state.session, pages: newPages } };
  }),

  updatePageQuad: (pageId, quad) => set((state) => ({
    session: state.session
      ? {
          ...state.session,
          pages: state.session.pages.map(p => p.id === pageId ? { ...p, quad } : p)
        }
      : null
  })),

  setFlashMode: (mode) => set({ flashMode: mode }),
  
  setEnhancement: (mode) => set({ enhancementMode: mode }),
  
  setProcessing: (val) => set({ isProcessing: val }),
  
  setError: (msg) => set({ error: msg }),
  
  clearSession: () => set({ session: null, error: null }),
}));
