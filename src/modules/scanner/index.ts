/**
 * Scanner Module — Public API
 *
 * Exposes all screens, components, services and stores for the scanner module.
 */

export { ScannerHome } from './screens/ScannerHome';
export { ScannerExport } from './screens/ScannerExport';
export { ScanItemCard } from './components/ScanItemCard';
export { scanAndSave } from './services/scannerService';
export { startScan } from './native/DocumentScanner';
export { useScannerHistory } from './store/useScannerHistory';
export type { ScanItem, ScannerHistoryState } from './store/useScannerHistory';
export type { DocumentScannerResult, DocumentScannerOptions } from './native/DocumentScanner';
