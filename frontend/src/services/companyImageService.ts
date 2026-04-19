import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';

import type { CompanyImage } from '../types/models';
import type { PaginatedResponse } from '../types/api';

type IdType = string | number;

const companyImageService = {
  getCompanyImages: async (): Promise<PaginatedResponse<CompanyImage>> => {
    const url = 'info/web/company-images/';
    const data = await httpRequest.get<PaginatedResponse<CompanyImage>>(url);
    return presignInObject(data);
  },

  addCompanyImage: async (data: FormData): Promise<CompanyImage> => {
    const url = 'info/web/company-images/';
    const resData = await httpRequest.post<CompanyImage>(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return presignInObject(resData);
  },

  deleteCompanyImage: (id: IdType): Promise<void> => {
    const url = `info/web/company-images/${id}/`;
    return httpRequest.delete(url);
  },
};

export default companyImageService;
