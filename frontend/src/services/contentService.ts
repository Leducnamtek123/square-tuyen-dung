import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';
import type { Banner, Feedback } from '../types/models';
import { cleanParams } from '../utils/params';


const withPresign = async <T>(promise: Promise<T>): Promise<T> => {
  const data = await promise;
  return presignInObject(data) as T;
};

interface FeedbackPayload {
  rating: number;
  content: string;
}

interface SMSDownloadAppPayload {
  phone: string;
}

type BannerListParams = {
  type?: number | string;
  platform?: string;
  isActive?: boolean;
};

const toListData = <T>(raw: unknown): T[] => {
  if (Array.isArray(raw)) return raw as T[];
  const obj = (raw || {}) as { results?: unknown[]; data?: unknown[] };
  if (Array.isArray(obj.results)) return obj.results as T[];
  if (Array.isArray(obj.data)) return obj.data as T[];
  return [];
};

const contentService = {
  getFeedbacks: async (): Promise<Feedback[]> => {
    const url = 'content/web/feedbacks/';
    const response = await httpRequest.get(url);
    return toListData<Feedback>(response);
  },

  createFeedback: (data: FeedbackPayload): Promise<Feedback> => {
    const url = 'content/web/feedbacks/';
    return httpRequest.post(url, data) as Promise<Feedback>;
  },

  sendSMSDownloadApp: (data: SMSDownloadAppPayload): Promise<{ sent?: boolean; message?: string }> => {
    const url = 'content/web/sms-download-app/';
    return httpRequest.post(url, data) as Promise<{ sent?: boolean; message?: string }>;
  },

  getBanners: async (params: BannerListParams = {}): Promise<Banner[]> => {
    const url = 'content/web/banner/';
    const response = await withPresign(httpRequest.get(url, { params: cleanParams(params) }));
    return toListData<Banner>(response);
  },

  sendNotificationDemo: (): Promise<{ success?: boolean; message?: string }> => {
    const url = 'content/send-noti-demo/';
    return httpRequest.post(url);
  },
};

export default contentService;



