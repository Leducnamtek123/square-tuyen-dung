import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';
import { PaginatedResponse } from '../types/api';
import { Career, City, District, Ward, Company, JobSeekerProfile, Resume, JobPostActivity, Notification, QuestionGroup, Banner, Feedback, Question } from '../types/models';

type AnyRecord = Record<string, unknown>;

type IdType = string | number;

const withPresign = async <T>(promise: Promise<T>): Promise<T> => {
  const data = await promise;
  return presignInObject(data) as T;
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

  getCities: (params: AnyRecord = {}): Promise<PaginatedResponse<City>> => {
    const url = 'common/admin/cities/';
    return withPresign(httpRequest.get<PaginatedResponse<City>>(url, { params })) as any as Promise<PaginatedResponse<City>>;
  },

  createCity: (data: AnyRecord): Promise<City> => {
    const url = 'common/admin/cities/';
    return withPresign(httpRequest.post<City>(url, data)) as any as Promise<City>;
  },

  updateCity: (id: IdType, data: AnyRecord): Promise<City> => {
    const url = `common/admin/cities/${id}/`;
    return withPresign(httpRequest.patch<City>(url, data)) as any as Promise<City>;
  },

  deleteCity: (id: IdType): Promise<unknown> => {
    const url = `common/admin/cities/${id}/`;
    return httpRequest.delete(url);
  },

  getDistricts: (params: AnyRecord = {}): Promise<PaginatedResponse<District>> => {
    const url = 'common/admin/districts/';
    return withPresign(httpRequest.get<PaginatedResponse<District>>(url, { params })) as any as Promise<PaginatedResponse<District>>;
  },

  createDistrict: (data: AnyRecord): Promise<District> => {
    const url = 'common/admin/districts/';
    return withPresign(httpRequest.post<District>(url, data)) as any as Promise<District>;
  },

  updateDistrict: (id: IdType, data: AnyRecord): Promise<District> => {
    const url = `common/admin/districts/${id}/`;
    return withPresign(httpRequest.patch<District>(url, data)) as any as Promise<District>;
  },

  deleteDistrict: (id: IdType): Promise<unknown> => {
    const url = `common/admin/districts/${id}/`;
    return httpRequest.delete(url);
  },

  getWards: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<Ward>> => {
    const url = 'info/web/admin/wards/';
    return httpRequest.get(url, { params }) as any as Promise<PaginatedResponse<Ward>>;
  },

  createWard: (data: Record<string, unknown>): Promise<Ward> => {
    const url = 'info/web/admin/wards/';
    return httpRequest.post(url, data) as any as Promise<Ward>;
  },

  updateWard: (id: string | number, data: Record<string, unknown>): Promise<Ward> => {
    const url = `info/web/admin/wards/${id}/`;
    return httpRequest.patch(url, data) as any as Promise<Ward>;
  },

  deleteWard: (id: string | number): Promise<void> => {
    const url = `info/web/admin/wards/${id}/`;
    return httpRequest.delete(url);
  },

  getCompanies: (params: AnyRecord = {}): Promise<PaginatedResponse<Company>> => {
    const url = 'info/web/admin/companies/';
    return withPresign(httpRequest.get<PaginatedResponse<Company>>(url, { params })) as any as Promise<PaginatedResponse<Company>>;
  },

  getCompanyDetail: (id: IdType): Promise<Company> => {
    const url = `info/web/admin/companies/${id}/`;
    return withPresign(httpRequest.get<Company>(url)) as any as Promise<Company>;
  },

  createCompany: (data: AnyRecord | FormData): Promise<Company> => {
    const url = 'info/web/admin/companies/';
    return withPresign(httpRequest.post<Company>(url, data, adminManagementService.buildMultipartConfig(data))) as any as Promise<Company>;
  },

  updateCompany: (id: IdType, data: AnyRecord | FormData): Promise<Company> => {
    const url = `info/web/admin/companies/${id}/`;
    return withPresign(httpRequest.patch<Company>(url, data, adminManagementService.buildMultipartConfig(data))) as any as Promise<Company>;
  },

  deleteCompany: (id: IdType): Promise<void> => {
    const url = `info/web/admin/companies/${id}/`;
    return httpRequest.delete(url);
  },

  getBanners: (params: AnyRecord = {}): Promise<PaginatedResponse<Banner>> => {
    const url = 'info/web/admin/banners/';
    return withPresign(httpRequest.get<PaginatedResponse<Banner>>(url, { params })) as any as Promise<PaginatedResponse<Banner>>;
  },

  createBanner: (data: AnyRecord | FormData): Promise<Banner> => {
    const url = 'info/web/admin/banners/';
    return withPresign(httpRequest.post<Banner>(url, data, adminManagementService.buildMultipartConfig(data))) as any as Promise<Banner>;
  },

  updateBanner: (id: IdType, data: AnyRecord | FormData): Promise<Banner> => {
    const url = `info/web/admin/banners/${id}/`;
    return withPresign(httpRequest.patch<Banner>(url, data, adminManagementService.buildMultipartConfig(data))) as any as Promise<Banner>;
  },

  deleteBanner: (id: IdType): Promise<void> => {
    const url = `info/web/admin/banners/${id}/`;
    return httpRequest.delete(url);
  },

  getFeedbacks: (params: AnyRecord = {}): Promise<PaginatedResponse<Feedback>> => {
    const url = 'info/web/admin/feedbacks/';
    return withPresign(httpRequest.get<PaginatedResponse<Feedback>>(url, { params })) as any as Promise<PaginatedResponse<Feedback>>;
  },

  updateFeedback: (id: IdType, data: AnyRecord): Promise<Feedback> => {
    const url = `info/web/admin/feedbacks/${id}/`;
    return withPresign(httpRequest.patch<Feedback>(url, data)) as any as Promise<Feedback>;
  },

  deleteFeedback: (id: IdType): Promise<void> => {
    const url = `info/web/admin/feedbacks/${id}/`;
    return httpRequest.delete(url);
  },

  // Job Seeker Profiles

  getProfiles: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<JobSeekerProfile>> => {
    const url = 'info/web/admin/job-seeker-profiles/';
    return withPresign(httpRequest.get(url, { params })) as any as Promise<PaginatedResponse<JobSeekerProfile>>;
  },

  getProfileDetail: (id: string | number): Promise<JobSeekerProfile> => {
    const url = `info/web/admin/job-seeker-profiles/${id}/`;
    return withPresign(httpRequest.get(url)) as any as Promise<JobSeekerProfile>;
  },

  createProfile: (data: Record<string, unknown>): Promise<JobSeekerProfile> => {
    const url = 'info/web/admin/job-seeker-profiles/';
    return withPresign(httpRequest.post(url, data)) as any as Promise<JobSeekerProfile>;
  },

  updateProfile: (id: string | number, data: Record<string, unknown>): Promise<JobSeekerProfile> => {
    const url = `info/web/admin/job-seeker-profiles/${id}/`;
    return withPresign(httpRequest.patch(url, data)) as any as Promise<JobSeekerProfile>;
  },

  deleteProfile: (id: string | number): Promise<void> => {
    const url = `info/web/admin/job-seeker-profiles/${id}/`;
    return httpRequest.delete(url);
  },

  getResumes: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<Resume>> => {
    const url = 'info/web/admin/resumes/';
    return withPresign(httpRequest.get(url, { params })) as any as Promise<PaginatedResponse<Resume>>;
  },

  getResumeDetail: (id: string | number): Promise<Resume> => {
    const url = `info/web/admin/resumes/${id}/`;
    return withPresign(httpRequest.get(url)) as any as Promise<Resume>;
  },

  createResume: (data: Record<string, unknown>): Promise<Resume> => {
    const url = 'info/web/admin/resumes/';
    return withPresign(httpRequest.post(url, data)) as any as Promise<Resume>;
  },

  updateResume: (id: string | number, data: Record<string, unknown>): Promise<Resume> => {
    const url = `info/web/admin/resumes/${id}/`;
    return withPresign(httpRequest.patch(url, data)) as any as Promise<Resume>;
  },

  deleteResume: (id: string | number): Promise<void> => {
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

  getQuestionGroups: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<QuestionGroup>> => {
    const url = 'interview/web/question-groups/';
    return httpRequest.get(url, { params: normalizeInterviewListParams(params) }) as any as Promise<PaginatedResponse<QuestionGroup>>;
  },

  createQuestionGroup: (data: Record<string, unknown>): Promise<QuestionGroup> => {
    const url = 'interview/web/question-groups/';
    return httpRequest.post(url, data) as any as Promise<QuestionGroup>;
  },

  updateQuestionGroup: (id: string | number, data: Record<string, unknown>): Promise<QuestionGroup> => {
    const url = `interview/web/question-groups/${id}/`;
    return httpRequest.patch(url, data) as any as Promise<QuestionGroup>;
  },

  deleteQuestionGroup: (id: string | number): Promise<void> => {
    const url = `interview/web/question-groups/${id}/`;
    return httpRequest.delete(url);
  },

  // Questions (Admin)
  getQuestions: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<Question>> => {
    const url = 'interview/web/questions/';
    return httpRequest.get(url, { params: normalizeInterviewListParams(params) }) as any as Promise<PaginatedResponse<Question>>;
  },

  createQuestion: (data: Record<string, unknown>): Promise<Question> => {
    const url = 'interview/web/questions/';
    return httpRequest.post(url, data) as any as Promise<Question>;
  },

  updateQuestion: (id: string | number, data: Record<string, unknown>): Promise<Question> => {
    const url = `interview/web/questions/${id}/`;
    return httpRequest.patch(url, data) as any as Promise<Question>;
  },

  deleteQuestion: (id: string | number): Promise<void> => {
    const url = `interview/web/questions/${id}/`;
    return httpRequest.delete(url);
  },
};

export default adminManagementService;
