import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';
import { PaginatedResponse } from '../types/api';
import { cleanParams } from '../utils/params';
import {
  Career,
  City,
  District,
  Ward,
  Company,
  JobSeekerProfile,
  Resume,
  JobPostActivity,
  QuestionGroup,
  Banner,
  BannerType,
  Feedback,
  Question,
  JobPostNotification,
  TrustReport,
  CompanyVerification,
  AuditLog,
} from '../types/models';

type IdType = string | number;

export type AdminListParams = {
  page?: number;
  pageSize?: number;
  ordering?: string;
  kw?: string;
  search?: string;
  roleName?: string;
  status?: string;
  action?: string;
  actorEmail?: string;
  targetType?: string;
  resourceType?: string;
  resourceId?: string;
  dateFrom?: string;
  dateTo?: string;
  statusId?: string | number;
  isExpired?: boolean | string;
};

export interface CareerPayload {
  name: string;
  appIconName?: string | null;
  isHot?: boolean;
  iconFile?: File | null;
}

export interface CityPayload {
  name: string;
  code: string;
}

export interface DistrictPayload {
  name: string;
  code: string;
  city: number;
}

export interface WardPayload {
  name: string;
  code: string;
  district: number;
}

export interface AdminBannerPayload {
  button_text?: string;
  description?: string;
  button_link?: string | null;
  is_show_button?: boolean;
  description_location?: number;
  platform?: string;
  type?: number;
  is_active?: boolean;
  image?: File;
  image_mobile?: File;
}

export interface AdminFeedbackPayload {
  content?: string;
  rating?: number;
  is_active?: boolean;
  user?: number;
}

export interface AdminBannerTypePayload {
  code: string;
  name: string;
  value: number;
  web_aspect_ratio?: string;
  mobile_aspect_ratio?: string;
  is_active?: boolean;
}

export interface JobPostNotificationPayload {
  jobName: string;
  position?: number | null;
  experience?: number | null;
  salary?: number | null;
  frequency: number;
  isActive?: boolean;
  career?: number | null;
  city?: number | null;
}

interface QuestionPayload {
  text: string;
  difficulty?: string;
  career?: number | null;
}

interface QuestionGroupPayload {
  name: string;
  description?: string;
  evaluation_rubric_input?: unknown;
  question_ids?: number[];
}

export type JobSeekerProfilePayload = Partial<JobSeekerProfile>;
export type ResumePayload = Partial<Resume>;
export type JobPostActivityPayload = Partial<JobPostActivity>;

const withPresign = async <T>(promise: Promise<T>): Promise<T> => {
  const data = await promise;
  return presignInObject(data) as T;
};

