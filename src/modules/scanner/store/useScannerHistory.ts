import { create } from 'zustand';

export interface ScanItem {
  id: string;
  name: string;
  date: number;
  size: number;
  thumbnailUri: string | null;
  pdfUri: string | null;
  imageUris: string[];
}

export interface ScannerHistoryState {
  scans: ScanItem[];
  addScan: (scan: ScanItem) => void;
  removeScan: (id: string) => void;
  renameScan: (id: string, newName: string) => void;
  clearHistory: () => void;
}

// In a real app, you would persist this using AsyncStorage or MMKV
export const useScannerHistory = create<ScannerHistoryState>((set) => ({
  scans: [],
  addScan: (scan) => set((state) => ({ scans: [scan, ...state.scans] })),
  removeScan: (id) =>
    set((state) => ({ scans: state.scans.filter((s) => s.id !== id) })),
  renameScan: (id, newName) =>
    set((state) => ({
      scans: state.scans.map((s) => (s.id === id ? { ...s, name: newName } : s)),
    })),
  clearHistory: () => set({ scans: [] }),
}));
