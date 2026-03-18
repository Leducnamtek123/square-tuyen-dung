import httpRequest from '../utils/httpRequest';

type AnyRecord = Record<string, unknown>;

const resumeSavedService = {
  getResumesSaved: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'info/web/resumes-saved/';
    return httpRequest.get(url, { params: params });
  },

  exportResumesSaved: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'info/web/resumes-saved/export/';
    return httpRequest.get(url, { params: params });
  },
};

export default resumeSavedService;
