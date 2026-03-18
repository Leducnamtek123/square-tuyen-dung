import httpRequest from '../utils/httpRequest';

type AnyRecord = Record<string, unknown>;

const ProjectService = {
  getFeedbacks: (): Promise<unknown> => {
    const url = 'Project/web/feedbacks/';
    return httpRequest.get(url);
  },

  createFeedback: (data: AnyRecord): Promise<unknown> => {
    const url = 'Project/web/feedbacks/';
    return httpRequest.post(url, data);
  },

  sendSMSDownloadApp: (data: AnyRecord): Promise<unknown> => {
    const url = 'Project/web/sms-download-app/';
    return httpRequest.post(url, data);
  },

  getBanners: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'Project/web/banner/';
    return httpRequest.get(url, { params: params });
  },
};

export default ProjectService;

