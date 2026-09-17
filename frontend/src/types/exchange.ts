export type ExportFormat = 'xlsx' | 'csv';

export type ImportMode = 'create' | 'update' | 'upsert';

export interface FieldChoice {
  value: string | number;
  label: string;
}

export interface ExportFieldDef {
  key: string;
  label: string;
  defaultChecked: boolean;
  description?: string;
}

export interface ImportFieldDef {
  key: string;
  label: string;
  fieldType: 'string' | 'email' | 'phone' | 'date' | 'number' | 'enum' | 'boolean' | 'relation';
  required: boolean;
  example?: string;
  description?: string;
  choices?: FieldChoice[];
}

export interface ExchangeDefinition {
  entityType: string;
  label: string;
  supportsExport: boolean;
  supportsImport: boolean;
  exportFields: ExportFieldDef[];
  importFields: ImportFieldDef[];
  matchingKeys: string[];
  defaultMatchingKey: string;
  supportedModes: ImportMode[];
  atomicImport: boolean;
}

export interface ExportJobState {
  exportId: string;
  entity: string;
  format: ExportFormat;
  fileName?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'expired';
  progress: number;
  currentStep: string;
  totalRows: number;
  processedRows: number;
  downloadUrl?: string;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ValidationIssueItem {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning';
  value?: string | null;
}

export interface ValidatedRowItem {
  rowNumber: number;
  data: Record<string, any>;
  action: 'create' | 'update' | 'skip';
  errors: ValidationIssueItem[];
}

export interface ErrorSummaryItem {
  row: number;
  field: string;
  code: string;
  message: string;
  severity?: string;
  value?: any;
}

export interface ImportPreviewResponse {
  importId: string;
  status: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  warningRows: number;
  preview: ValidatedRowItem[];
  errorSummary: ErrorSummaryItem[];
  errorReportUrl?: string;
}

export interface ImportJobState {
  importId: string;
  entity: string;
  mode: ImportMode;
  matchBy: string;
  fileName: string;
  status: 'uploaded' | 'parsing' | 'validating' | 'awaiting_confirmation' | 'committing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentStep: string;
  totalRows: number;
  processedRows: number;
  validRows: number;
  invalidRows: number;
  warningRows: number;
  createdRows: number;
  updatedRows: number;
  failedRows: number;
  errorReportUrl?: string;
  errorSummary?: ErrorSummaryItem[];
  createdAt: string;
  completedAt?: string;
}

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ActivityStep {
  id: string;
  label: string;
  status: StepStatus;
  detail?: string;
}
