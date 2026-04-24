import httpRequest from '../utils/httpRequest';
import type { AdvancedSkill } from '../types/models';

type IdType = string | number;

interface AdvancedSkillInput {
  id?: string | number;
  name?: string;
  level?: number;
  skillName?: string;
  point?: number | string;
  resumeSlug?: string;
  resume?: string;
}

const advancedSkillService = {
  addAdvancedSkills: (data: AdvancedSkillInput): Promise<AdvancedSkill> => {
    const url = `info/web/advanced-skills/`;
    return httpRequest.post(url, data);
  },

  getAdvancedSkillById: (id: IdType): Promise<AdvancedSkill> => {
    const url = `info/web/advanced-skills/${id}/`;
    return httpRequest.get(url);
  },

  updateAdvancedSkillById: (id: IdType, data: AdvancedSkillInput): Promise<AdvancedSkill> => {
    const url = `info/web/advanced-skills/${id}/`;
    return httpRequest.put(url, data);
  },

  deleteAdvancedSkillById: (id: IdType): Promise<void> => {
    const url = `info/web/advanced-skills/${id}/`;
    return httpRequest.delete(url);
  },
};

export default advancedSkillService;
