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

  it('unwraps nested employer job post export responses', async () => {
    const exportRows = [
      {
        jobName: 'Frontend Developer',
        views: 12,
        appliedNumber: 3,
      },
    ];
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({ data: { data: exportRows } });

    await expect(jobService.exportEmployerJobPosts({ status: 2 })).resolves.toEqual(exportRows);
    expect(httpRequest.get).toHaveBeenCalledWith('job/web/private-job-posts/export/', {
      params: { status: 2 },
    });
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

  it('unwraps company image upload responses as an image array', async () => {
    const uploadedImages = [{ id: 7, imageUrl: 'http://minio.test/company-1.png' }];
    (httpRequest.post as jest.Mock).mockResolvedValueOnce({ data: { data: uploadedImages } });

    await expect(companyImageService.addCompanyImage(new FormData())).resolves.toEqual(uploadedImages);
    expect(httpRequest.post).toHaveBeenCalledWith(
      'info/web/company-images/',
      expect.any(FormData),
      expect.objectContaining({
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
  });

  it('normalizes top company carousel responses to a stable company array', async () => {
    const company = { id: 12, companyName: 'Top Square' };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({
      data: { count: 1, results: [company] },
    });

    await expect(companyService.getTopCompanies()).resolves.toEqual([company]);
  });

  it('unwraps nested public and employer detail response envelopes', async () => {
    const company = { id: 13, companyName: 'Square Detail' };
    const companyJob = { id: 14, jobName: 'Company Job Detail' };
    const publicJob = { id: 15, jobName: 'Public Job Detail' };
    const employerJob = { id: 16, jobName: 'Employer Job Detail' };
    const salaryInsight = { count: 2, minSalary: 1000, maxSalary: 2000 };
    (httpRequest.get as jest.Mock)
      .mockResolvedValueOnce({ data: { data: company } })
      .mockResolvedValueOnce({ data: { data: companyJob } })
      .mockResolvedValueOnce({ data: { data: publicJob } })
      .mockResolvedValueOnce({ data: { data: employerJob } })
      .mockResolvedValueOnce({ data: { data: salaryInsight } });

    await expect(companyService.getCompanyDetailById('square-detail')).resolves.toEqual(company);
    await expect(companyService.getCompanyJobPostDetailById(14)).resolves.toEqual(companyJob);
    await expect(jobService.getJobPostDetailById('public-job-detail')).resolves.toEqual(publicJob);
    await expect(jobService.getEmployerJobPostDetailById('employer-job-detail')).resolves.toEqual(employerJob);
    await expect(jobService.getJobSalaryInsightBySlug('public-job-detail')).resolves.toEqual(salaryInsight);
  });

  it('unwraps nested employer job post create and update responses', async () => {
    const createdJob = { id: 17, jobName: 'Frontend Developer' };
    const updatedJob = { id: 17, jobName: 'Senior Frontend Developer' };

    (httpRequest.post as jest.Mock).mockResolvedValueOnce({ data: { data: createdJob } });
    (httpRequest.put as jest.Mock).mockResolvedValueOnce({ data: { data: updatedJob } });

    const payload = {
      jobName: 'Frontend Developer',
      deadline: '2026-12-31',
      quantity: 2,
      salaryMin: 1000,
      salaryMax: 2000,
      location: { address: 'HCMC' },
    };

    await expect(jobService.addJobPost(payload)).resolves.toEqual(createdJob);
    await expect(jobService.updateJobPostById(17, { jobName: 'Senior Frontend Developer' })).resolves.toEqual(updatedJob);

    expect(httpRequest.post).toHaveBeenCalledWith('job/web/private-job-posts/', payload);
    expect(httpRequest.put).toHaveBeenCalledWith('job/web/private-job-posts/17/', { jobName: 'Senior Frontend Developer' });
  });

  it('unwraps nested public save and follow action responses', async () => {
    (httpRequest.post as jest.Mock)
      .mockResolvedValueOnce({ data: { data: { isSaved: true } } })
      .mockResolvedValueOnce({ data: { data: { isFollowed: false } } });

    await expect(jobService.saveJobPost('frontend-developer')).resolves.toEqual({ isSaved: true });
    await expect(companyService.followCompany('square-group')).resolves.toEqual({ isFollowed: false });

    expect(httpRequest.post).toHaveBeenNthCalledWith(1, 'job/web/job-posts/frontend-developer/save/');
    expect(httpRequest.post).toHaveBeenNthCalledWith(2, 'info/web/companies/square-group/followed/');
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

  it('unwraps nested job post notification create detail update and active responses', async () => {
    const createdNotification = { id: 18, jobName: 'Frontend alert', isActive: true };
    const detailNotification = {
      id: 18,
      jobName: 'Frontend alert',
      frequency: 1,
      career: 2,
      city: 3,
      position: null,
      experience: null,
      salary: null,
    };
    const updatedNotification = { ...detailNotification, jobName: 'Senior frontend alert' };

    (httpRequest.post as jest.Mock).mockResolvedValueOnce({ data: { data: createdNotification } });
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({ data: { data: detailNotification } });
    (httpRequest.put as jest.Mock).mockResolvedValueOnce({ data: { data: updatedNotification } });
    (httpRequest.patch as jest.Mock).mockResolvedValueOnce({ data: { data: { isActive: false } } });

    const payload = {
      jobName: 'Frontend alert',
      frequency: 1,
      career: 2,
      city: 3,
      position: null,
      experience: null,
      salary: null,
    };

    await expect(jobPostNotificationService.addJobPostNotification(payload)).resolves.toEqual(createdNotification);
    await expect(jobPostNotificationService.getJobPostNotificationDetailById(18)).resolves.toEqual(detailNotification);
    await expect(jobPostNotificationService.updateJobPostNotificationById(18, { jobName: 'Senior frontend alert' })).resolves.toEqual(updatedNotification);
    await expect(jobPostNotificationService.active(18)).resolves.toEqual({ isActive: false });

    expect(httpRequest.post).toHaveBeenCalledWith('job/web/job-post-notifications/', payload);
    expect(httpRequest.get).toHaveBeenCalledWith('job/web/job-post-notifications/18/');
    expect(httpRequest.put).toHaveBeenCalledWith('job/web/job-post-notifications/18/', { jobName: 'Senior frontend alert' });
    expect(httpRequest.patch).toHaveBeenCalledWith('job/web/job-post-notifications/18/', {});
  });

  it('normalizes voice profile list responses', async () => {
    const profile = { id: 11, name: 'Vietnamese preset' };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({
      data: { count: 1, results: [profile] },
    });

    await expect(voiceProfileService.getVoiceProfiles({ page: 1 })).resolves.toEqual({ count: 1, results: [profile] });
  });

  it('unwraps nested voice profile mutation sample and grant responses', async () => {
    const createdProfile = { id: 20, name: 'Recruiter voice', status: 'ready' };
    const updatedProfile = { id: 20, name: 'Recruiter voice', status: 'disabled' };
    const uploadedSample = { id: 21, profile: 20, referenceText: 'Xin chao' };
    const createdGrant = { id: 22, profile: 20, company: 5, isActive: true };
    const sampleData = new FormData();
    sampleData.append('referenceText', 'Xin chao');

    (httpRequest.post as jest.Mock)
      .mockResolvedValueOnce({ data: { data: createdProfile } })
      .mockResolvedValueOnce({ data: { data: uploadedSample } })
      .mockResolvedValueOnce({ data: { data: createdGrant } });
    (httpRequest.patch as jest.Mock).mockResolvedValueOnce({ data: { data: updatedProfile } });

    await expect(voiceProfileService.createVoiceProfile({ name: 'Recruiter voice' })).resolves.toEqual(createdProfile);
    await expect(voiceProfileService.updateVoiceProfile(20, { status: 'disabled' })).resolves.toEqual(updatedProfile);
    await expect(voiceProfileService.uploadSample(20, sampleData)).resolves.toEqual(uploadedSample);
    await expect(voiceProfileService.createGrant(20, { company: 5, isActive: true })).resolves.toEqual(createdGrant);

    expect(httpRequest.post).toHaveBeenNthCalledWith(1, 'interview/web/voice-profiles/', { name: 'Recruiter voice' });
    expect(httpRequest.patch).toHaveBeenCalledWith('interview/web/voice-profiles/20/', { status: 'disabled' });
    expect(httpRequest.post).toHaveBeenNthCalledWith(2, 'interview/web/voice-profiles/20/samples/', sampleData, { headers: { 'Content-Type': 'multipart/form-data' } });
    expect(httpRequest.post).toHaveBeenNthCalledWith(3, 'interview/web/voice-profiles/20/grants/', { company: 5, isActive: true });
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
