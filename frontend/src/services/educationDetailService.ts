import httpRequest from '../utils/httpRequest';


type IdType = string | number;

const educationDetailService = {
  addEducationsDetail: (data: Record<string, unknown>): Promise<unknown> => {
    const url = `info/web/educations-detail/`;
    return httpRequest.post(url, data);
  },

  getEducationDetailById: (id: IdType): Promise<unknown> => {
    const url = `info/web/educations-detail/${id}/`;
    return httpRequest.get(url);
  },

  updateEducationDetailById: (id: IdType, data: Record<string, unknown>): Promise<unknown> => {
    const url = `info/web/educations-detail/${id}/`;
    return httpRequest.put(url, data);
  },

  deleteEducationDetailById: (id: IdType): Promise<unknown> => {
    const url = `info/web/educations-detail/${id}/`;
    return httpRequest.delete(url);
  },
};

export default educationDetailService;

