import companyFollowed from '../companyFollowed';
import companyImageService from '../companyImageService';
import companyService from '../companyService';
import jobPostNotificationService from '../jobPostNotificationService';
import jobService from '../jobService';
import resumeService from '../resumeService';
import resumeViewedService from '../resumeViewedService';
import voiceProfileService from '../voiceProfileService';
import httpRequest from '../../utils/httpRequest';
import { presignInObject } from '../../utils/presignUrl';
import fs from 'fs';
import path from 'path';

jest.mock('../../utils/httpRequest', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

jest.mock('../../utils/presignUrl', () => ({
  presignInObject: jest.fn((data) => Promise.resolve(data)),
}));

describe('public and job seeker list services response normalization', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (presignInObject as jest.Mock).mockImplementation((data) => Promise.resolve(data));
  });

  it('normalizes job post list responses used by public, employer, suggested, and saved jobs', async () => {
    const publicJob = { id: 1, jobName: 'Public Job' };
    const privateJob = { id: 2, jobName: 'Private Job' };
    const suggestedJob = { id: 3, jobName: 'Suggested Job' };
    const savedJob = { id: 4, jobName: 'Saved Job' };
    (httpRequest.get as jest.Mock)
      .mockResolvedValueOnce([publicJob])
      .mockResolvedValueOnce({ data: { count: 1, results: [privateJob] } })
      .mockResolvedValueOnce({ data: [suggestedJob] })
      .mockResolvedValueOnce({ results: [savedJob] });

    await expect(jobService.getJobPosts({ page: 1 })).resolves.toEqual({ count: 1, results: [publicJob] });
    await expect(jobService.getEmployerJobPost({ page: 2 })).resolves.toEqual({ count: 1, results: [privateJob] });
    await expect(jobService.getSuggestedJobPosts({ page: 3 })).resolves.toEqual({ count: 1, results: [suggestedJob] });
    await expect(jobService.getJobPostsSaved({ page: 4 })).resolves.toEqual({ count: 1, results: [savedJob] });
  });

  it('normalizes job title suggestion responses to a stable results object', async () => {
    (httpRequest.get as jest.Mock)
      .mockResolvedValueOnce(['Frontend Developer'])
      .mockResolvedValueOnce({ data: ['Backend Developer'] })
      .mockResolvedValueOnce({ data: { results: ['QA Engineer'] } });

    await expect(jobService.searchJobSuggestTitle('front')).resolves.toEqual({ results: ['Frontend Developer'] });
    await expect(jobService.searchJobSuggestTitle('back')).resolves.toEqual({ results: ['Backend Developer'] });
    await expect(jobService.searchJobSuggestTitle('qa')).resolves.toEqual({ results: ['QA Engineer'] });
  });

  it('normalizes public companies and company media list responses after presign', async () => {
    const company = { id: 5, companyName: 'Square' };
    const image = { id: 6, imageUrl: 'http://minio.test/image.png' };
    (httpRequest.get as jest.Mock)
      .mockResolvedValueOnce({ data: { count: 1, results: [company] } })
      .mockResolvedValueOnce([image]);

    await expect(companyService.getCompanies({ page: 1 })).resolves.toEqual({ count: 1, results: [company] });
    await expect(companyImageService.getCompanyImages()).resolves.toEqual({ count: 1, results: [image] });
  });

  it('normalizes job seeker followed/viewed/notification/resume list responses', async () => {
    const followed = { id: 7, company: { id: 5 } };
    const viewed = { id: 8, views: 2 };
    const notification = { id: 9, jobName: 'Frontend' };
    const resume = { id: 10, title: 'Frontend CV' };
    (httpRequest.get as jest.Mock)
      .mockResolvedValueOnce({ data: { count: 1, results: [followed] } })
      .mockResolvedValueOnce([viewed])
      .mockResolvedValueOnce({ data: [notification] })
      .mockResolvedValueOnce({ data: { count: 1, results: [resume] } });

    await expect(companyFollowed.getCompaniesFollowed({ page: 1 })).resolves.toEqual({ count: 1, results: [followed] });
    await expect(resumeViewedService.getResumeViewed({ page: 2 })).resolves.toEqual({ count: 1, results: [viewed] });
    await expect(jobPostNotificationService.getJobPostNotifications({ page: 3 })).resolves.toEqual({ count: 1, results: [notification] });
    await expect(resumeService.getResumes({ page: 4 })).resolves.toEqual({ count: 1, results: [resume] });
  });

  it('normalizes voice profile list responses', async () => {
    const profile = { id: 11, name: 'Vietnamese preset' };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({
      data: { count: 1, results: [profile] },
    });

    await expect(voiceProfileService.getVoiceProfiles({ page: 1 })).resolves.toEqual({ count: 1, results: [profile] });
  });

  it('keeps job notification active toggle typed as the backend status payload', () => {
    const serviceSource = fs.readFileSync(path.join(process.cwd(), 'src/services/jobPostNotificationService.ts'), 'utf8');
    const componentSource = fs.readFileSync(path.join(process.cwd(), 'src/views/components/jobSeekers/JobPostNotificationCard/ActiveButtonComponent.tsx'), 'utf8');

    expect(serviceSource).toContain('export type JobPostNotificationStatusResponse = { isActive: boolean };');
    expect(serviceSource).toContain('active: (id: IdType): Promise<JobPostNotificationStatusResponse>');
    expect(componentSource).toContain('const resData = await jobPostNotificationService.active(id);');
    expect(componentSource).not.toContain('as { isActive: boolean }');
  });

  it('keeps company job post detail typed as nullable when backend returns data null', () => {
    const serviceSource = fs.readFileSync(path.join(process.cwd(), 'src/services/companyService.ts'), 'utf8');

    expect(serviceSource).toContain('getCompanyJobPostDetailById: async (id: IdType): Promise<JobPost | null>');
    expect(serviceSource).not.toContain('getCompanyJobPostDetailById: async (id: IdType): Promise<JobPost>');
  });
});
