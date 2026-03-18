import httpRequest from '../utils/httpRequest';

type AnyRecord = Record<string, unknown>;

type IdType = string | number;

const jobPostNotificationService = {
  addJobPostNotification: (data: AnyRecord): Promise<unknown> => {
    const url = 'job/web/job-post-notifications/';
    return httpRequest.post(url, data);
  },

  getJobPostNotifications: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'job/web/job-post-notifications/';
    return httpRequest.get(url, {
      params: params,
    });
  },

  updateJobPostNotificationById: (id: IdType, data: AnyRecord): Promise<unknown> => {
    const url = `job/web/job-post-notifications/${id}/`;
    return httpRequest.put(url, data);
  },

  getJobPostNotificationDetailById: (id: IdType): Promise<unknown> => {
    const url = `job/web/job-post-notifications/${id}/`;
    return httpRequest.get(url);
  },

  deleteJobPostNotificationDetailById: (id: IdType): Promise<unknown> => {
    const url = `job/web/job-post-notifications/${id}/`;
    return httpRequest.delete(url);
  },

  active: (id: IdType): Promise<unknown> => {
    const url = `job/web/job-post-notifications/${id}/`;
    return httpRequest.patch(url, {});
  },
};

export default jobPostNotificationService;
