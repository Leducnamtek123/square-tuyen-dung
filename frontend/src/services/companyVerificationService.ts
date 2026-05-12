import httpRequest from '../utils/httpRequest';
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
    return httpRequest.get<CompanyVerification>('info/web/company-verification/');
  },
  updateVerification: (data: CompanyVerificationPayload): Promise<CompanyVerification> => {
    return httpRequest.put<CompanyVerification>('info/web/company-verification/', data);
  },
};

export default companyVerificationService;
