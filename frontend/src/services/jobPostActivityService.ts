import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';


type IdType = string | number;
export interface ApplyJobPayload {
  job_post: number;
  resume: number;
  fullName: string;
  email: string;
  phone: string;
}

type WithPresignInput = Promise<unknown>;

const withPresign = async (promise: WithPresignInput): Promise<unknown> => {
  const data = await promise;
  return presignInObject(data);
};

const jobPostActivityService = {
  // job seeker
  applyJob: (data: ApplyJobPayload): Promise<unknown> => {
    const url = 'job/web/job-seeker-job-posts-activity/';
    return httpRequest.post(url, data);
  },

  getJobPostActivity: (params: Record<string, unknown> = {}): Promise<unknown> => {
    const url = 'job/web/job-seeker-job-posts-activity/';
    return httpRequest.get(url, { params: params });
  },

  getJobPostChatActivity: (params: Record<string, unknown> = {}): Promise<unknown> => {
    const url = 'job/web/job-seeker-job-posts-activity/chat/';
    return httpRequest.get(url, { params: params });
  },

  // employer

  sendEmail: (id: IdType, data: Record<string, unknown>): Promise<unknown> => {
    const url = `job/web/employer-job-posts-activity/${id}/send-email/`;
    return httpRequest.post(url, data);
  },

  getAppliedResume: (params: Record<string, unknown> = {}): Promise<unknown> => {
    const url = 'job/web/employer-job-posts-activity/';
    return withPresign(httpRequest.get(url, { params: params }));
  },

  getAppliedResumeChat: (params: Record<string, unknown> = {}): Promise<unknown> => {
    const url = 'job/web/employer-job-posts-activity/chat/';
    return withPresign(httpRequest.get(url, { params: params }));
  },

  exportAppliedResume: (params: Record<string, unknown> = {}): Promise<unknown> => {
    const url = 'job/web/employer-job-posts-activity/export/';
    return withPresign(httpRequest.get(url, { params: params }));
  },

  changeApplicationStatus: (id: IdType, data: Record<string, unknown>): Promise<unknown> => {
    const url = `job/web/employer-job-posts-activity/${id}/application-status/`;
    return httpRequest.put(url, data);
  },

  deleteJobPostActivity: (id: IdType): Promise<unknown> => {
    const url = `job/web/employer-job-posts-activity/${id}/`;
    return httpRequest.delete(url);
  },

  getJobPostActivityDetail: (id: IdType): Promise<unknown> => {
    const url = `job/web/employer-job-posts-activity/${id}/`;
    return withPresign(httpRequest.get(url));
  },

  analyzeResume: (id: IdType): Promise<unknown> => {
    const url = `job/web/employer-job-posts-activity/${id}/analyze-resume/`;
    return httpRequest.post(url);
  },
};

export default jobPostActivityService;

