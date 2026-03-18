import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';

type AnyRecord = Record<string, unknown>;

type IdType = string | number;

const resumeService = {
  sendEmail: (slug: IdType, data: AnyRecord): Promise<unknown> => {
    const url = `info/web/resumes/${slug}/send-email/`;
    return httpRequest.post(url, data);
  },

  getResumes: async (params: AnyRecord = {}): Promise<unknown> => {
    const url = 'info/web/resumes/';
    const data = await httpRequest.get(url, { params: params });
    return presignInObject(data);
  },

  getResumeDetail: async (resumeSlug: IdType): Promise<unknown> => {
    const url = `info/web/resumes/${resumeSlug}/`;
    const data = await httpRequest.get(url);
    return presignInObject(data);
  },

  saveResume: (slug: IdType): Promise<unknown> => {
    const url = `info/web/resumes/${slug}/resume-saved/`;
    return httpRequest.post(url);
  },

  viewResume: (slug: IdType): Promise<unknown> => {
    const url = `info/web/resumes/${slug}/view-resume/`;
    return httpRequest.post(url);
  },

  getResumeOwner: async (resumeSlug: IdType): Promise<unknown> => {
    const url = `info/web/private-resumes/${resumeSlug}/resume-owner/`;
    const data = await httpRequest.get(url);
    return presignInObject(data);
  },

  getCv: async (resumeSlug: IdType): Promise<unknown> => {
    const url = `info/web/private-resumes/${resumeSlug}/cv/`;
    const data = await httpRequest.get(url);
    return presignInObject(data);
  },

  updateCV: async (resumeSlug: IdType, formData: FormData): Promise<unknown> => {
    const url = `info/web/private-resumes/${resumeSlug}/cv/`;
    const resData = await httpRequest.put(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return presignInObject(resData);
  },

  addResume: async (data: FormData): Promise<unknown> => {
    const url = 'info/web/private-resumes/';
    const resData = await httpRequest.post(url, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return presignInObject(resData);
  },

  updateResume: async (resumeSlug: IdType, data: AnyRecord): Promise<unknown> => {
    const url = `info/web/private-resumes/${resumeSlug}/`;
    const resData = await httpRequest.put(url, data);
    return presignInObject(resData);
  },

  deleteResume: (resumeSlug: IdType): Promise<unknown> => {
    const url = `info/web/private-resumes/${resumeSlug}/`;
    return httpRequest.delete(url);
  },

  activeResume: async (resumeSlug: IdType): Promise<unknown> => {
    const url = `info/web/private-resumes/${resumeSlug}/resume-active/`;
    const data = await httpRequest.get(url);
    return presignInObject(data);
  },

  getExperiencesDetail: (resumeSlug: IdType): Promise<unknown> => {
    const url = `info/web/private-resumes/${resumeSlug}/experiences-detail/`;
    return httpRequest.get(url);
  },

  getEducationsDetail: (resumeSlug: IdType): Promise<unknown> => {
    const url = `info/web/private-resumes/${resumeSlug}/educations-detail/`;
    return httpRequest.get(url);
  },

  getCertificates: (resumeSlug: IdType): Promise<unknown> => {
    const url = `info/web/private-resumes/${resumeSlug}/certificates-detail/`;
    return httpRequest.get(url);
  },

  getLanguageSkills: (resumeSlug: IdType): Promise<unknown> => {
    const url = `info/web/private-resumes/${resumeSlug}/language-skills/`;
    return httpRequest.get(url);
  },

  getAdvancedSkills: (resumeSlug: IdType): Promise<unknown> => {
    const url = `info/web/private-resumes/${resumeSlug}/advanced-skills/`;
    return httpRequest.get(url);
  },
};

export default resumeService;
