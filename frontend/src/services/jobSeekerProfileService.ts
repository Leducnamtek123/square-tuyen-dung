import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';
import type { Resume, JobSeekerProfile, Location } from '../types/models';
import type { PaginatedResponse } from '../types/api';
import { cleanParams } from '../utils/params';


type IdType = string | number | undefined;
export type JobSeekerProfileResumeParams = {
  page?: number;
  pageSize?: number;
  ordering?: string;
  resumeType?: string | number;
};

export interface JobSeekerProfileUpdatePayload {
  phone?: string | null;
  birthday?: string | Date | null;
  gender?: 'M' | 'F' | 'O' | null | string;
  maritalStatus?: 'S' | 'M' | null | string;
  user?: {
    fullName?: string;
  };
  location?: Partial<Location> & {
    city?: number | string;
    district?: number | string;
    address?: string;
  };
  idCardNumber?: string;
  idCardIssueDate?: Date | string | null;
  idCardIssuePlace?: string;
  taxCode?: string;
  socialInsuranceNo?: string;
  permanentAddress?: string;
  contactAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

const formatDateForApi = (value: Date | string | null | undefined): string | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;

  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    return trimmed.includes('T') ? trimmed.slice(0, 10) : trimmed;
  }

  return undefined;
};

const normalizeProfilePayload = (data: JobSeekerProfileUpdatePayload): JobSeekerProfileUpdatePayload => ({
  ...data,
  birthday: formatDateForApi(data.birthday),
  idCardIssueDate: formatDateForApi(data.idCardIssueDate),
});

const jobSeekerProfileService = {
  getProfile: async (): Promise<JobSeekerProfile> => {
    const url = 'info/profile/';
    const data = await httpRequest.get<JobSeekerProfile>(url);
    return presignInObject(data);
  },

  updateProfile: async (data: JobSeekerProfileUpdatePayload): Promise<JobSeekerProfile> => {
    const url = 'info/profile/';
    const resData = await httpRequest.put<JobSeekerProfile>(url, normalizeProfilePayload(data));
    return presignInObject(resData);
  },

  getResumes: async (
    jobSeekerProfileId: IdType,
    params: JobSeekerProfileResumeParams = {}
  ): Promise<PaginatedResponse<Resume>> => {
    if (!jobSeekerProfileId) {
      return { count: 0, results: [] };
    }
    const url = `info/web/job-seeker-profiles/${jobSeekerProfileId}/resumes/`;
    const raw = await httpRequest.get<ResumeListResponse | Resume[]>(url, { params: cleanParams(params) });
    const data = await presignInObject(raw);

    if (Array.isArray(data)) {
      return {
        count: data.length,
        results: data,
      };
    }

    const obj = data ?? {};
    const results = Array.isArray(obj.results)
      ? obj.results
      : Array.isArray(obj.data)
        ? obj.data
        : [];
    const count = typeof obj.count === 'number' ? obj.count : results.length;

    return {
      count,
      results,
    };
  },
};

export default jobSeekerProfileService;


type ResumeListResponse = {
  count?: number;
  results?: Resume[];
  data?: Resume[];
};

