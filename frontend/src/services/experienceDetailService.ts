import httpRequest from '../utils/httpRequest';
import type { ExperienceDetail } from '../types/models';

type IdType = string | number;

/** Input for creating/updating experience detail — id is optional (only for update). */
export interface ExperienceDetailInput {
  id?: string | number;
  jobName?: string;
  companyName?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  description?: string | null;
  resumeSlug?: string;
  resume?: string;
}

const experienceDetailService = {
  addExperienceDetail: (data: ExperienceDetailInput): Promise<ExperienceDetail> => {
    const url = `info/web/experiences-detail/`;
    return httpRequest.post(url, data);
  },

  getExperienceDetailById: (id: IdType): Promise<ExperienceDetail> => {
    const url = `info/web/experiences-detail/${id}/`;
    return httpRequest.get(url);
  },

  updateExperienceDetailById: (id: IdType, data: ExperienceDetailInput): Promise<ExperienceDetail> => {
    const url = `info/web/experiences-detail/${id}/`;
    return httpRequest.put(url, data);
  },

  deleteExperienceDetailById: (id: IdType): Promise<void> => {
    const url = `info/web/experiences-detail/${id}/`;
    return httpRequest.delete(url);
  },
};

export default experienceDetailService;
