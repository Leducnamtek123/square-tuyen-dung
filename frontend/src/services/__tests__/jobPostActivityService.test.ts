import jobPostActivityService from '../jobPostActivityService';
import httpRequest from '../../utils/httpRequest';
import { presignInObject } from '../../utils/presignUrl';

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
    (presignInObject as jest.Mock).mockImplementation((data) => Promise.resolve(data));
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

  it('unwraps nested applied profile detail responses after presign', async () => {
    const activity = { id: 44, candidateName: 'Le Duc Nam' };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({
      data: { data: activity },
    });

    await expect(jobPostActivityService.getJobPostActivityDetail(44)).resolves.toEqual(activity);
  });

  it('unwraps nested applied profile mutation responses', async () => {
    const statusActivity = { id: 45, status: 3 };
    const reviewedActivity = { id: 46, aiReviewStatus: 'reviewed' };
    (httpRequest.put as jest.Mock).mockResolvedValueOnce({
      data: { data: statusActivity },
    });
    (httpRequest.post as jest.Mock).mockResolvedValueOnce({
      data: { data: reviewedActivity },
    });

    await expect(jobPostActivityService.changeApplicationStatus(45, { status: 3 })).resolves.toEqual(statusActivity);
    await expect(jobPostActivityService.reviewAIAnalysis(46, { reviewStatus: 'reviewed' })).resolves.toEqual(reviewedActivity);
  });

  it('unwraps nested manual candidate create responses', async () => {
    const manualActivity = {
      id: 47,
      fullName: 'Tran Thi B',
      isManualCandidate: true,
      jobName: 'Frontend Developer',
    };
    const formData = new FormData();
    (httpRequest.post as jest.Mock).mockResolvedValueOnce({
      data: { data: manualActivity },
    });

    await expect(jobPostActivityService.createManualAppliedCandidate(formData)).resolves.toEqual(manualActivity);
    expect(httpRequest.post).toHaveBeenCalledWith(
      'job/web/employer-job-posts-activity/manual-candidates/',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  });
});
