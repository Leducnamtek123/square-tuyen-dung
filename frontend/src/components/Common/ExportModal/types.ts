export type ExportFormat = 'xlsx' | 'csv';

export type ExportScope = 'all' | 'filtered' | 'selected';

export type ExportStatus = 'idle' | 'config' | 'generating' | 'success' | 'error';

export interface ExportColumn {
  id: string;
  label: string;
  checked: boolean;
  accessorKey?: string;
  getValue?: (row: any) => any;
}

export interface ScopeCount {
  all?: number;
  filtered?: number;
  selected?: number;
}

export interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  defaultFileName?: string;
  columns: ExportColumn[];
  fetchData: (scope: ExportScope) => Promise<Record<string, any>[]>;
  totalRecords?: ScopeCount;
  onExportSuccess?: (fileName: string, format: ExportFormat, recordCount: number) => void;
}

export interface ExportOptionsState {
  fileName: string;
  format: ExportFormat;
  scope: ExportScope;
  columns: ExportColumn[];
}
