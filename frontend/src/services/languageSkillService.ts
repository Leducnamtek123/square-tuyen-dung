import httpRequest from '../utils/httpRequest';

type AnyRecord = Record<string, unknown>;

type IdType = string | number;

const languageSkillService = {
  addLanguageSkills: (data: AnyRecord): Promise<unknown> => {
    const url = `info/web/language-skills/`;
    return httpRequest.post(url, data);
  },

  getLanguageSkillById: (id: IdType): Promise<unknown> => {
    const url = `info/web/language-skills/${id}/`;
    return httpRequest.get(url);
  },

  updateLanguageSkillById: (id: IdType, data: AnyRecord): Promise<unknown> => {
    const url = `info/web/language-skills/${id}/`;
    return httpRequest.put(url, data);
  },

  deleteLanguageSkillById: (id: IdType): Promise<unknown> => {
    const url = `info/web/language-skills/${id}/`;
    return httpRequest.delete(url);
  },
};

export default languageSkillService;
