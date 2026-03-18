import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';

type IdType = string | number;

const companyImageService = {
  getCompanyImages: async (): Promise<unknown> => {
    const url = 'info/web/company-images/';
    const data = await httpRequest.get(url);
    return presignInObject(data);
  },

  addCompanyImage: async (data: FormData): Promise<unknown> => {
    const url = 'info/web/company-images/';
    const resData = await httpRequest.post(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return presignInObject(resData);
  },

  deleteCompanyImage: (id: IdType): Promise<unknown> => {
    const url = `info/web/company-images/${id}/`;
    return httpRequest.delete(url);
  },
};

export default companyImageService;
