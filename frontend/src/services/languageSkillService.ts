import httpRequest from '../utils/httpRequest';


type IdType = string | number;

const languageSkillService = {
  addLanguageSkills: (data: Record<string, unknown>): Promise<unknown> => {
    const url = `info/web/language-skills/`;
    return httpRequest.post(url, data);
  },

  getLanguageSkillById: (id: IdType): Promise<unknown> => {
    const url = `info/web/language-skills/${id}/`;
    return httpRequest.get(url);
  },

  updateLanguageSkillById: (id: IdType, data: Record<string, unknown>): Promise<unknown> => {
    const url = `info/web/language-skills/${id}/`;
    return httpRequest.put(url, data);
  },

  deleteLanguageSkillById: (id: IdType): Promise<unknown> => {
    const url = `info/web/language-skills/${id}/`;
    return httpRequest.delete(url);
  },
};

export default languageSkillService;

