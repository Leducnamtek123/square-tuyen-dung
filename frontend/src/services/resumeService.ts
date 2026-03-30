import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';
import type {
  Resume,
  ExperienceDetail,
  EducationDetail,
  Certificate,
  LanguageSkill,
  AdvancedSkill,
} from '../types/models';
import type { PaginatedResponse } from '../types/api';

type IdType = string | number;

/* ── Request DTOs ─────────────────────────────────────────────────────── */

export interface GetResumesParams {
  kw?: string;
  cityId?: string | number;
  careerId?: string | number;
  experienceId?: string | number;
  positionId?: string | number;
  academicLevelId?: string | number;
  typeOfWorkplaceId?: string | number;
  jobTypeId?: string | number;
  genderId?: string | number;
  maritalStatusId?: string | number;
  page?: number;
  pageSize?: number;
  ordering?: string;
}

export interface ResumeInput {
  title?: string;
  description?: string;
  salaryMin?: number;
  salaryMax?: number;
  position?: number;
  experience?: number;
  academicLevel?: number;
  typeOfWorkplace?: number;
  jobType?: number;
  cityId?: number;
  careerId?: number;
  isActive?: boolean;
}

export interface SendEmailInput {
  subject?: string;
  content?: string;
  toEmail?: string;
}

/* ── Response Types ───────────────────────────────────────────────────── */

export interface ResumeOwner {
  fullName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string | null;
}

export interface ResumeCV {
  fileUrl?: string | null;
  type?: string;
}

/* ── Service ──────────────────────────────────────────────────────────── */

const resumeService = {
  sendEmail: (slug: IdType, data: SendEmailInput): Promise<{ sent: boolean }> => {
    const url = `info/web/resumes/${slug}/send-email/`;
    return httpRequest.post(url, data) as Promise<{ sent: boolean }>;
  },

  getResumes: async (params: GetResumesParams = {}): Promise<PaginatedResponse<Resume>> => {
    const url = 'info/web/resumes/';
    const data = (await httpRequest.get(url, { params })) as unknown;
    return (await presignInObject(data)) as PaginatedResponse<Resume>;
  },

  getResumeDetail: async (resumeSlug: IdType): Promise<Resume> => {
    const url = `info/web/resumes/${resumeSlug}/`;
    const data = (await httpRequest.get(url)) as unknown;
    return (await presignInObject(data)) as Resume;
  },

  saveResume: (slug: IdType): Promise<{ saved: boolean }> => {
    const url = `info/web/resumes/${slug}/resume-saved/`;
    return httpRequest.post(url) as Promise<{ saved: boolean }>;
  },

  viewResume: (slug: IdType): Promise<{ viewed: boolean }> => {
    const url = `info/web/resumes/${slug}/view-resume/`;
    return httpRequest.post(url) as Promise<{ viewed: boolean }>;
  },

  getResumeOwner: async (resumeSlug: IdType): Promise<ResumeOwner> => {
    const url = `info/web/private-resumes/${resumeSlug}/resume-owner/`;
    const data = (await httpRequest.get(url)) as unknown;
    return (await presignInObject(data)) as ResumeOwner;
  },

  getCv: async (resumeSlug: IdType): Promise<ResumeCV> => {
    const url = `info/web/private-resumes/${resumeSlug}/cv/`;
    const data = (await httpRequest.get(url)) as unknown;
    return (await presignInObject(data)) as ResumeCV;
  },

  updateCV: async (resumeSlug: IdType, formData: FormData): Promise<ResumeCV> => {
    const url = `info/web/private-resumes/${resumeSlug}/cv/`;
    const resData = (await httpRequest.put(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })) as unknown;
    return (await presignInObject(resData)) as ResumeCV;
  },

  addResume: async (data: FormData): Promise<Resume> => {
    const url = 'info/web/private-resumes/';
    const resData = (await httpRequest.post(url, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })) as unknown;
    return (await presignInObject(resData)) as Resume;
  },

  updateResume: async (resumeSlug: IdType, data: ResumeInput): Promise<Resume> => {
    const url = `info/web/private-resumes/${resumeSlug}/`;
    const resData = (await httpRequest.put(url, data)) as unknown;
    return (await presignInObject(resData)) as Resume;
  },

  deleteResume: (resumeSlug: IdType): Promise<void> => {
    const url = `info/web/private-resumes/${resumeSlug}/`;
    return httpRequest.delete(url) as Promise<void>;
  },

  activeResume: async (resumeSlug: IdType): Promise<Resume> => {
    const url = `info/web/private-resumes/${resumeSlug}/resume-active/`;
    const data = (await httpRequest.get(url)) as unknown;
    return (await presignInObject(data)) as Resume;
  },

  getExperiencesDetail: (resumeSlug: IdType): Promise<ExperienceDetail[]> => {
    const url = `info/web/private-resumes/${resumeSlug}/experiences-detail/`;
    return httpRequest.get(url) as Promise<ExperienceDetail[]>;
  },

  getEducationsDetail: (resumeSlug: IdType): Promise<EducationDetail[]> => {
    const url = `info/web/private-resumes/${resumeSlug}/educations-detail/`;
    return httpRequest.get(url) as Promise<EducationDetail[]>;
  },

  getCertificates: (resumeSlug: IdType): Promise<Certificate[]> => {
    const url = `info/web/private-resumes/${resumeSlug}/certificates-detail/`;
    return httpRequest.get(url) as Promise<Certificate[]>;
  },

  getLanguageSkills: (resumeSlug: IdType): Promise<LanguageSkill[]> => {
    const url = `info/web/private-resumes/${resumeSlug}/language-skills/`;
    return httpRequest.get(url) as Promise<LanguageSkill[]>;
  },

  getAdvancedSkills: (resumeSlug: IdType): Promise<AdvancedSkill[]> => {
    const url = `info/web/private-resumes/${resumeSlug}/advanced-skills/`;
    return httpRequest.get(url) as Promise<AdvancedSkill[]>;
  },
};

export default resumeService;
