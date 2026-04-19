import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';
import { cleanParams } from '../utils/params';

import type { PaginatedResponse } from '../types/api';
import type { Company, JobPost } from '../types/models';


type IdType = string | number;
export type CompanyListParams = {
  kw?: string;
  cityId?: string | number;
  page?: number;
  pageSize?: number;
  ordering?: string;
};

export interface CompanyUpdatePayload {
  companyName?: string;
  taxCode?: string;
  employeeSize?: number | string;
  fieldOperation?: string;
  companyEmail?: string;
  companyPhone?: string;
  websiteUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  linkedinUrl?: string | null;
  since?: string | Date | null;
  description?: string;
  location?: {
    city?: number | string;
    district?: number | string;
    address?: string;
    lat?: number | string | null;
    lng?: number | string | null;
  } | null;
}

const companyService = {
  getCompany: async (): Promise<Company> => {
    const url = 'info/web/company/';
    const data = await httpRequest.get<Company>(url);
    return presignInObject(data);
  },

  updateCompany: async (id: IdType, data: CompanyUpdatePayload): Promise<Company> => {
    const url = `info/web/private-companies/${id}/`;
    const resData = await httpRequest.put<Company>(url, data);
    return presignInObject(resData);
  },

  updateCompanyImageUrl: async (data: FormData): Promise<Company> => {
    const url = `info/web/private-companies/company-image-url/`;
    const resData = await httpRequest.put<Company>(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return presignInObject(resData);
  },

  updateCompanyCoverImageUrl: async (data: FormData): Promise<Company> => {
    const url = `info/web/private-companies/company-cover-image-url/`;
    const resData = await httpRequest.put<Company>(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return presignInObject(resData);
  },

  // public

  getCompanies: async (params: CompanyListParams = {}): Promise<PaginatedResponse<Company>> => {
    const url = 'info/web/companies/';
    const data = await httpRequest.get<PaginatedResponse<Company>>(url, {
      params: cleanParams(params),
    });
    return presignInObject(data);
  },

  getCompanyDetailById: async (slug: IdType): Promise<Company> => {
    const url = `info/web/companies/${slug}/`;
    const data = await httpRequest.get<Company>(url);
    return presignInObject(data);
  },

  getCompanyJobPostDetailById: async (id: IdType): Promise<JobPost> => {
    const url = `info/web/company/job-posts/${id}/`;
    const data = await httpRequest.get<JobPost>(url);
    return presignInObject(data);
  },

  followCompany: (slug: IdType): Promise<{ isFollowed: boolean }> => {
    const url = `info/web/companies/${slug}/followed/`;
    return httpRequest.post(url) as Promise<{ isFollowed: boolean }>;
  },

  getTopCompanies: async (): Promise<Company[]> => {
    const url = `info/web/companies/top/`;
    const data = await httpRequest.get<Company[]>(url);
    return presignInObject(data);
  },
};

export default companyService;


