import httpRequest from '../../utils/httpRequest';
import jobSeekerProfileService from '../jobSeekerProfileService';

jest.mock('../../utils/httpRequest', () => ({
  get: jest.fn(),
  put: jest.fn(),
}));

describe('jobSeekerProfileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes nested data.results resume list responses', async () => {
    const resume = { id: 7, title: 'Frontend CV' };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({
      count: 1,
      data: { results: [resume] },
    });

    const result = await jobSeekerProfileService.getResumes(12);

    expect(httpRequest.get).toHaveBeenCalledWith(
      'info/web/job-seeker-profiles/12/resumes/',
      { params: {} },
    );
    expect(result).toEqual({ count: 1, results: [resume] });
  });

  it('normalizes deeply nested resume list responses', async () => {
    const resume = { id: 8, title: 'Backend CV' };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({
      data: { data: { count: 1, results: [resume] } },
    });

    const result = await jobSeekerProfileService.getResumes(12);

    expect(result).toEqual({ count: 1, results: [resume] });
  });
});
