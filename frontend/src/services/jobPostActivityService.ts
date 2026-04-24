import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';
import type { ExportTableRow, PaginatedResponse } from '../types/api';
import type { JobPostActivity } from '../types/models';
import { cleanParams } from '../utils/params';


type IdType = string | number;
interface ApplyJobPayload {
  jobPost: number;
  resume: number;
  fullName: string;
  email: string;
  phone: string;
}

export type JobPostActivityListParams = {
  page?: number;
  pageSize?: number;
  ordering?: string;
  kw?: string;
  status?: number | string;
  jobPost?: number | string;
  jobPostId?: number | string;
};

interface SendEmailPayload {
  subject?: string;
  content?: string;
}

interface ChangeApplicationStatusPayload {
  status: number | string;
}

interface ActionResponse {
  success?: boolean;
  message?: string;
}

const withPresign = async <T>(promise: Promise<T>): Promise<T> => {
  const data = await promise;
  return presignInObject(data) as T;
};

const jobPostActivityService = {
  // job seeker
  applyJob: (data: ApplyJobPayload): Promise<ActionResponse> => {
    const url = 'job/web/job-seeker-job-posts-activity/';
    return httpRequest.post(url, data);
  },

  getJobPostActivity: (params: JobPostActivityListParams = {}): Promise<PaginatedResponse<JobPostActivity>> => {
    const url = 'job/web/job-seeker-job-posts-activity/';
    return httpRequest.get(url, { params: cleanParams(params) }) as Promise<PaginatedResponse<JobPostActivity>>;
  },

  getJobPostChatActivity: <T = JobPostActivity>(params: JobPostActivityListParams = {}): Promise<PaginatedResponse<T>> => {
    const url = 'job/web/job-seeker-job-posts-activity/chat/';
    return httpRequest.get(url, { params: cleanParams(params) }) as Promise<PaginatedResponse<T>>;
  },

  // employer

  sendEmail: (id: IdType, data: SendEmailPayload): Promise<ActionResponse> => {
    const url = `job/web/employer-job-posts-activity/${id}/send-email/`;
    return httpRequest.post(url, data);
  },

  getAppliedResume: (params: JobPostActivityListParams = {}): Promise<PaginatedResponse<JobPostActivity>> => {
    const url = 'job/web/employer-job-posts-activity/';
    return withPresign(httpRequest.get(url, { params: cleanParams(params) })) as Promise<PaginatedResponse<JobPostActivity>>;
  },

  getAppliedResumeChat: <T = JobPostActivity>(params: JobPostActivityListParams = {}): Promise<PaginatedResponse<T>> => {
    const url = 'job/web/employer-job-posts-activity/chat/';
    return withPresign(httpRequest.get(url, { params: cleanParams(params) })) as Promise<PaginatedResponse<T>>;
  },

  exportAppliedResume: (params: JobPostActivityListParams = {}): Promise<ExportTableRow[]> => {
    const url = 'job/web/employer-job-posts-activity/export/';
    return withPresign(httpRequest.get(url, { params: cleanParams(params) })) as Promise<ExportTableRow[]>;
  },

  changeApplicationStatus: (id: IdType, data: ChangeApplicationStatusPayload): Promise<JobPostActivity> => {
    const url = `job/web/employer-job-posts-activity/${id}/application-status/`;
    return httpRequest.put(url, data) as Promise<JobPostActivity>;
  },

  deleteJobPostActivity: (id: IdType): Promise<void> => {
    const url = `job/web/employer-job-posts-activity/${id}/`;
    return httpRequest.delete(url);
  },

  getJobPostActivityDetail: (id: IdType): Promise<JobPostActivity> => {
    const url = `job/web/employer-job-posts-activity/${id}/`;
    return withPresign(httpRequest.get(url)) as Promise<JobPostActivity>;
  },

  analyzeResume: (id: IdType, payload?: { onlineProfileUrl?: string }): Promise<ActionResponse> => {
    const url = `job/web/employer-job-posts-activity/${id}/analyze-resume/`;
    return httpRequest.post(url, payload || {});
  },
};

export default jobPostActivityService;



