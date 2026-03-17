import httpRequest from '../utils/httpRequest';
import { presignInObject } from '../utils/presignUrl';

const resumeService = {

  sendEmail: (slug, data) => {

    const url = `info/web/resumes/${slug}/send-email/`;

    return httpRequest.post(url, data);

  },

  getResumes: async (params = {}) => {

    const url = 'info/web/resumes/';

    const data = await httpRequest.get(url, { params: params });
    return presignInObject(data);

  },

  getResumeDetail: async (resumeSlug) => {

    const url = `info/web/resumes/${resumeSlug}/`;

    const data = await httpRequest.get(url);
    return presignInObject(data);

  },

  saveResume: (slug) => {

    const url = `info/web/resumes/${slug}/resume-saved/`;

    return httpRequest.post(url);

  },

  viewResume: (slug) => {

    const url = `info/web/resumes/${slug}/view-resume/`;

    return httpRequest.post(url);

  },

  getResumeOwner: async (resumeSlug) => {

    const url = `info/web/private-resumes/${resumeSlug}/resume-owner/`;

    const data = await httpRequest.get(url);
    return presignInObject(data);

  },

  getCv: async (resumeSlug) => {

    const url = `info/web/private-resumes/${resumeSlug}/cv/`;

    const data = await httpRequest.get(url);
    return presignInObject(data);

  },

  updateCV: async (resumeSlug, formData) => {

    const url = `info/web/private-resumes/${resumeSlug}/cv/`;

    const resData = await httpRequest.put(url, formData, {

      headers: {

        'Content-Type': 'multipart/form-data',

      },

    });
    return presignInObject(resData);

  },

  addResume: async (data) => {

    const url = 'info/web/private-resumes/';

    const resData = await httpRequest.post(url, data, {

      headers: {

        'Content-Type': 'multipart/form-data',

      },

    });
    return presignInObject(resData);

  },

  updateResume: async (resumeSlug, data) => {

    const url = `info/web/private-resumes/${resumeSlug}/`;

    const resData = await httpRequest.put(url, data);
    return presignInObject(resData);

  },

  deleteResume: (resumeSlug) => {

    const url = `info/web/private-resumes/${resumeSlug}/`;

    return httpRequest.delete(url);

  },

  activeResume: async (resumeSlug) => {

    const url = `info/web/private-resumes/${resumeSlug}/resume-active/`;

    const data = await httpRequest.get(url);
    return presignInObject(data);

  },

  getExperiencesDetail: (resumeSlug) => {

    const url = `info/web/private-resumes/${resumeSlug}/experiences-detail/`;

    return httpRequest.get(url);

  },

  getEducationsDetail: (resumeSlug) => {

    const url = `info/web/private-resumes/${resumeSlug}/educations-detail/`;

    return httpRequest.get(url);

  },

  getCertificates: (resumeSlug) => {

    const url = `info/web/private-resumes/${resumeSlug}/certificates-detail/`;

    return httpRequest.get(url);

  },

  getLanguageSkills: (resumeSlug) => {

    const url = `info/web/private-resumes/${resumeSlug}/language-skills/`;

    return httpRequest.get(url);

  },

  getAdvancedSkills: (resumeSlug) => {

    const url = `info/web/private-resumes/${resumeSlug}/advanced-skills/`;

    return httpRequest.get(url);

  },

};

export default resumeService;
