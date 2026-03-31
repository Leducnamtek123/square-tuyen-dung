import httpRequest from '../utils/httpRequest';


type IdType = string | number;

const experienceDetailService = {
  addExperienceDetail: (data: Record<string, unknown>): Promise<unknown> => {
    const url = `info/web/experiences-detail/`;
    return httpRequest.post(url, data);
  },

  getExperienceDetailById: (id: IdType): Promise<unknown> => {
    const url = `info/web/experiences-detail/${id}/`;
    return httpRequest.get(url);
  },

  updateExperienceDetailById: (id: IdType, data: Record<string, unknown>): Promise<unknown> => {
    const url = `info/web/experiences-detail/${id}/`;
    return httpRequest.put(url, data);
  },

  deleteExperienceDetailById: (id: IdType): Promise<unknown> => {
    const url = `info/web/experiences-detail/${id}/`;
    return httpRequest.delete(url);
  },
};

export default experienceDetailService;

