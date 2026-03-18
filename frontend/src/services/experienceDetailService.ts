import httpRequest from '../utils/httpRequest';

type AnyRecord = Record<string, unknown>;

type IdType = string | number;

const experienceDetailService = {
  addExperienceDetail: (data: AnyRecord): Promise<unknown> => {
    const url = `info/web/experiences-detail/`;
    return httpRequest.post(url, data);
  },

  getExperienceDetailById: (id: IdType): Promise<unknown> => {
    const url = `info/web/experiences-detail/${id}/`;
    return httpRequest.get(url);
  },

  updateExperienceDetailById: (id: IdType, data: AnyRecord): Promise<unknown> => {
    const url = `info/web/experiences-detail/${id}/`;
    return httpRequest.put(url, data);
  },

  deleteExperienceDetailById: (id: IdType): Promise<unknown> => {
    const url = `info/web/experiences-detail/${id}/`;
    return httpRequest.delete(url);
  },
};

export default experienceDetailService;
