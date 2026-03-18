import httpRequest from '../utils/httpRequest';

type AnyRecord = Record<string, unknown>;

type IdType = string | number;

const jobPostActivityService = {
  // job seeker
  applyJob: (data: AnyRecord): Promise<unknown> => {
    const url = 'job/web/job-seeker-job-posts-activity/';
    return httpRequest.post(url, data);
  },

  getJobPostActivity: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'job/web/job-seeker-job-posts-activity/';
    return httpRequest.get(url, { params: params });
  },

  getJobPostChatActivity: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'job/web/job-seeker-job-posts-activity/chat/';
    return httpRequest.get(url, { params: params });
  },

  // employer

  sendEmail: (id: IdType, data: AnyRecord): Promise<unknown> => {
    const url = `job/web/employer-job-posts-activity/${id}/send-email/`;
    return httpRequest.post(url, data);
  },

  getAppliedResume: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'job/web/employer-job-posts-activity/';
    return httpRequest.get(url, { params: params });
  },

  getAppliedResumeChat: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'job/web/employer-job-posts-activity/chat/';
    return httpRequest.get(url, { params: params });
  },

  exportAppliedResume: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'job/web/employer-job-posts-activity/export/';
    return httpRequest.get(url, { params: params });
  },

  changeApplicationStatus: (id: IdType, data: AnyRecord): Promise<unknown> => {
    const url = `job/web/employer-job-posts-activity/${id}/application-status/`;
    return httpRequest.put(url, data);
  },

  deleteJobPostActivity: (id: IdType): Promise<unknown> => {
    const url = `job/web/employer-job-posts-activity/${id}/`;
    return httpRequest.delete(url);
  },

  analyzeResume: (id: IdType): Promise<unknown> => {
    const url = `job/web/employer-job-posts-activity/${id}/analyze-resume/`;
    return httpRequest.post(url);
  },
};

export default jobPostActivityService;
