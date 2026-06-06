import adminManagementService from '../adminManagementService';
import httpRequest from '../../utils/httpRequest';
import { presignInObject } from '../../utils/presignUrl';

jest.mock('../../utils/httpRequest', () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

jest.mock('../../utils/presignUrl', () => ({
  presignInObject: jest.fn((data) => Promise.resolve(data)),
}));

describe('adminManagementService list response normalization', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (presignInObject as jest.Mock).mockImplementation((data) => Promise.resolve(data));
  });

  it('normalizes nested data.results responses for presigned admin list endpoints', async () => {
    const career = { id: 7, name: 'Engineering' };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({
      data: { count: 1, results: [career] },
    });

    const result = await adminManagementService.getCareers({ page: 1 });

    expect(httpRequest.get).toHaveBeenCalledWith('common/admin/careers/', { params: { page: 1 } });
    expect(result).toEqual({ count: 1, results: [career] });
  });

  it('normalizes raw array responses for non-presigned admin list endpoints', async () => {
    const activity = { id: 11, status: 1 };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce([activity]);

    const result = await adminManagementService.getJobActivities({ page: 1 });

    expect(httpRequest.get).toHaveBeenCalledWith('job/web/admin/job-posts-activity/', { params: { page: 1 } });
    expect(result).toEqual({ count: 1, results: [activity] });
  });

  it('unwraps nested admin company detail and mutation responses after presign', async () => {
    const company = { id: 42, companyName: 'Square Group HR' };
    const createdCompany = { id: 43, companyName: 'Square New' };
    const updatedCompany = { id: 42, companyName: 'Square Updated' };

    (httpRequest.get as jest.Mock).mockResolvedValueOnce({ data: { data: company } });
    (httpRequest.post as jest.Mock).mockResolvedValueOnce({ data: { data: createdCompany } });
    (httpRequest.patch as jest.Mock).mockResolvedValueOnce({ data: { data: updatedCompany } });

    await expect(adminManagementService.getCompanyDetail(42)).resolves.toEqual(company);
    await expect(adminManagementService.createCompany({ companyName: 'Square New' })).resolves.toEqual(createdCompany);
    await expect(adminManagementService.updateCompany(42, { companyName: 'Square Updated' })).resolves.toEqual(updatedCompany);

    expect(httpRequest.get).toHaveBeenCalledWith('info/web/admin/companies/42/');
    expect(httpRequest.post).toHaveBeenCalledWith('info/web/admin/companies/', { companyName: 'Square New' }, undefined);
    expect(httpRequest.patch).toHaveBeenCalledWith('info/web/admin/companies/42/', { companyName: 'Square Updated' }, undefined);
  });

  it('unwraps nested admin company verification and trust report mutation responses', async () => {
    const verification = { id: 5, status: 'approved', adminNote: 'Approved' };
    const trustReport = { id: 9, status: 'resolved' };

    (httpRequest.patch as jest.Mock)
      .mockResolvedValueOnce({ data: { data: verification } })
      .mockResolvedValueOnce({ data: { data: trustReport } });

    await expect(adminManagementService.updateCompanyVerification(5, { status: 'approved', adminNote: 'Approved' })).resolves.toEqual(verification);
    await expect(adminManagementService.updateTrustReport(9, { status: 'resolved' })).resolves.toEqual(trustReport);

    expect(httpRequest.patch).toHaveBeenNthCalledWith(
      1,
      'info/web/admin/company-verifications/5/',
      { status: 'approved', adminNote: 'Approved' }
    );
    expect(httpRequest.patch).toHaveBeenNthCalledWith(
      2,
      'info/web/admin/trust-reports/9/',
      { status: 'resolved' }
    );
  });

  it('unwraps nested non-presigned admin mutation responses', async () => {
    const ward = { id: 3, name: 'Ward 1' };
    const activity = { id: 11, status: 3 };
    const notification = { id: 12, jobName: 'Frontend Developer' };
    const questionGroup = { id: 13, name: 'Screening' };
    const question = { id: 14, text: 'Tell me about React' };

    (httpRequest.post as jest.Mock)
      .mockResolvedValueOnce({ data: { data: ward } })
      .mockResolvedValueOnce({ data: { data: notification } })
      .mockResolvedValueOnce({ data: { data: questionGroup } })
      .mockResolvedValueOnce({ data: { data: question } });
    (httpRequest.patch as jest.Mock)
      .mockResolvedValueOnce({ data: { data: activity } });

    await expect(adminManagementService.createWard({ name: 'Ward 1', code: 'W1', district: 2 })).resolves.toEqual(ward);
    await expect(adminManagementService.updateJobActivity(11, { status: 3 })).resolves.toEqual(activity);
    await expect(adminManagementService.createJobNotification({ jobName: 'Frontend Developer', frequency: 1 })).resolves.toEqual(notification);
    await expect(adminManagementService.createQuestionGroup({ name: 'Screening' })).resolves.toEqual(questionGroup);
    await expect(adminManagementService.createQuestion({ text: 'Tell me about React' })).resolves.toEqual(question);
  });
});
