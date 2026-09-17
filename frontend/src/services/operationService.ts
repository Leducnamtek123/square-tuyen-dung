import httpRequest from '@/utils/httpRequest';
import type {
  ActiveOperationsResponse,
  OperationPayload,
} from '@/components/operation/types';

export interface CancelOperationResponse {
  success: boolean;
  operation: OperationPayload;
}

const unwrap = <T>(res: any): T => {
  return (res?.data !== undefined && (res?.id === undefined && res?.results === undefined && res?.success === undefined))
    ? (res.data as T)
    : (res as T);
};

export const operationService = {
  getOperation: async (id: string): Promise<OperationPayload> => {
    const res = await httpRequest.get(`api/v1/operations/${id}/`);
    return unwrap<OperationPayload>(res);
  },

  getActiveOperations: async (params?: { type?: string }): Promise<ActiveOperationsResponse> => {
    const res = await httpRequest.get('api/v1/operations/active/', { params });
    return unwrap<ActiveOperationsResponse>(res);
  },

  cancelOperation: async (id: string): Promise<CancelOperationResponse> => {
    const res = await httpRequest.post(`api/v1/operations/${id}/cancel/`);
    return unwrap<CancelOperationResponse>(res);
  },
};

export default operationService;
