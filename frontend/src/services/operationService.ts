import httpRequest from '@/utils/httpRequest';
import { unwrapDataResponse } from '@/utils/apiResponse';
import type {
  ActiveOperationsResponse,
  OperationPayload,
} from '@/components/operation/types';

export interface CancelOperationResponse {
  success: boolean;
  operation: OperationPayload;
}

export const operationService = {
  getOperation: async (id: string): Promise<OperationPayload> => {
    const res = await httpRequest.get(`operations/${id}/`);
    return unwrapDataResponse<OperationPayload>(res);
  },

  getActiveOperations: async (params?: { type?: string }): Promise<ActiveOperationsResponse> => {
    const res = await httpRequest.get('operations/active/', { params });
    return unwrapDataResponse<ActiveOperationsResponse>(res);
  },

  cancelOperation: async (id: string): Promise<CancelOperationResponse> => {
    const res = await httpRequest.post(`operations/${id}/cancel/`);
    return unwrapDataResponse<CancelOperationResponse>(res);
  },
};

export default operationService;
