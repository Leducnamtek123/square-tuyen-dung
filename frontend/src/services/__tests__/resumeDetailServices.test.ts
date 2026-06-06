import advancedSkillService from '../advancedSkillService';
import certificateService from '../certificateService';
import educationDetailService from '../educationDetailService';
import experienceDetailService from '../experienceDetailService';
import languageSkillService from '../languageSkillService';
import httpRequest from '../../utils/httpRequest';

jest.mock('../../utils/httpRequest', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

describe('resume detail service response normalization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('unwraps nested create/detail/update responses for resume sub-detail services', async () => {
    const education = { id: 1, degreeName: 'Bachelor' };
    const experience = { id: 2, jobName: 'Frontend Developer' };
    const certificate = { id: 3, certificateName: 'AWS' };
    const language = { id: 4, languageName: 'English' };
    const advancedSkill = { id: 5, skillName: 'React' };

    (httpRequest.get as jest.Mock)
      .mockResolvedValueOnce({ data: { data: education } })
      .mockResolvedValueOnce({ data: { data: experience } })
      .mockResolvedValueOnce({ data: { data: certificate } })
      .mockResolvedValueOnce({ data: { data: language } })
      .mockResolvedValueOnce({ data: { data: advancedSkill } });
    (httpRequest.post as jest.Mock)
      .mockResolvedValueOnce({ data: { data: education } })
      .mockResolvedValueOnce({ data: { data: experience } })
      .mockResolvedValueOnce({ data: { data: certificate } })
      .mockResolvedValueOnce({ data: { data: language } })
      .mockResolvedValueOnce({ data: { data: advancedSkill } });
    (httpRequest.put as jest.Mock)
      .mockResolvedValueOnce({ data: { data: education } })
      .mockResolvedValueOnce({ data: { data: experience } })
      .mockResolvedValueOnce({ data: { data: certificate } })
      .mockResolvedValueOnce({ data: { data: language } })
      .mockResolvedValueOnce({ data: { data: advancedSkill } });

    await expect(educationDetailService.getEducationDetailById(1)).resolves.toEqual(education);
    await expect(experienceDetailService.getExperienceDetailById(2)).resolves.toEqual(experience);
    await expect(certificateService.getCertificateById(3)).resolves.toEqual(certificate);
    await expect(languageSkillService.getLanguageSkillById(4)).resolves.toEqual(language);
    await expect(advancedSkillService.getAdvancedSkillById(5)).resolves.toEqual(advancedSkill);

    await expect(educationDetailService.addEducationsDetail({ degreeName: 'Bachelor' })).resolves.toEqual(education);
    await expect(experienceDetailService.addExperienceDetail({ jobName: 'Frontend Developer' })).resolves.toEqual(experience);
    await expect(certificateService.addCertificates({ certificateName: 'AWS' })).resolves.toEqual(certificate);
    await expect(languageSkillService.addLanguageSkills({ languageName: 'English' })).resolves.toEqual(language);
    await expect(advancedSkillService.addAdvancedSkills({ skillName: 'React' })).resolves.toEqual(advancedSkill);

    await expect(educationDetailService.updateEducationDetailById(1, { degreeName: 'Bachelor' })).resolves.toEqual(education);
    await expect(experienceDetailService.updateExperienceDetailById(2, { jobName: 'Frontend Developer' })).resolves.toEqual(experience);
    await expect(certificateService.updateCertificateById(3, { certificateName: 'AWS' })).resolves.toEqual(certificate);
    await expect(languageSkillService.updateLanguageSkillById(4, { languageName: 'English' })).resolves.toEqual(language);
    await expect(advancedSkillService.updateAdvancedSkillById(5, { skillName: 'React' })).resolves.toEqual(advancedSkill);
  });
});
