import httpRequest from '../utils/httpRequest';
import type { PaginatedResponse } from '../types/api';

export interface JobPostNotification {
  id: number;
  jobName: string;
  career?: number;
  city?: number;
  experience?: number;
  salaryMin?: number;
  salary?: number | null;
  frequency?: number;
  isActive: boolean;
  createdAt: string;
}


type IdType = string | number;

const jobPostNotificationService = {
  addJobPostNotification: (data: Record<string, unknown>): Promise<JobPostNotification> => {
    const url = 'job/web/job-post-notifications/';
    return httpRequest.post(url, data) as Promise<JobPostNotification>;
  },

  getJobPostNotifications: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<JobPostNotification>> => {
    const url = 'job/web/job-post-notifications/';
    return httpRequest.get(url, {
      params: params,
    }) as Promise<PaginatedResponse<JobPostNotification>>;
  },

  updateJobPostNotificationById: (id: IdType, data: Partial<JobPostNotification> | Record<string, unknown>): Promise<JobPostNotification> => {
    const url = `job/web/job-post-notifications/${id}/`;
    return httpRequest.put(url, data) as Promise<JobPostNotification>;
  },

  getJobPostNotificationDetailById: (id: IdType): Promise<JobPostNotification> => {
    const url = `job/web/job-post-notifications/${id}/`;
    return httpRequest.get(url) as Promise<JobPostNotification>;
  },

  deleteJobPostNotificationDetailById: (id: IdType): Promise<void> => {
    const url = `job/web/job-post-notifications/${id}/`;
    return httpRequest.delete(url) as Promise<void>;
  },

  active: (id: IdType): Promise<JobPostNotification> => {
    const url = `job/web/job-post-notifications/${id}/`;
    return httpRequest.patch(url, {}) as Promise<JobPostNotification>;
  },
};

export default jobPostNotificationService;

