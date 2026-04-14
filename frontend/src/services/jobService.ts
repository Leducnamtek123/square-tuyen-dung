import httpRequest from '../utils/httpRequest';
import { cleanParams } from '../utils/params';
import type { JobPost } from '../types/models';
import type { PaginatedResponse } from '../types/api';

type IdType = string | number;

/* ── Request DTOs ─────────────────────────────────────────────────────── */

export interface GetJobPostsParams {
  kw?: string;
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
  [key: string]: unknown;
}

export interface JobPostInput {
  jobName: string;
  deadline: string;
  quantity: number;
  salaryMin: number;
  salaryMax: number;
  isHot?: boolean;
  isUrgent?: boolean;
  status?: number;
  careerId?: number;
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
  cityId?: number;
  districtId?: number;
  address?: string;
}

/* ── Response Types ───────────────────────────────────────────────────── */

export interface SuggestTitleResponse {
  results: string[];
}

export interface JobPostOptionsResponse {
  statusOptions?: { id: number; name: string }[];
  [key: string]: unknown;
}

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

  exportEmployerJobPosts: (params: GetJobPostsParams = {}): Promise<Blob> => {
    const url = 'job/web/private-job-posts/export/';
    return httpRequest.get(url, { params: cleanParams(params) }) as Promise<Blob>;
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
};

export default jobService;
