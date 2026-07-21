import httpRequest from '../utils/httpRequest';
import { normalizePaginatedResponse, unwrapDataResponse } from '../utils/apiResponse';
import type { PaginatedResponse } from '../types/api';
import { cleanParams } from '../utils/params';

export interface JobPostNotification {
  id: number;
  jobName: string;
  position?: number | null;
  career?: number;
  city?: number;
  experience?: number;
  salaryMin?: number;
  salary?: number | null;
  frequency?: number;
  isActive: boolean;
  createdAt: string;
}

export interface JobPostNotificationPayload {
  jobName: string;
  frequency: number;
  career: number;
  city: number;
  position?: number | null;
  experience?: number | null;
  salary?: number | null;
  isActive?: boolean;
}

export type JobPostNotificationListParams = {
  page?: number;
  pageSize?: number;
  ordering?: string;
};

type IdType = string | number;
export type JobPostNotificationStatusResponse = { isActive: boolean };

const jobPostNotificationService = {
  addJobPostNotification: (data: JobPostNotificationPayload): Promise<JobPostNotification> => {
    const url = 'job/web/job-post-notifications/';
    return (httpRequest.post(url, data) as Promise<unknown>).then(unwrapDataResponse<JobPostNotification>);
  },

  getJobPostNotifications: (params: JobPostNotificationListParams = {}): Promise<PaginatedResponse<JobPostNotification>> => {
    const url = 'job/web/job-post-notifications/';
    return (httpRequest.get(url, {
      params: cleanParams(params),
    }) as Promise<unknown>).then((data) => normalizePaginatedResponse<JobPostNotification>(data));
  },

  updateJobPostNotificationById: (id: IdType, data: Partial<JobPostNotificationPayload>): Promise<JobPostNotification> => {
    const url = `job/web/job-post-notifications/${id}/`;
    return (httpRequest.put(url, data) as Promise<unknown>).then(unwrapDataResponse<JobPostNotification>);
  },

  getJobPostNotificationDetailById: (id: IdType): Promise<JobPostNotification> => {
    const url = `job/web/job-post-notifications/${id}/`;
    return (httpRequest.get(url) as Promise<unknown>).then(unwrapDataResponse<JobPostNotification>);
  },

  deleteJobPostNotificationDetailById: (id: IdType): Promise<void> => {
    const url = `job/web/job-post-notifications/${id}/`;
    return httpRequest.delete(url) as Promise<void>;
  },

  active: (id: IdType): Promise<JobPostNotificationStatusResponse> => {
    const url = `job/web/job-post-notifications/${id}/`;
    return (httpRequest.patch(url, {}) as Promise<unknown>).then(unwrapDataResponse<JobPostNotificationStatusResponse>);
  },
};

export default jobPostNotificationService;



