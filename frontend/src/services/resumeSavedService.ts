import httpRequest from '../utils/httpRequest';


const resumeSavedService = {
  getResumesSaved: (params: Record<string, unknown> = {}): Promise<unknown> => {
    const url = 'info/web/resumes-saved/';
    return httpRequest.get(url, { params: params });
  },

  exportResumesSaved: (params: Record<string, unknown> = {}): Promise<unknown> => {
    const url = 'info/web/resumes-saved/export/';
    return httpRequest.get(url, { params: params });
  },
};

export default resumeSavedService;

