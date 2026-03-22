import httpRequest from '../utils/httpRequest';

type AnyRecord = Record<string, unknown>;

const contentService = {
  getFeedbacks: (): Promise<unknown> => {
    const url = 'content/web/feedbacks/';
    return httpRequest.get(url);
  },

  createFeedback: (data: AnyRecord): Promise<unknown> => {
    const url = 'content/web/feedbacks/';
    return httpRequest.post(url, data);
  },

  sendSMSDownloadApp: (data: AnyRecord): Promise<unknown> => {
    const url = 'content/web/sms-download-app/';
    return httpRequest.post(url, data);
  },

  getBanners: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'content/web/banner/';
    return httpRequest.get(url, { params: params });
  },

  sendNotificationDemo: (): Promise<unknown> => {
    const url = 'content/send-noti-demo/';
    return httpRequest.post(url);
  },
};

export default contentService;

