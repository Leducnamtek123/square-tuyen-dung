import httpRequest from '../utils/httpRequest';
import { unwrapDataResponse } from '../utils/apiResponse';
import type { CompanyVerification } from '../types/models';

export type CompanyVerificationPayload = Partial<
  Pick<
    CompanyVerification,
    | 'companyName'
    | 'taxCode'
    | 'businessLicense'
    | 'representative'
    | 'phone'
    | 'email'
    | 'website'
    | 'scheduledAt'
    | 'contactName'
    | 'contactPhone'
    | 'notes'
  >
>;

const companyVerificationService = {
  getVerification: (): Promise<CompanyVerification> => {
    return (httpRequest.get('info/web/company-verification/') as Promise<unknown>)
      .then(unwrapDataResponse<CompanyVerification>);
  },
  updateVerification: (data: CompanyVerificationPayload): Promise<CompanyVerification> => {
    return (httpRequest.put('info/web/company-verification/', data) as Promise<unknown>)
      .then(unwrapDataResponse<CompanyVerification>);
  },
};

export default companyVerificationService;
