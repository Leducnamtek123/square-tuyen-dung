import httpRequest from '../utils/httpRequest';

type AnyRecord = Record<string, unknown>;

const resumeViewedService = {
  getResumeViewed: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'info/web/resume-views/';
    return httpRequest.get(url, { params: params });
  },
};

export default resumeViewedService;