const adminManagementService = {
  buildMultipartConfig: (data: unknown): { headers: { 'Content-Type': string } } | undefined => {
    if (data instanceof FormData) {
      return { headers: { 'Content-Type': 'multipart/form-data' } };
    }
    return undefined;
  },

  getCareers: (params: AdminListParams = {}): Promise<PaginatedResponse<Career>> => {
    const url = 'common/admin/careers/';
    return withPresign(httpRequest.get<PaginatedResponse<Career>>(url, { params: cleanParams(params) }));
  },

  createCareer: (data: CareerPayload | FormData): Promise<Career> => {
    const url = 'common/admin/careers/';
    return withPresign(
      httpRequest.post<Career>(url, data, adminManagementService.buildMultipartConfig(data))
    );
  },

  updateCareer: (id: IdType, data: Partial<CareerPayload> | FormData): Promise<Career> => {
    const url = `common/admin/careers/${id}/`;
    return withPresign(
      httpRequest.patch<Career>(url, data, adminManagementService.buildMultipartConfig(data))
    );
  },

  deleteCareer: (id: IdType): Promise<void> => {
    const url = `common/admin/careers/${id}/`;
    return httpRequest.delete(url);
  },

  getCities: (params: AdminListParams = {}): Promise<PaginatedResponse<City>> => {
    const url = 'common/admin/cities/';
    return withPresign(httpRequest.get<PaginatedResponse<City>>(url, { params: cleanParams(params) }));
  },

  createCity: (data: CityPayload): Promise<City> => {
    const url = 'common/admin/cities/';
    return withPresign(httpRequest.post<City>(url, data));
  },

  updateCity: (id: IdType, data: Partial<CityPayload>): Promise<City> => {
    const url = `common/admin/cities/${id}/`;
    return withPresign(httpRequest.patch<City>(url, data));
  },

  deleteCity: (id: IdType): Promise<void> => {
    const url = `common/admin/cities/${id}/`;
    return httpRequest.delete(url);
  },

  getDistricts: (params: AdminListParams & { city?: number } = {}): Promise<PaginatedResponse<District>> => {
    const url = 'common/admin/districts/';
    return withPresign(httpRequest.get<PaginatedResponse<District>>(url, { params: cleanParams(params) }));
  },

  createDistrict: (data: DistrictPayload): Promise<District> => {
    const url = 'common/admin/districts/';
    return withPresign(httpRequest.post<District>(url, data));
  },

  updateDistrict: (id: IdType, data: Partial<DistrictPayload>): Promise<District> => {
    const url = `common/admin/districts/${id}/`;
    return withPresign(httpRequest.patch<District>(url, data));
  },

  deleteDistrict: (id: IdType): Promise<void> => {
    const url = `common/admin/districts/${id}/`;
    return httpRequest.delete(url);
  },

  getWards: (params: AdminListParams & { district?: number } = {}): Promise<PaginatedResponse<Ward>> => {
    const url = 'common/admin/wards/';
    return httpRequest.get<PaginatedResponse<Ward>>(url, { params: cleanParams(params) });
  },

  createWard: (data: WardPayload): Promise<Ward> => {
    const url = 'common/admin/wards/';
    return httpRequest.post<Ward>(url, data);
  },

  updateWard: (id: string | number, data: Partial<WardPayload>): Promise<Ward> => {
    const url = `common/admin/wards/${id}/`;
    return httpRequest.patch<Ward>(url, data);
  },

  deleteWard: (id: string | number): Promise<void> => {
    const url = `common/admin/wards/${id}/`;
    return httpRequest.delete(url);
  },

  getCompanies: (params: AdminListParams = {}): Promise<PaginatedResponse<Company>> => {
    const url = 'info/web/admin/companies/';
    return withPresign(httpRequest.get<PaginatedResponse<Company>>(url, { params: cleanParams(params) }));
  },

  getCompanyDetail: (id: IdType): Promise<Company> => {
    const url = `info/web/admin/companies/${id}/`;
    return withPresign(httpRequest.get<Company>(url));
  },

  createCompany: <T extends object | FormData>(data: T): Promise<Company> => {
    const url = 'info/web/admin/companies/';
    return withPresign(httpRequest.post<Company>(url, data, adminManagementService.buildMultipartConfig(data)));
  },

  updateCompany: <T extends object | FormData>(id: IdType, data: T): Promise<Company> => {
    const url = `info/web/admin/companies/${id}/`;
    return withPresign(httpRequest.patch<Company>(url, data, adminManagementService.buildMultipartConfig(data)));
  },

  deleteCompany: (id: IdType): Promise<void> => {
    const url = `info/web/admin/companies/${id}/`;
    return httpRequest.delete(url);
  },

  getCompanyVerifications: (params: AdminListParams = {}): Promise<PaginatedResponse<CompanyVerification>> => {
    const url = 'info/web/admin/company-verifications/';
    return httpRequest.get<PaginatedResponse<CompanyVerification>>(url, { params: cleanParams(params) });
  },

  updateCompanyVerification: (id: IdType, data: Pick<CompanyVerification, 'status'> & { adminNote?: string }): Promise<CompanyVerification> => {
    const url = `info/web/admin/company-verifications/${id}/`;
    return httpRequest.patch<CompanyVerification>(url, data);
  },

  getTrustReports: (params: AdminListParams = {}): Promise<PaginatedResponse<TrustReport>> => {
    const url = 'info/web/admin/trust-reports/';
    return httpRequest.get<PaginatedResponse<TrustReport>>(url, { params: cleanParams(params) });
  },

  getAuditLogs: (params: AdminListParams = {}): Promise<PaginatedResponse<AuditLog>> => {
    const url = 'common/admin/audit-logs/';
    return httpRequest.get<PaginatedResponse<AuditLog>>(url, { params: cleanParams(params) });
  },

  exportAuditLogs: (params: AdminListParams = {}): Promise<Blob> => {
    const url = 'common/admin/audit-logs/export/';
    return httpRequest.get<Blob>(url, {
      params: cleanParams(params),
      responseType: 'blob',
    });
  },

  updateTrustReport: (id: IdType, data: Pick<TrustReport, 'status'>): Promise<TrustReport> => {
    const url = `info/web/admin/trust-reports/${id}/`;
    return httpRequest.patch<TrustReport>(url, data);
  },

  getBanners: (params: AdminListParams = {}): Promise<PaginatedResponse<Banner>> => {
    const url = 'content/web/admin/banners/';
    return withPresign(httpRequest.get<PaginatedResponse<Banner>>(url, { params: cleanParams(params) }));
  },

  createBanner: (data: AdminBannerPayload | FormData): Promise<Banner> => {
    const url = 'content/web/admin/banners/';
    return withPresign(httpRequest.post<Banner>(url, data, adminManagementService.buildMultipartConfig(data)));
  },

  updateBanner: (id: IdType, data: Partial<AdminBannerPayload> | FormData): Promise<Banner> => {
    const url = `content/web/admin/banners/${id}/`;
    return withPresign(httpRequest.patch<Banner>(url, data, adminManagementService.buildMultipartConfig(data)));
  },

  deleteBanner: (id: IdType): Promise<void> => {
    const url = `content/web/admin/banners/${id}/`;
    return httpRequest.delete(url);
  },

  getBannerTypes: (params: AdminListParams = {}): Promise<PaginatedResponse<BannerType>> => {
    const url = 'content/web/admin/banner-types/';
    return withPresign(httpRequest.get<PaginatedResponse<BannerType>>(url, { params: cleanParams(params) }));
  },

  createBannerType: (data: AdminBannerTypePayload): Promise<BannerType> => {
    const url = 'content/web/admin/banner-types/';
    return withPresign(httpRequest.post<BannerType>(url, data));
  },

  updateBannerType: (id: IdType, data: Partial<AdminBannerTypePayload>): Promise<BannerType> => {
    const url = `content/web/admin/banner-types/${id}/`;
    return withPresign(httpRequest.patch<BannerType>(url, data));
  },

  deleteBannerType: (id: IdType): Promise<void> => {
    const url = `content/web/admin/banner-types/${id}/`;
    return httpRequest.delete(url);
  },

  getFeedbacks: (params: AdminListParams = {}): Promise<PaginatedResponse<Feedback>> => {
    const url = 'content/web/admin/feedbacks/';
    return withPresign(httpRequest.get<PaginatedResponse<Feedback>>(url, { params: cleanParams(params) }));
  },

  updateFeedback: (id: IdType, data: Partial<AdminFeedbackPayload>): Promise<Feedback> => {
    const url = `content/web/admin/feedbacks/${id}/`;
    return withPresign(httpRequest.patch<Feedback>(url, data));
  },

  deleteFeedback: (id: IdType): Promise<void> => {
    const url = `content/web/admin/feedbacks/${id}/`;
    return httpRequest.delete(url);
  },

  // Job Seeker Profiles

  getProfiles: (params: AdminListParams = {}): Promise<PaginatedResponse<JobSeekerProfile>> => {
    const url = 'info/web/admin/job-seeker-profiles/';
    return withPresign(httpRequest.get<PaginatedResponse<JobSeekerProfile>>(url, { params: cleanParams(params) }));
  },

  getProfileDetail: (id: string | number): Promise<JobSeekerProfile> => {
    const url = `info/web/admin/job-seeker-profiles/${id}/`;
    return withPresign(httpRequest.get<JobSeekerProfile>(url));
  },

  createProfile: (data: JobSeekerProfilePayload): Promise<JobSeekerProfile> => {
    const url = 'info/web/admin/job-seeker-profiles/';
    return withPresign(httpRequest.post<JobSeekerProfile>(url, data));
  },

  updateProfile: (id: string | number, data: JobSeekerProfilePayload): Promise<JobSeekerProfile> => {
    const url = `info/web/admin/job-seeker-profiles/${id}/`;
    return withPresign(httpRequest.patch<JobSeekerProfile>(url, data));
  },

  deleteProfile: (id: string | number): Promise<void> => {
    const url = `info/web/admin/job-seeker-profiles/${id}/`;
    return httpRequest.delete(url);
  },

  getResumes: (params: AdminListParams = {}): Promise<PaginatedResponse<Resume>> => {
    const url = 'info/web/admin/resumes/';
    return withPresign(httpRequest.get<PaginatedResponse<Resume>>(url, { params: cleanParams(params) }));
  },

  getResumeDetail: (id: string | number): Promise<Resume> => {
    const url = `info/web/admin/resumes/${id}/`;
    return withPresign(httpRequest.get<Resume>(url));
  },

  createResume: (data: ResumePayload): Promise<Resume> => {
    const url = 'info/web/admin/resumes/';
    return withPresign(httpRequest.post<Resume>(url, data));
  },

  updateResume: (id: string | number, data: ResumePayload): Promise<Resume> => {
    const url = `info/web/admin/resumes/${id}/`;
    return withPresign(httpRequest.patch<Resume>(url, data));
  },

  deleteResume: (id: string | number): Promise<void> => {
    const url = `info/web/admin/resumes/${id}/`;
    return httpRequest.delete(url);
  },

  // Job Activity

  getJobActivities: (params: AdminListParams = {}): Promise<PaginatedResponse<JobPostActivity>> => {
    const url = 'job/web/admin/job-posts-activity/';
    return httpRequest.get<PaginatedResponse<JobPostActivity>>(url, { params: cleanParams(params) });
  },

  createJobActivity: (data: JobPostActivityPayload): Promise<JobPostActivity> => {
    const url = 'job/web/admin/job-posts-activity/';
    return httpRequest.post<JobPostActivity>(url, data);
  },

  updateJobActivity: (id: IdType, data: JobPostActivityPayload): Promise<JobPostActivity> => {
    const url = `job/web/admin/job-posts-activity/${id}/`;
    return httpRequest.patch<JobPostActivity>(url, data);
  },

  deleteJobActivity: (id: IdType): Promise<void> => {
    const url = `job/web/admin/job-posts-activity/${id}/`;
    return httpRequest.delete(url);
  },

  getJobNotifications: (params: AdminListParams = {}): Promise<PaginatedResponse<JobPostNotification>> => {
    const url = 'job/web/admin/job-post-notifications/';
    return httpRequest.get<PaginatedResponse<JobPostNotification>>(url, { params: cleanParams(params) });
  },

  createJobNotification: (data: JobPostNotificationPayload): Promise<JobPostNotification> => {
    const url = 'job/web/admin/job-post-notifications/';
    return httpRequest.post<JobPostNotification>(url, data);
  },

  updateJobNotification: (id: IdType, data: Partial<JobPostNotificationPayload>): Promise<JobPostNotification> => {
    const url = `job/web/admin/job-post-notifications/${id}/`;
    return httpRequest.patch<JobPostNotification>(url, data);
  },

  deleteJobNotification: (id: IdType): Promise<void> => {
    const url = `job/web/admin/job-post-notifications/${id}/`;
    return httpRequest.delete(url);
  },

  getQuestionGroups: (params: AdminListParams = {}): Promise<PaginatedResponse<QuestionGroup>> => {
    const url = 'interview/web/question-groups/';
    return httpRequest.get<PaginatedResponse<QuestionGroup>>(url, { params: cleanParams(params) });
  },

  createQuestionGroup: (data: QuestionGroupPayload): Promise<QuestionGroup> => {
    const url = 'interview/web/question-groups/';
    return httpRequest.post<QuestionGroup>(url, data);
  },

  updateQuestionGroup: (id: string | number, data: Partial<QuestionGroupPayload>): Promise<QuestionGroup> => {
    const url = `interview/web/question-groups/${id}/`;
    return httpRequest.patch<QuestionGroup>(url, data);
  },

  deleteQuestionGroup: (id: string | number): Promise<void> => {
    const url = `interview/web/question-groups/${id}/`;
    return httpRequest.delete(url);
  },

  // Questions (Admin)
  getQuestions: (params: AdminListParams = {}): Promise<PaginatedResponse<Question>> => {
    const url = 'interview/web/questions/';
    return httpRequest.get<PaginatedResponse<Question>>(url, { params: cleanParams(params) });
  },

  createQuestion: (data: QuestionPayload): Promise<Question> => {
    const url = 'interview/web/questions/';
    return httpRequest.post<Question>(url, data);
  },

  updateQuestion: (id: string | number, data: Partial<QuestionPayload>): Promise<Question> => {
    const url = `interview/web/questions/${id}/`;
    return httpRequest.patch<Question>(url, data);
  },

  deleteQuestion: (id: string | number): Promise<void> => {
    const url = `interview/web/questions/${id}/`;
    return httpRequest.delete(url);
  },
};

export default adminManagementService;

