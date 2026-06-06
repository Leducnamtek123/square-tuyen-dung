import httpRequest from '../utils/httpRequest';
import { unwrapDataResponse } from '../utils/apiResponse';

export type TrustReportTargetType = 'job' | 'company';

export interface TrustReportPayload {
  targetType: TrustReportTargetType;
  reason: string;
  message?: string;
  company?: number | null;
  jobPost?: number | null;
}

interface TrustReport {
  id: number;
  targetType: TrustReportTargetType;
  reason: string;
  message?: string;
  status?: string;
  company?: number | null;
  jobPost?: number | null;
  createAt?: string;
}

const trustReportService = {
  createTrustReport: (data: TrustReportPayload): Promise<TrustReport> => {
    const url = 'info/web/trust-reports/';
    return (httpRequest.post(url, data) as Promise<unknown>).then(unwrapDataResponse<TrustReport>);
  },
};

export default trustReportService;
