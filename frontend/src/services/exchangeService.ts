import httpRequest from '../utils/httpRequest';
import { unwrapDataResponse } from '../utils/apiResponse';
import type {
  ExchangeDefinition,
  ExportFormat,
  ExportJobState,
  ImportJobState,
  ImportMode,
  ImportPreviewResponse,
} from '../types/exchange';

export interface CreateExportPayload {
  entity: string;
  format?: ExportFormat;
  fields?: string[];
  filters?: Record<string, any>;
  asyncJob?: boolean;
}

const exchangeService = {
  getDefinitions: async (): Promise<ExchangeDefinition[]> => {
    const res = await httpRequest.get('exchange/definitions/');
    return unwrapDataResponse<ExchangeDefinition[]>(res);
  },

  getDefinition: async (entityType: string): Promise<ExchangeDefinition> => {
    const res = await httpRequest.get(`exchange/definitions/${encodeURIComponent(entityType)}/`);
    return unwrapDataResponse<ExchangeDefinition>(res);
  },

  downloadTemplate: async (entityType: string): Promise<void> => {
    const url = `exchange/templates/${encodeURIComponent(entityType)}/`;
    const response = await httpRequest.get(url, { responseType: 'blob' });
    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${entityType}_template.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },

  createExport: async (
    payloadOrEntity: CreateExportPayload | string,
    format?: ExportFormat,
    fields?: string[],
    filters?: Record<string, any>
  ): Promise<ExportJobState> => {
    let payload: CreateExportPayload;
    if (typeof payloadOrEntity === 'string') {
      payload = {
        entity: payloadOrEntity,
        format: format || 'xlsx',
        fields: fields || [],
        filters: filters || {},
        asyncJob: true,
      };
    } else {
      payload = payloadOrEntity;
    }

    const res = await httpRequest.post('exchange/exports/', {
      entity: payload.entity,
      format: payload.format || 'xlsx',
      fields: payload.fields || [],
      filters: payload.filters || {},
      async_job: payload.asyncJob ?? true,
    });
    return unwrapDataResponse<ExportJobState>(res);
  },

  getExportJob: async (exportId: string): Promise<ExportJobState> => {
    const res = await httpRequest.get(`exchange/exports/${encodeURIComponent(exportId)}/`);
    return unwrapDataResponse<ExportJobState>(res);
  },

  validateImport: async (
    entityOrFile: string | File,
    fileOrEntity: File | string,
    mode: ImportMode = 'create',
    matchBy: string = ''
  ): Promise<ImportPreviewResponse> => {
    let entity: string;
    let file: File;

    if (typeof entityOrFile === 'string') {
      entity = entityOrFile;
      file = fileOrEntity as File;
    } else {
      file = entityOrFile;
      entity = fileOrEntity as string;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('entity', entity);
    formData.append('mode', mode);
    if (matchBy) {
      formData.append('match_by', matchBy);
    }

    const res = await httpRequest.post('exchange/imports/validate/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrapDataResponse<ImportPreviewResponse>(res);
  },

  confirmImport: async (importId: string): Promise<ImportJobState> => {
    const res = await httpRequest.post(`exchange/imports/${encodeURIComponent(importId)}/confirm/`);
    return unwrapDataResponse<ImportJobState>(res);
  },

  getImportJob: async (importId: string): Promise<ImportJobState> => {
    const res = await httpRequest.get(`exchange/imports/${encodeURIComponent(importId)}/`);
    return unwrapDataResponse<ImportJobState>(res);
  },

  downloadErrorReport: async (importId: string): Promise<void> => {
    const url = `exchange/imports/${encodeURIComponent(importId)}/error-report/`;
    window.open(url, '_blank');
  },
};

export default exchangeService;
