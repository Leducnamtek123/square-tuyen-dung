import jobPostActivityService from '../jobPostActivityService';
import httpRequest from '../../utils/httpRequest';

jest.mock('../../utils/httpRequest', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

jest.mock('../../utils/presignUrl', () => ({
  presignInObject: jest.fn((data) => Promise.resolve(data)),
}));

describe('jobPostActivityService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('normalizes empty successful send email responses', async () => {
    (httpRequest.post as jest.Mock).mockResolvedValueOnce(null);

    await expect(jobPostActivityService.sendEmail(12, { subject: 'Interview' })).resolves.toEqual({
      success: true,
    });
  });

  it('normalizes AI analysis queue responses', async () => {
    (httpRequest.post as jest.Mock).mockResolvedValueOnce({
      detail: 'AI analysis task has been queued.',
    });

    await expect(jobPostActivityService.analyzeResume(12)).resolves.toEqual({
      success: true,
      status: 'queued',
      detail: 'AI analysis task has been queued.',
    });
    expect(httpRequest.post).toHaveBeenCalledWith('job/web/employer-job-posts-activity/12/analyze-resume/', {});
  });

  it('normalizes successful apply job responses and preserves application data', async () => {
    (httpRequest.post as jest.Mock).mockResolvedValueOnce({
      id: 99,
      status: 1,
      resume: 5,
    });

    await expect(jobPostActivityService.applyJob({
      jobPost: 12,
      resume: 5,
      fullName: 'Nguyen Van A',
      email: 'a@example.com',
      phone: '0901234567',
    })).resolves.toEqual({
      success: true,
      id: 99,
      status: 1,
      resume: 5,
    });
  });
});
