import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';

type AnyRecord = Record<string, unknown>;

type IdType = string | number;

const companyService = {
  getCompany: async (): Promise<unknown> => {
    const url = 'info/web/company/';
    const data = await httpRequest.get(url);
    return presignInObject(data);
  },

  updateCompany: async (id: IdType, data: AnyRecord): Promise<unknown> => {
    const url = `info/web/private-companies/${id}/`;
    const resData = await httpRequest.put(url, data);
    return presignInObject(resData);
  },

  updateCompanyImageUrl: async (data: FormData): Promise<unknown> => {
    const url = `info/web/private-companies/company-image-url/`;
    const resData = await httpRequest.put(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return presignInObject(resData);
  },

  updateCompanyCoverImageUrl: async (data: FormData): Promise<unknown> => {
    const url = `info/web/private-companies/company-cover-image-url/`;
    const resData = await httpRequest.put(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return presignInObject(resData);
  },

  // public

  getCompanies: async (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'info/web/companies/';
    const data = await httpRequest.get(url, {
      params: params,
    });
    return presignInObject(data);
  },

  getCompanyDetailById: async (slug: IdType): Promise<unknown> => {
    const url = `info/web/companies/${slug}/`;
    const data = await httpRequest.get(url);
    return presignInObject(data);
  },

  getCompanyJobPostDetailById: async (id: IdType): Promise<unknown> => {
    const url = `info/web/company/job-posts/${id}/`;
    const data = await httpRequest.get(url);
    return presignInObject(data);
  },

  followCompany: (slug: IdType): Promise<unknown> => {
    const url = `info/web/companies/${slug}/followed/`;
    return httpRequest.post(url);
  },

  getTopCompanies: async (): Promise<unknown> => {
    const url = `info/web/companies/top/`;
    const data = await httpRequest.get(url);
    return presignInObject(data);
  },
};

export default companyService;
