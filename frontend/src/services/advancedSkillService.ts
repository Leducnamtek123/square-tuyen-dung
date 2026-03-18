import httpRequest from '../utils/httpRequest';

type AnyRecord = Record<string, unknown>;

type IdType = string | number;

const advancedSkillService = {
  addAdvancedSkills: (data: AnyRecord): Promise<unknown> => {
    const url = `info/web/advanced-skills/`;
    return httpRequest.post(url, data);
  },

  getAdvancedSkillById: (id: IdType): Promise<unknown> => {
    const url = `info/web/advanced-skills/${id}/`;
    return httpRequest.get(url);
  },

  updateAdvancedSkillById: (id: IdType, data: AnyRecord): Promise<unknown> => {
    const url = `info/web/advanced-skills/${id}/`;
    return httpRequest.put(url, data);
  },

  deleteAdvancedSkillById: (id: IdType): Promise<unknown> => {
    const url = `info/web/advanced-skills/${id}/`;
    return httpRequest.delete(url);
  },
};

export default advancedSkillService;
