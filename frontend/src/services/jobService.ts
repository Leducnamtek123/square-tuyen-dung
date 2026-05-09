import httpRequest from '../utils/httpRequest';
import { cleanParams } from '../utils/params';
import type { JobPost } from '../types/models';
import type { ExportTableRow, PaginatedResponse } from '../types/api';

type IdType = string | number;

/* ── Request DTOs ─────────────────────────────────────────────────────── */

export type GetJobPostsParams = {
  kw?: string;
  companyId?: string | number;
  excludeSlug?: string;
  careerId?: string | number;
  cityId?: string | number;
  districtId?: string | number;
  wardId?: string | number;
  positionId?: string | number;
  experienceId?: string | number;
  typeOfWorkplaceId?: string | number;
  jobTypeId?: string | number;
  genderId?: string | number;
  page?: number;
  pageSize?: number;
  ordering?: string;
  isUrgent?: boolean;
  isHot?: boolean;
  status?: number | string;
};

export interface JobPostInput {
  jobName: string;
  deadline: string;
  quantity: number;
  salaryMin: number;
  salaryMax: number;
  isHot?: boolean;
  isUrgent?: boolean;
  status?: number;
  position?: number;
  experience?: number;
  academicLevel?: number;
  jobType?: number;
  interviewTemplate?: number | string | null;
  typeOfWorkplace?: number;
  genderRequired?: string;
  jobDescription?: string;
  jobRequirement?: string;
  benefitsEnjoyed?: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  career?: number;
  location: {
    city?: number;
    district?: number;
    ward?: number;
    address: string;
    lat?: number | null;
    lng?: number | null;
  };
}

/* ── Response Types ───────────────────────────────────────────────────── */

interface SuggestTitleResponse {
  results: string[];
}

type JobPostOptionsResponse = {
  statusOptions?: { id: number; name: string }[];
};

type JobSalaryInsightResponse = {
  careerId?: number | null;
  cityId?: number | null;
  jobPostId?: number | null;
  count?: number;
  minSalary?: number | null;
  maxSalary?: number | null;
  avgMinSalary?: number | null;
  avgMaxSalary?: number | null;
  relatedJobs?: JobPost[];
};

/* ── Service ──────────────────────────────────────────────────────────── */

const jobService = {
  searchJobSuggestTitle: (kw: string): Promise<SuggestTitleResponse> => {
    const url = 'job/web/search/job-suggest-title/';
    return httpRequest.get(url, { params: { q: kw } }) as Promise<SuggestTitleResponse>;
  },

  getEmployerJobPost: (params: GetJobPostsParams = {}): Promise<PaginatedResponse<JobPost>> => {
    const url = 'job/web/private-job-posts/';
    return httpRequest.get(url, { params: cleanParams(params) }) as Promise<PaginatedResponse<JobPost>>;
  },

  exportEmployerJobPosts: (params: GetJobPostsParams = {}): Promise<ExportTableRow[]> => {
    const url = 'job/web/private-job-posts/export/';
    return httpRequest.get(url, { params: cleanParams(params) }) as Promise<ExportTableRow[]>;
  },

  getEmployerJobPostDetailById: (slug: IdType): Promise<JobPost> => {
    const url = `job/web/private-job-posts/${slug}/`;
    return httpRequest.get(url) as Promise<JobPost>;
  },

  addJobPost: (data: JobPostInput): Promise<JobPost> => {
    const url = 'job/web/private-job-posts/';
    return httpRequest.post(url, data) as Promise<JobPost>;
  },

  updateJobPostById: (slug: IdType, data: Partial<JobPostInput>): Promise<JobPost> => {
    const url = `job/web/private-job-posts/${slug}/`;
    return httpRequest.put(url, data) as Promise<JobPost>;
  },

  deleteJobPostById: (slug: IdType): Promise<void> => {
    const url = `job/web/private-job-posts/${slug}/`;
    return httpRequest.delete(url) as Promise<void>;
  },

  getJobPostOptions: (): Promise<JobPostOptionsResponse> => {
    const url = 'job/web/private-job-posts/job-posts-options/';
    return httpRequest.get(url) as Promise<JobPostOptionsResponse>;
  },

  getJobPosts: (params: GetJobPostsParams = {}): Promise<PaginatedResponse<JobPost>> => {
    const url = 'job/web/job-posts/';
    return httpRequest.get(url, { params: cleanParams(params) }) as Promise<PaginatedResponse<JobPost>>;
  },

  getJobPostDetailById: (slug: IdType): Promise<JobPost> => {
    const url = `job/web/job-posts/${slug}/`;
    return httpRequest.get(url) as Promise<JobPost>;
  },

  getSuggestedJobPosts: (params: GetJobPostsParams = {}): Promise<PaginatedResponse<JobPost>> => {
    const url = 'job/web/private-job-posts/suggested-job-posts/';
    return httpRequest.get(url, { params: cleanParams(params) }) as Promise<PaginatedResponse<JobPost>>;
  },

  getJobPostsSaved: (params: GetJobPostsParams = {}): Promise<PaginatedResponse<JobPost>> => {
    const url = `job/web/job-posts/job-posts-saved/`;
    return httpRequest.get(url, { params: cleanParams(params) }) as Promise<PaginatedResponse<JobPost>>;
  },

  saveJobPost: (slug: IdType): Promise<{ isSaved: boolean }> => {
    const url = `job/web/job-posts/${slug}/save/`;
    return httpRequest.post(url) as Promise<{ isSaved: boolean }>;
  },

  getJobSalaryInsightBySlug: (slug: IdType): Promise<JobSalaryInsightResponse> => {
    const url = `job/web/job-posts/${slug}/salary-insight/`;
    return httpRequest.get(url) as Promise<JobSalaryInsightResponse>;
  },
};

export default jobService;


