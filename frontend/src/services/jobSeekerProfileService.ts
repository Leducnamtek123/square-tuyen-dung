import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';
import type { Resume, JobSeekerProfile } from '../types/models';
import type { PaginatedResponse } from '../types/api';


type IdType = string | number | undefined;

const jobSeekerProfileService = {
  getProfile: async (): Promise<JobSeekerProfile> => {
    const url = 'info/profile/';
    const data = await httpRequest.get<unknown, JobSeekerProfile>(url);
    return presignInObject(data);
  },

  updateProfile: async (data: Record<string, unknown>): Promise<JobSeekerProfile> => {
    const url = 'info/profile/';
    const resData = await httpRequest.put<unknown, JobSeekerProfile>(url, data);
    return presignInObject(resData);
  },

  getResumes: async (
    jobSeekerProfileId: IdType,
    params: Record<string, unknown> = {}
  ): Promise<PaginatedResponse<Resume>> => {
    if (!jobSeekerProfileId) {
      return { count: 0, results: [] };
    }
    const url = `info/web/job-seeker-profiles/${jobSeekerProfileId}/resumes/`;
    const raw = await httpRequest.get<unknown, unknown>(url, { params: params });
    const data = (await presignInObject(raw)) as unknown;

    if (Array.isArray(data)) {
      return {
        count: data.length,
        results: data as Resume[],
      };
    }

    const obj = (data ?? {}) as Record<string, unknown>;
    const results = Array.isArray(obj.results)
      ? (obj.results as Resume[])
      : Array.isArray(obj.data)
        ? (obj.data as Resume[])
        : [];
    const count = typeof obj.count === 'number' ? obj.count : results.length;

    return {
      count,
      results,
    };
  },
};

export default jobSeekerProfileService;

