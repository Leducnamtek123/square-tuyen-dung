import httpRequest from '../utils/httpRequest';
import { normalizePaginatedResponse, unwrapDataResponse } from '../utils/apiResponse';
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
  type?: string | number;
  [key: string]: string | number | boolean | null | undefined;
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
  isJobSeeking?: boolean;
  isSeekingJob?: boolean;
}

const formatDateForApi = (value: Date | string | null | undefined): string | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;

  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    // ISO string with T
    if (trimmed.includes('T')) return trimmed.slice(0, 10);
    // MM/DD/YYYY (e.g. 06/14/2005)
    if (trimmed.includes('/')) {
      const parts = trimmed.split('/');
      if (parts.length === 3 && parts[2].length === 4) {
        const monthNum = Number(parts[0]);
        const dayNum = Number(parts[1]);
        const yearNum = Number(parts[2]);
        const d = new Date(yearNum, monthNum - 1, dayNum);
        if (!isNaN(d.getTime())) {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
      }
    }
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return trimmed;
  }

  return undefined;
};

const normalizeProfilePayload = (data: JobSeekerProfileUpdatePayload): JobSeekerProfileUpdatePayload => {
  const payload: JobSeekerProfileUpdatePayload = { ...data };

  if ('birthday' in payload) {
    payload.birthday = formatDateForApi(payload.birthday);
  }
  if ('idCardIssueDate' in payload) {
    payload.idCardIssueDate = formatDateForApi(payload.idCardIssueDate);
  }
  if (payload.gender === '' || payload.gender === null) {
    delete payload.gender;
  }
  if (payload.maritalStatus === '' || payload.maritalStatus === null) {
    delete payload.maritalStatus;
  }
  if (payload.location) {
    const loc = payload.location;
    const hasCity = Boolean(loc.city);
    const hasDistrict = Boolean(loc.district);
    const hasAddress = Boolean(loc.address && String(loc.address).trim());
    if (!hasCity && !hasDistrict && !hasAddress) {
      delete payload.location;
    }
  }

  return payload;
};

const jobSeekerProfileService = {
  getProfile: async (): Promise<JobSeekerProfile> => {
    const url = 'info/profile/';
    const data = await httpRequest.get<JobSeekerProfile>(url);
    return unwrapDataResponse<JobSeekerProfile>(await presignInObject(data));
  },

  updateProfile: async (data: JobSeekerProfileUpdatePayload): Promise<JobSeekerProfile> => {
    const url = 'info/profile/';
    const resData = await httpRequest.put<JobSeekerProfile>(url, normalizeProfilePayload(data));
    return unwrapDataResponse<JobSeekerProfile>(await presignInObject(resData));
  },

  getResumes: async (
    jobSeekerProfileId: IdType,
    params: JobSeekerProfileResumeParams = {}
  ): Promise<PaginatedResponse<Resume>> => {
    if (!jobSeekerProfileId) {
      return { count: 0, results: [] };
    }
    const clean = cleanParams(params);
    if (clean.type && !clean.resumeType) {
      clean.resumeType = clean.type;
    }
    const url = `info/web/job-seeker-profiles/${jobSeekerProfileId}/resumes/`;
    const raw = await httpRequest.get<unknown>(url, { params: clean });
    const data = await presignInObject(raw);
    return normalizePaginatedResponse<Resume>(data);
  },
};

export default jobSeekerProfileService;

