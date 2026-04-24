import httpRequest from '../utils/httpRequest';
import type { EducationDetail } from '../types/models';

type IdType = string | number;

interface EducationDetailInput {
  id?: string | number;
  degreeName?: string;
  major?: string;
  trainingPlaceName?: string;
  startDate?: string | Date | null;
  completedDate?: string | Date | null;
  description?: string | null;
  resumeSlug?: string;
  resume?: string;
}

const educationDetailService = {
  addEducationsDetail: (data: EducationDetailInput): Promise<EducationDetail> => {
    const url = `info/web/educations-detail/`;
    return httpRequest.post(url, data);
  },

  getEducationDetailById: (id: IdType): Promise<EducationDetail> => {
    const url = `info/web/educations-detail/${id}/`;
    return httpRequest.get(url);
  },

  updateEducationDetailById: (id: IdType, data: EducationDetailInput): Promise<EducationDetail> => {
    const url = `info/web/educations-detail/${id}/`;
    return httpRequest.put(url, data);
  },

  deleteEducationDetailById: (id: IdType): Promise<void> => {
    const url = `info/web/educations-detail/${id}/`;
    return httpRequest.delete(url);
  },
};

export default educationDetailService;
