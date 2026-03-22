import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';

type AnyRecord = Record<string, unknown>;

type IdType = string | number;

type WithPresignInput = Promise<unknown>;

const withPresign = async (promise: WithPresignInput): Promise<unknown> => {
  const data = await promise;
  return presignInObject(data);
};

const normalizeInterviewListParams = (params: AnyRecord = {}): AnyRecord => {
  const normalized: AnyRecord = { ...params };
  if (normalized.kw && !normalized.search) {
    normalized.search = normalized.kw;
    delete normalized.kw;
  }
  Object.keys(normalized).forEach((key) => {
    const value = normalized[key];
    if (value === undefined || value === null || value === '') {
      delete normalized[key];
    }
  });
  return normalized;
};

const adminManagementService = {
  buildMultipartConfig: (data: unknown): { headers: { 'Content-Type': string } } | undefined => {
    if (data instanceof FormData) {
      return { headers: { 'Content-Type': 'multipart/form-data' } };
    }
    return undefined;
  },

  getCareers: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'common/admin/careers/';
    return withPresign(httpRequest.get(url, { params }));
  },

  createCareer: (data: AnyRecord | FormData): Promise<unknown> => {
    const url = 'common/admin/careers/';
    return withPresign(
      httpRequest.post(url, data, adminManagementService.buildMultipartConfig(data))
    );
  },

  updateCareer: (id: IdType, data: AnyRecord | FormData): Promise<unknown> => {
    const url = `common/admin/careers/${id}/`;
    return withPresign(
      httpRequest.patch(url, data, adminManagementService.buildMultipartConfig(data))
    );
  },

  deleteCareer: (id: IdType): Promise<unknown> => {
    const url = `common/admin/careers/${id}/`;
    return httpRequest.delete(url);
  },

  getCities: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'common/admin/cities/';
    return withPresign(httpRequest.get(url, { params }));
  },

  createCity: (data: AnyRecord): Promise<unknown> => {
    const url = 'common/admin/cities/';
    return withPresign(httpRequest.post(url, data));
  },

  updateCity: (id: IdType, data: AnyRecord): Promise<unknown> => {
    const url = `common/admin/cities/${id}/`;
    return withPresign(httpRequest.patch(url, data));
  },

  deleteCity: (id: IdType): Promise<unknown> => {
    const url = `common/admin/cities/${id}/`;
    return httpRequest.delete(url);
  },

  getDistricts: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'common/admin/districts/';
    return withPresign(httpRequest.get(url, { params }));
  },

  createDistrict: (data: AnyRecord): Promise<unknown> => {
    const url = 'common/admin/districts/';
    return withPresign(httpRequest.post(url, data));
  },

  updateDistrict: (id: IdType, data: AnyRecord): Promise<unknown> => {
    const url = `common/admin/districts/${id}/`;
    return withPresign(httpRequest.patch(url, data));
  },

  deleteDistrict: (id: IdType): Promise<unknown> => {
    const url = `common/admin/districts/${id}/`;
    return httpRequest.delete(url);
  },

  getWards: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'common/admin/wards/';
    return withPresign(httpRequest.get(url, { params }));
  },

  createWard: (data: AnyRecord): Promise<unknown> => {
    const url = 'common/admin/wards/';
    return withPresign(httpRequest.post(url, data));
  },

  updateWard: (id: IdType, data: AnyRecord): Promise<unknown> => {
    const url = `common/admin/wards/${id}/`;
    return withPresign(httpRequest.patch(url, data));
  },

  deleteWard: (id: IdType): Promise<unknown> => {
    const url = `common/admin/wards/${id}/`;
    return httpRequest.delete(url);
  },

  getCompanies: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'info/web/admin/companies/';
    return withPresign(httpRequest.get(url, { params }));
  },

  getCompanyDetail: (id: IdType): Promise<unknown> => {
    const url = `info/web/admin/companies/${id}/`;
    return withPresign(httpRequest.get(url));
  },

  createCompany: (data: AnyRecord): Promise<unknown> => {
    const url = 'info/web/admin/companies/';
    return withPresign(httpRequest.post(url, data));
  },

  updateCompany: (id: IdType, data: AnyRecord): Promise<unknown> => {
    const url = `info/web/admin/companies/${id}/`;
    return withPresign(httpRequest.patch(url, data));
  },

  deleteCompany: (id: IdType): Promise<unknown> => {
    const url = `info/web/admin/companies/${id}/`;
    return httpRequest.delete(url);
  },

  // Job Seeker Profiles

  getProfiles: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'info/web/admin/job-seeker-profiles/';
    return withPresign(httpRequest.get(url, { params }));
  },

  getProfileDetail: (id: IdType): Promise<unknown> => {
    const url = `info/web/admin/job-seeker-profiles/${id}/`;
    return withPresign(httpRequest.get(url));
  },

  createProfile: (data: AnyRecord): Promise<unknown> => {
    const url = 'info/web/admin/job-seeker-profiles/';
    return withPresign(httpRequest.post(url, data));
  },

  updateProfile: (id: IdType, data: AnyRecord): Promise<unknown> => {
    const url = `info/web/admin/job-seeker-profiles/${id}/`;
    return withPresign(httpRequest.patch(url, data));
  },

  deleteProfile: (id: IdType): Promise<unknown> => {
    const url = `info/web/admin/job-seeker-profiles/${id}/`;
    return httpRequest.delete(url);
  },

  getResumes: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'info/web/admin/resumes/';
    return withPresign(httpRequest.get(url, { params }));
  },

  getResumeDetail: (id: IdType): Promise<unknown> => {
    const url = `info/web/admin/resumes/${id}/`;
    return withPresign(httpRequest.get(url));
  },

  createResume: (data: AnyRecord): Promise<unknown> => {
    const url = 'info/web/admin/resumes/';
    return withPresign(httpRequest.post(url, data));
  },

  updateResume: (id: IdType, data: AnyRecord): Promise<unknown> => {
    const url = `info/web/admin/resumes/${id}/`;
    return withPresign(httpRequest.patch(url, data));
  },

  deleteResume: (id: IdType): Promise<unknown> => {
    const url = `info/web/admin/resumes/${id}/`;
    return httpRequest.delete(url);
  },

  // Job Activity

  getJobActivities: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'job/web/admin/job-posts-activity/';
    return httpRequest.get(url, { params });
  },

  createJobActivity: (data: AnyRecord): Promise<unknown> => {
    const url = 'job/web/admin/job-posts-activity/';
    return httpRequest.post(url, data);
  },

  updateJobActivity: (id: IdType, data: AnyRecord): Promise<unknown> => {
    const url = `job/web/admin/job-posts-activity/${id}/`;
    return httpRequest.patch(url, data);
  },

  deleteJobActivity: (id: IdType): Promise<unknown> => {
    const url = `job/web/admin/job-posts-activity/${id}/`;
    return httpRequest.delete(url);
  },

  getJobNotifications: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'job/web/admin/job-post-notifications/';
    return httpRequest.get(url, { params });
  },

  createJobNotification: (data: AnyRecord): Promise<unknown> => {
    const url = 'job/web/admin/job-post-notifications/';
    return httpRequest.post(url, data);
  },

  updateJobNotification: (id: IdType, data: AnyRecord): Promise<unknown> => {
    const url = `job/web/admin/job-post-notifications/${id}/`;
    return httpRequest.patch(url, data);
  },

  deleteJobNotification: (id: IdType): Promise<unknown> => {
    const url = `job/web/admin/job-post-notifications/${id}/`;
    return httpRequest.delete(url);
  },

  getQuestionGroups: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'interview/web/question-groups/';
    return httpRequest.get(url, { params: normalizeInterviewListParams(params) });
  },

  createQuestionGroup: (data: AnyRecord): Promise<unknown> => {
    const url = 'interview/web/question-groups/';
    return httpRequest.post(url, data);
  },

  updateQuestionGroup: (id: IdType, data: AnyRecord): Promise<unknown> => {
    const url = `interview/web/question-groups/${id}/`;
    return httpRequest.patch(url, data);
  },

  deleteQuestionGroup: (id: IdType): Promise<unknown> => {
    const url = `interview/web/question-groups/${id}/`;
    return httpRequest.delete(url);
  },

  // Banners (Admin)
  getBanners: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'content/web/admin/banners/';
    return withPresign(httpRequest.get(url, { params }));
  },
  createBanner: (data: AnyRecord): Promise<unknown> => {
    const url = 'content/web/admin/banners/';
    return withPresign(httpRequest.post(url, data));
  },
  updateBanner: (id: IdType, data: AnyRecord): Promise<unknown> => {
    const url = `content/web/admin/banners/${id}/`;
    return withPresign(httpRequest.patch(url, data));
  },
  deleteBanner: (id: IdType): Promise<unknown> => {
    const url = `content/web/admin/banners/${id}/`;
    return httpRequest.delete(url);
  },

  // Feedbacks (Admin)
  getFeedbacks: (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'content/web/admin/feedbacks/';
    return httpRequest.get(url, { params });
  },
  updateFeedback: (id: IdType, data: AnyRecord): Promise<unknown> => {
    const url = `content/web/admin/feedbacks/${id}/`;
    return httpRequest.patch(url, data);
  },
  deleteFeedback: (id: IdType): Promise<unknown> => {
    const url = `content/web/admin/feedbacks/${id}/`;
    return httpRequest.delete(url);
  },
};

export default adminManagementService;
