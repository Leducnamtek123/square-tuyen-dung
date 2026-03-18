import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';
import type { Resume } from '../types/models';
import type { PaginatedResponse } from '../types/api';

type AnyRecord = Record<string, unknown>;

type IdType = string | number | undefined;

const jobSeekerProfileService = {
  getProfile: async (): Promise<any> => {
    const url = 'info/profile/';
    const data = await httpRequest.get(url);
    return presignInObject(data);
  },

  updateProfile: async (data: AnyRecord): Promise<any> => {
    const url = 'info/profile/';
    const resData = await httpRequest.put(url, data);
    return presignInObject(resData);
  },

  getResumes: async (
    jobSeekerProfileId: IdType,
    params: AnyRecord = {}
  ): Promise<PaginatedResponse<Resume>> => {
    if (!jobSeekerProfileId) {
      return { count: 0, results: [] };
    }
    const url = `info/web/job-seeker-profiles/${jobSeekerProfileId}/resumes/`;
    const data = await httpRequest.get(url, { params: params });
    return presignInObject(data) as unknown as PaginatedResponse<Resume>;
  },
};

export default jobSeekerProfileService;
