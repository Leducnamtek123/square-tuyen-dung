import httpRequest from '../utils/httpRequest';
import { cleanParams } from '../utils/params';

type AnyRecord = Record<string, unknown>;

const jobService = {
  searchJobSuggestTitle: (kw: string): Promise<any> => {
    const url = 'job/web/search/job-suggest-title/';
    return httpRequest.get(url, { params: { q: kw } });
  },

  getEmployerJobPost: (params: AnyRecord = {}): Promise<any> => {
    const url = 'job/web/private-job-posts/';
    return httpRequest.get(url, { params: cleanParams(params) });
  },

  exportEmployerJobPosts: (params: AnyRecord = {}): Promise<any> => {
    const url = 'job/web/private-job-posts/export/';
    return httpRequest.get(url, { params: cleanParams(params) });
  },

  getEmployerJobPostDetailById: (slug: string | number): Promise<any> => {
    const url = `job/web/private-job-posts/${slug}/`;
    return httpRequest.get(url);
  },

  addJobPost: (data: AnyRecord): Promise<any> => {
    const url = 'job/web/private-job-posts/';
    return httpRequest.post(url, data);
  },

  updateJobPostById: (slug: string | number, data: AnyRecord): Promise<any> => {
    const url = `job/web/private-job-posts/${slug}/`;
    return httpRequest.put(url, data);
  },

  deleteJobPostById: (slug: string | number): Promise<any> => {
    const url = `job/web/private-job-posts/${slug}/`;
    return httpRequest.delete(url);
  },

  getJobPostOptions: (): Promise<any> => {
    const url = 'job/web/private-job-posts/job-posts-options/';
    return httpRequest.get(url);
  },

  getJobPosts: (params: AnyRecord = {}): Promise<any> => {
    const url = 'job/web/job-posts/';
    return httpRequest.get(url, {
      params: cleanParams(params),
    });
  },

  getJobPostDetailById: (slug: string | number): Promise<any> => {
    const url = `job/web/job-posts/${slug}/`;
    return httpRequest.get(url);
  },

  getSuggestedJobPosts: (params: AnyRecord = {}): Promise<any> => {
    const url = 'job/web/private-job-posts/suggested-job-posts/';
    return httpRequest.get(url, {
      params: cleanParams(params),
    });
  },

  getJobPostsSaved: (params: AnyRecord = {}): Promise<any> => {
    const url = `job/web/job-posts/job-posts-saved/`;
    return httpRequest.get(url, { params: cleanParams(params) });
  },

  saveJobPost: (slug: string | number): Promise<any> => {
    const url = `job/web/job-posts/${slug}/save/`;
    return httpRequest.post(url);
  },
};

export default jobService;


