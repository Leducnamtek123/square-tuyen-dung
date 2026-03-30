import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';

import type { PaginatedResponse } from '../types/api';
import type { Company, JobPost } from '../types/models';

type AnyRecord = Record<string, unknown>;

type IdType = string | number;

const companyService = {
  getCompany: async (): Promise<Company> => {
    const url = 'info/web/company/';
    const data = await httpRequest.get<unknown, Company>(url);
    return presignInObject(data);
  },

  updateCompany: async (id: IdType, data: AnyRecord): Promise<Company> => {
    const url = `info/web/private-companies/${id}/`;
    const resData = await httpRequest.put<unknown, Company>(url, data);
    return presignInObject(resData);
  },

  updateCompanyImageUrl: async (data: FormData): Promise<Company> => {
    const url = `info/web/private-companies/company-image-url/`;
    const resData = await httpRequest.put<unknown, Company>(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return presignInObject(resData);
  },

  updateCompanyCoverImageUrl: async (data: FormData): Promise<Company> => {
    const url = `info/web/private-companies/company-cover-image-url/`;
    const resData = await httpRequest.put<unknown, Company>(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return presignInObject(resData);
  },

  // public

  getCompanies: async (params: AnyRecord = {}): Promise<PaginatedResponse<Company>> => {
    const url = 'info/web/companies/';
    const data = await httpRequest.get<unknown, PaginatedResponse<Company>>(url, {
      params: params,
    });
    return presignInObject(data);
  },

  getCompanyDetailById: async (slug: IdType): Promise<Company> => {
    const url = `info/web/companies/${slug}/`;
    const data = await httpRequest.get<unknown, Company>(url);
    return presignInObject(data);
  },

  getCompanyJobPostDetailById: async (id: IdType): Promise<JobPost> => {
    const url = `info/web/company/job-posts/${id}/`;
    const data = await httpRequest.get<unknown, JobPost>(url);
    return presignInObject(data);
  },

  followCompany: (slug: IdType): Promise<void> => {
    const url = `info/web/companies/${slug}/followed/`;
    return httpRequest.post(url);
  },

  getTopCompanies: async (): Promise<Company[]> => {
    const url = `info/web/companies/top/`;
    const data = await httpRequest.get<unknown, Company[]>(url);
    return presignInObject(data);
  },
};

export default companyService;
