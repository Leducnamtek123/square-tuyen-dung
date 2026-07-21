import type { AdminCompanyPayload } from './hooks/useCompanies';

export interface CompanyFormData extends AdminCompanyPayload {
  id?: number;
  companyName: string;
  taxCode: string;
  companyEmail: string;
  companyPhone: string;
  employeeSize: number;
  fieldOperation: string;
  websiteUrl?: string | null;
  description?: string | null;
  since?: string | null;
}

export const createEmptyCompanyFormData = (): CompanyFormData => ({
  companyName: '',
  taxCode: '',
  companyEmail: '',
  companyPhone: '',
  employeeSize: 0,
  fieldOperation: '',
  websiteUrl: '',
  description: '',
  since: '',
  location: {
    city: null,
    district: null,
    ward: null,
    address: '',
    lat: null,
    lng: null,
  },
});
