import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';
import { PaginatedResponse } from '../types/api';
import { Career, City, District, Ward, Company, JobSeekerProfile, Resume, JobPostActivity, Notification, QuestionGroup, Banner, Feedback, Question } from '../types/models';

type IdType = string | number;

const withPresign = async <T>(promise: Promise<T>): Promise<T> => {
  const data = await promise;
  return presignInObject(data) as T;
};

const normalizeInterviewListParams = (params: Record<string, unknown> = {}): Record<string, unknown> => {
  const normalized: Record<string, unknown> = { ...params };
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

  getCareers: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<Career>> => {
    const url = 'common/admin/careers/';
    return withPresign(httpRequest.get<PaginatedResponse<Career>>(url, { params }) as unknown as Promise<PaginatedResponse<Career>>);
  },

  createCareer: (data: Record<string, unknown> | FormData): Promise<Career> => {
    const url = 'common/admin/careers/';
    return withPresign(
      httpRequest.post<Career>(url, data, adminManagementService.buildMultipartConfig(data)) as unknown as Promise<Career>
    );
  },

  updateCareer: (id: IdType, data: Record<string, unknown> | FormData): Promise<Career> => {
    const url = `common/admin/careers/${id}/`;
    return withPresign(
      httpRequest.patch<Career>(url, data, adminManagementService.buildMultipartConfig(data)) as unknown as Promise<Career>
    );
  },

  deleteCareer: (id: IdType): Promise<void> => {
    const url = `common/admin/careers/${id}/`;
    return httpRequest.delete(url) as unknown as Promise<void>;
  },

  getCities: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<City>> => {
    const url = 'common/admin/cities/';
    return withPresign(httpRequest.get<PaginatedResponse<City>>(url, { params }) as unknown as Promise<PaginatedResponse<City>>);
  },

  createCity: (data: Record<string, unknown>): Promise<City> => {
    const url = 'common/admin/cities/';
    return withPresign(httpRequest.post<City>(url, data) as unknown as Promise<City>);
  },

  updateCity: (id: IdType, data: Record<string, unknown>): Promise<City> => {
    const url = `common/admin/cities/${id}/`;
    return withPresign(httpRequest.patch<City>(url, data) as unknown as Promise<City>);
  },

  deleteCity: (id: IdType): Promise<void> => {
    const url = `common/admin/cities/${id}/`;
    return httpRequest.delete(url) as unknown as Promise<void>;
  },

  getDistricts: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<District>> => {
    const url = 'common/admin/districts/';
    return withPresign(httpRequest.get<PaginatedResponse<District>>(url, { params }) as unknown as Promise<PaginatedResponse<District>>);
  },

  createDistrict: (data: Record<string, unknown>): Promise<District> => {
    const url = 'common/admin/districts/';
    return withPresign(httpRequest.post<District>(url, data) as unknown as Promise<District>);
  },

  updateDistrict: (id: IdType, data: Record<string, unknown>): Promise<District> => {
    const url = `common/admin/districts/${id}/`;
    return withPresign(httpRequest.patch<District>(url, data) as unknown as Promise<District>);
  },

  deleteDistrict: (id: IdType): Promise<void> => {
    const url = `common/admin/districts/${id}/`;
    return httpRequest.delete(url) as unknown as Promise<void>;
  },

  getWards: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<Ward>> => {
    const url = 'info/web/admin/wards/';
    return httpRequest.get<PaginatedResponse<Ward>>(url, { params }) as unknown as Promise<PaginatedResponse<Ward>>;
  },

  createWard: (data: Record<string, unknown>): Promise<Ward> => {
    const url = 'info/web/admin/wards/';
    return httpRequest.post<Ward>(url, data) as unknown as Promise<Ward>;
  },

  updateWard: (id: string | number, data: Record<string, unknown>): Promise<Ward> => {
    const url = `info/web/admin/wards/${id}/`;
    return httpRequest.patch<Ward>(url, data) as unknown as Promise<Ward>;
  },

  deleteWard: (id: string | number): Promise<void> => {
    const url = `info/web/admin/wards/${id}/`;
    return httpRequest.delete(url) as unknown as Promise<void>;
  },

  getCompanies: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<Company>> => {
    const url = 'info/web/admin/companies/';
    return withPresign(httpRequest.get<PaginatedResponse<Company>>(url, { params }) as unknown as Promise<PaginatedResponse<Company>>);
  },

  getCompanyDetail: (id: IdType): Promise<Company> => {
    const url = `info/web/admin/companies/${id}/`;
    return withPresign(httpRequest.get<Company>(url) as unknown as Promise<Company>);
  },

  createCompany: (data: Record<string, unknown> | FormData): Promise<Company> => {
    const url = 'info/web/admin/companies/';
    return withPresign(httpRequest.post<Company>(url, data, adminManagementService.buildMultipartConfig(data)) as unknown as Promise<Company>);
  },

  updateCompany: (id: IdType, data: Record<string, unknown> | FormData): Promise<Company> => {
    const url = `info/web/admin/companies/${id}/`;
    return withPresign(httpRequest.patch<Company>(url, data, adminManagementService.buildMultipartConfig(data)) as unknown as Promise<Company>);
  },

  deleteCompany: (id: IdType): Promise<void> => {
    const url = `info/web/admin/companies/${id}/`;
    return httpRequest.delete(url) as unknown as Promise<void>;
  },

  getBanners: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<Banner>> => {
    const url = 'info/web/admin/banners/';
    return withPresign(httpRequest.get<PaginatedResponse<Banner>>(url, { params }) as unknown as Promise<PaginatedResponse<Banner>>);
  },

  createBanner: (data: Record<string, unknown> | FormData): Promise<Banner> => {
    const url = 'info/web/admin/banners/';
    return withPresign(httpRequest.post<Banner>(url, data, adminManagementService.buildMultipartConfig(data)) as unknown as Promise<Banner>);
  },

  updateBanner: (id: IdType, data: Record<string, unknown> | FormData): Promise<Banner> => {
    const url = `info/web/admin/banners/${id}/`;
    return withPresign(httpRequest.patch<Banner>(url, data, adminManagementService.buildMultipartConfig(data)) as unknown as Promise<Banner>);
  },

  deleteBanner: (id: IdType): Promise<void> => {
    const url = `info/web/admin/banners/${id}/`;
    return httpRequest.delete(url) as unknown as Promise<void>;
  },

  getFeedbacks: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<Feedback>> => {
    const url = 'info/web/admin/feedbacks/';
    return withPresign(httpRequest.get<PaginatedResponse<Feedback>>(url, { params }) as unknown as Promise<PaginatedResponse<Feedback>>);
  },

  updateFeedback: (id: IdType, data: Record<string, unknown>): Promise<Feedback> => {
    const url = `info/web/admin/feedbacks/${id}/`;
    return withPresign(httpRequest.patch<Feedback>(url, data) as unknown as Promise<Feedback>);
  },

  deleteFeedback: (id: IdType): Promise<void> => {
    const url = `info/web/admin/feedbacks/${id}/`;
    return httpRequest.delete(url) as unknown as Promise<void>;
  },

  // Job Seeker Profiles

  getProfiles: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<JobSeekerProfile>> => {
    const url = 'info/web/admin/job-seeker-profiles/';
    return withPresign(httpRequest.get<PaginatedResponse<JobSeekerProfile>>(url, { params }) as unknown as Promise<PaginatedResponse<JobSeekerProfile>>);
  },

  getProfileDetail: (id: string | number): Promise<JobSeekerProfile> => {
    const url = `info/web/admin/job-seeker-profiles/${id}/`;
    return withPresign(httpRequest.get<JobSeekerProfile>(url) as unknown as Promise<JobSeekerProfile>);
  },

  createProfile: (data: Record<string, unknown>): Promise<JobSeekerProfile> => {
    const url = 'info/web/admin/job-seeker-profiles/';
    return withPresign(httpRequest.post<JobSeekerProfile>(url, data) as unknown as Promise<JobSeekerProfile>);
  },

  updateProfile: (id: string | number, data: Record<string, unknown>): Promise<JobSeekerProfile> => {
    const url = `info/web/admin/job-seeker-profiles/${id}/`;
    return withPresign(httpRequest.patch<JobSeekerProfile>(url, data) as unknown as Promise<JobSeekerProfile>);
  },

  deleteProfile: (id: string | number): Promise<void> => {
    const url = `info/web/admin/job-seeker-profiles/${id}/`;
    return httpRequest.delete(url) as unknown as Promise<void>;
  },

  getResumes: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<Resume>> => {
    const url = 'info/web/admin/resumes/';
    return withPresign(httpRequest.get<PaginatedResponse<Resume>>(url, { params }) as unknown as Promise<PaginatedResponse<Resume>>);
  },

  getResumeDetail: (id: string | number): Promise<Resume> => {
    const url = `info/web/admin/resumes/${id}/`;
    return withPresign(httpRequest.get<Resume>(url) as unknown as Promise<Resume>);
  },

  createResume: (data: Record<string, unknown>): Promise<Resume> => {
    const url = 'info/web/admin/resumes/';
    return withPresign(httpRequest.post<Resume>(url, data) as unknown as Promise<Resume>);
  },

  updateResume: (id: string | number, data: Record<string, unknown>): Promise<Resume> => {
    const url = `info/web/admin/resumes/${id}/`;
    return withPresign(httpRequest.patch<Resume>(url, data) as unknown as Promise<Resume>);
  },

  deleteResume: (id: string | number): Promise<void> => {
    const url = `info/web/admin/resumes/${id}/`;
    return httpRequest.delete(url) as unknown as Promise<void>;
  },

  // Job Activity

  getJobActivities: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<JobPostActivity>> => {
    const url = 'job/web/admin/job-posts-activity/';
    return httpRequest.get<PaginatedResponse<JobPostActivity>>(url, { params }) as unknown as Promise<PaginatedResponse<JobPostActivity>>;
  },

  createJobActivity: (data: Record<string, unknown>): Promise<JobPostActivity> => {
    const url = 'job/web/admin/job-posts-activity/';
    return httpRequest.post<JobPostActivity>(url, data) as unknown as Promise<JobPostActivity>;
  },

  updateJobActivity: (id: IdType, data: Record<string, unknown>): Promise<JobPostActivity> => {
    const url = `job/web/admin/job-posts-activity/${id}/`;
    return httpRequest.patch<JobPostActivity>(url, data) as unknown as Promise<JobPostActivity>;
  },

  deleteJobActivity: (id: IdType): Promise<void> => {
    const url = `job/web/admin/job-posts-activity/${id}/`;
    return httpRequest.delete(url) as unknown as Promise<void>;
  },

  getJobNotifications: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<Notification>> => {
    const url = 'job/web/admin/job-post-notifications/';
    return httpRequest.get<PaginatedResponse<Notification>>(url, { params }) as unknown as Promise<PaginatedResponse<Notification>>;
  },

  createJobNotification: (data: Record<string, unknown>): Promise<Notification> => {
    const url = 'job/web/admin/job-post-notifications/';
    return httpRequest.post<Notification>(url, data) as unknown as Promise<Notification>;
  },

  updateJobNotification: (id: IdType, data: Record<string, unknown>): Promise<Notification> => {
    const url = `job/web/admin/job-post-notifications/${id}/`;
    return httpRequest.patch<Notification>(url, data) as unknown as Promise<Notification>;
  },

  deleteJobNotification: (id: IdType): Promise<void> => {
    const url = `job/web/admin/job-post-notifications/${id}/`;
    return httpRequest.delete(url) as unknown as Promise<void>;
  },

  getQuestionGroups: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<QuestionGroup>> => {
    const url = 'interview/web/question-groups/';
    return httpRequest.get<PaginatedResponse<QuestionGroup>>(url, { params: normalizeInterviewListParams(params) }) as unknown as Promise<PaginatedResponse<QuestionGroup>>;
  },

  createQuestionGroup: (data: Record<string, unknown>): Promise<QuestionGroup> => {
    const url = 'interview/web/question-groups/';
    return httpRequest.post<QuestionGroup>(url, data) as unknown as Promise<QuestionGroup>;
  },

  updateQuestionGroup: (id: string | number, data: Record<string, unknown>): Promise<QuestionGroup> => {
    const url = `interview/web/question-groups/${id}/`;
    return httpRequest.patch<QuestionGroup>(url, data) as unknown as Promise<QuestionGroup>;
  },

  deleteQuestionGroup: (id: string | number): Promise<void> => {
    const url = `interview/web/question-groups/${id}/`;
    return httpRequest.delete(url) as unknown as Promise<void>;
  },

  // Questions (Admin)
  getQuestions: (params: Record<string, unknown> = {}): Promise<PaginatedResponse<Question>> => {
    const url = 'interview/web/questions/';
    return httpRequest.get<PaginatedResponse<Question>>(url, { params: normalizeInterviewListParams(params) }) as unknown as Promise<PaginatedResponse<Question>>;
  },

  createQuestion: (data: Record<string, unknown>): Promise<Question> => {
    const url = 'interview/web/questions/';
    return httpRequest.post<Question>(url, data) as unknown as Promise<Question>;
  },

  updateQuestion: (id: string | number, data: Record<string, unknown>): Promise<Question> => {
    const url = `interview/web/questions/${id}/`;
    return httpRequest.patch<Question>(url, data) as unknown as Promise<Question>;
  },

  deleteQuestion: (id: string | number): Promise<void> => {
    const url = `interview/web/questions/${id}/`;
    return httpRequest.delete(url) as unknown as Promise<void>;
  },
};

export default adminManagementService;
