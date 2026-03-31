import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';


type WithPresignInput = Promise<unknown>;

const withPresign = async (promise: WithPresignInput): Promise<unknown> => {
  const data = await promise;
  return presignInObject(data);
};

const contentService = {
  getFeedbacks: (): Promise<unknown> => {
    const url = 'content/web/feedbacks/';
    return httpRequest.get(url);
  },

  createFeedback: (data: Record<string, unknown>): Promise<unknown> => {
    const url = 'content/web/feedbacks/';
    return httpRequest.post(url, data);
  },

  sendSMSDownloadApp: (data: Record<string, unknown>): Promise<unknown> => {
    const url = 'content/web/sms-download-app/';
    return httpRequest.post(url, data);
  },

  getBanners: (params: Record<string, unknown> = {}): Promise<unknown> => {
    const url = 'content/web/banner/';
    return withPresign(httpRequest.get(url, { params: params }));
  },

  sendNotificationDemo: (): Promise<unknown> => {
    const url = 'content/send-noti-demo/';
    return httpRequest.post(url);
  },
};

export default contentService;

