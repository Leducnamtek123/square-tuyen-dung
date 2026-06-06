import resumeService from '../resumeService';
import httpRequest from '../../utils/httpRequest';
import { presignInObject } from '../../utils/presignUrl';
import fs from 'fs';
import path from 'path';

jest.mock('../../utils/httpRequest', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

jest.mock('../../utils/presignUrl', () => ({
  presignInObject: jest.fn((data) => Promise.resolve(data)),
}));

describe('resumeService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (presignInObject as jest.Mock).mockImplementation((data) => Promise.resolve(data));
  });

  it('normalizes resume sub-detail list responses to arrays', async () => {
    const experience = { id: 1, jobName: 'Frontend Developer' };
    const education = { id: 2, degreeName: 'Bachelor' };
    const certificate = { id: 3, name: 'AWS' };
    const language = { id: 4, languageName: 'English' };
    const skill = { id: 5, skillName: 'React' };

    (httpRequest.get as jest.Mock)
      .mockResolvedValueOnce({ data: { results: [experience] } })
      .mockResolvedValueOnce({ results: [education] })
      .mockResolvedValueOnce({ data: [certificate] })
      .mockResolvedValueOnce({ data: { data: { count: 1, results: [language] } } })
      .mockResolvedValueOnce([skill]);

    await expect(resumeService.getExperiencesDetail('cv-a')).resolves.toEqual([experience]);
    await expect(resumeService.getEducationsDetail('cv-a')).resolves.toEqual([education]);
    await expect(resumeService.getCertificates('cv-a')).resolves.toEqual([certificate]);
    await expect(resumeService.getLanguageSkills('cv-a')).resolves.toEqual([language]);
    await expect(resumeService.getAdvancedSkills('cv-a')).resolves.toEqual([skill]);
  });

  it('normalizes empty successful action responses', async () => {
    (httpRequest.post as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ data: null });

    await expect(resumeService.sendEmail('cv-a', { subject: 'Hello' })).resolves.toEqual({ sent: true });
    await expect(resumeService.viewResume('cv-a')).resolves.toEqual({ viewed: true });
  });

  it('unwraps nested resume save and active status responses', async () => {
    (httpRequest.post as jest.Mock).mockResolvedValueOnce({ data: { data: { isSaved: true } } });
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({ data: { data: { isActive: false } } });

    await expect(resumeService.saveResume('cv-a')).resolves.toEqual({ isSaved: true });
    await expect(resumeService.activeResume('cv-a')).resolves.toEqual({ isActive: false });

    expect(httpRequest.post).toHaveBeenCalledWith('info/web/resumes/cv-a/resume-saved/');
    expect(httpRequest.get).toHaveBeenCalledWith('info/web/private-resumes/cv-a/resume-active/');
  });

  it('keeps active resume typed as the backend status payload', () => {
    const serviceSource = fs.readFileSync(path.join(process.cwd(), 'src/services/resumeService.ts'), 'utf8');

    expect(serviceSource).toContain('export type ResumeActiveStatusResponse = { isActive: boolean };');
    expect(serviceSource).toContain('activeResume: async (resumeSlug: IdType): Promise<ResumeActiveStatusResponse>');
    expect(serviceSource).not.toContain('activeResume: async (resumeSlug: IdType): Promise<Resume>');
  });
});
