import { ImportMode, ImportJobState, ImportPreviewResponse, ExchangeDefinition } from '@/types/exchange';

export interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  entity: string;
  title?: string;
  onSuccess?: (result: ImportJobState) => void;
}

export type ImportStep = 'upload' | 'preview' | 'committing' | 'result';

export interface ImportConfigState {
  file: File | null;
  mode: ImportMode;
  matchBy: string;
}
