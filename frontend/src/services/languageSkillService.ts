import httpRequest from '../utils/httpRequest';
import type { LanguageSkill } from '../types/models';

type IdType = string | number;

export interface LanguageSkillInput {
  id?: string | number;
  language?: string | number;
  level?: number;
  languageName?: string;
  levelName?: string;
  point?: number | string;
  resumeSlug?: string;
  resume?: string;
}

const languageSkillService = {
  addLanguageSkills: (data: LanguageSkillInput): Promise<LanguageSkill> => {
    const url = `info/web/language-skills/`;
    return httpRequest.post(url, data);
  },

  getLanguageSkillById: (id: IdType): Promise<LanguageSkill> => {
    const url = `info/web/language-skills/${id}/`;
    return httpRequest.get(url);
  },

  updateLanguageSkillById: (id: IdType, data: LanguageSkillInput): Promise<LanguageSkill> => {
    const url = `info/web/language-skills/${id}/`;
    return httpRequest.put(url, data);
  },

  deleteLanguageSkillById: (id: IdType): Promise<void> => {
    const url = `info/web/language-skills/${id}/`;
    return httpRequest.delete(url);
  },
};

export default languageSkillService;
