import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';
import type { Resume, JobSeekerProfile } from '../types/models';
import type { PaginatedResponse } from '../types/api';

type AnyRecord = Record<string, unknown>;

type IdType = string | number | undefined;

const jobSeekerProfileService = {
  getProfile: async (): Promise<JobSeekerProfile> => {
    const url = 'info/profile/';
    const data = await httpRequest.get<unknown, JobSeekerProfile>(url);
    return presignInObject(data);
  },

  updateProfile: async (data: AnyRecord): Promise<JobSeekerProfile> => {
    const url = 'info/profile/';
    const resData = await httpRequest.put<unknown, JobSeekerProfile>(url, data);
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
    const data = await httpRequest.get<unknown, PaginatedResponse<Resume>>(url, { params: params });
    return presignInObject(data);
  },
};

export default jobSeekerProfileService;
