import httpRequest from '../utils/httpRequest';

const jobService = {

  searchJobSuggestTitle: (kw) => {

    const url = 'job/web/search/job-suggest-title/';

    return httpRequest.get(url, { params: { q: kw } });

  },

  getEmployerJobPost: (params = {}) => {

    const url = 'job/web/private-job-posts/';

    return httpRequest.get(url, { params: params });

  },

  exportEmployerJobPosts: (params = {}) => {

    const url = 'job/web/private-job-posts/export/';

    return httpRequest.get(url, { params: params });

  },

  getEmployerJobPostDetailById: (slug) => {

    const url = `job/web/private-job-posts/${slug}/`;

    return httpRequest.get(url);

  },

  addJobPost: (data) => {

    const url = 'job/web/private-job-posts/';

    return httpRequest.post(url, data);

  },

  updateJobPostById: (slug, data) => {

    const url = `job/web/private-job-posts/${slug}/`;

    return httpRequest.put(url, data);

  },

  deleteJobPostById: (slug) => {

    const url = `job/web/private-job-posts/${slug}/`;

    return httpRequest.delete(url);

  },

  getJobPostOptions: () => {

    const url = 'job/web/private-job-posts/job-posts-options/';

    return httpRequest.get(url);

  },

  getJobPosts: (params = {}) => {

    const url = 'job/web/job-posts/';

    return httpRequest.get(url, {

      params: params,

    });

  },

  getJobPostDetailById: (slug) => {

    const url = `job/web/job-posts/${slug}/`;

    return httpRequest.get(url);

  },

  getSuggestedJobPosts: (params = {}) => {

    const url = 'job/web/private-job-posts/suggested-job-posts/';

    return httpRequest.get(url, {

      params: params,

    });

  },

  getJobPostsSaved: (params = {}) => {

    const url = `job/web/job-posts/job-posts-saved/`;

    return httpRequest.get(url, { params: params });

  },

  saveJobPost: (slug) => {

    const url = `job/web/job-posts/${slug}/save/`;

    return httpRequest.post(url);

  },

};

export default jobService;
