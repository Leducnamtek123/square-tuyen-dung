import statisticService from '../statisticService';
import httpRequest from '../../utils/httpRequest';

jest.mock('../../utils/httpRequest', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe('statisticService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('unwraps nested statistics response envelopes', async () => {
    const employerGeneral = { totalJobPost: 3, totalApply: 12, conversionRate: 50 };
    const recruitment = [{ label: 'Frontend', data: [1, 2, 3] }];
    const jobSeekerTotalView = { totalView: 42 };
    const adminGeneral = { totalUsers: 10, totalJobPosts: 5, totalApplications: 8 };

    (httpRequest.get as jest.Mock)
      .mockResolvedValueOnce({ data: { data: employerGeneral } })
      .mockResolvedValueOnce({ data: { data: jobSeekerTotalView } })
      .mockResolvedValueOnce({ data: { data: adminGeneral } });
    (httpRequest.post as jest.Mock).mockResolvedValueOnce({
      data: { data: recruitment },
    });

    await expect(statisticService.employerGeneralStatistics()).resolves.toEqual(employerGeneral);
    await expect(statisticService.employerRecruitmentStatistics({ jobPost: 7 })).resolves.toEqual(recruitment);
    await expect(statisticService.jobSeekerTotalView()).resolves.toEqual(jobSeekerTotalView);
    await expect(statisticService.adminGeneralStatistics()).resolves.toEqual(adminGeneral);
  });
});
