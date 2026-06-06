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

  it('unwraps nested profile detail and update responses after presign', async () => {
    const profile = { id: 3, user: { fullName: 'Candidate One' } };
    const updatedProfile = { id: 3, user: { fullName: 'Candidate Updated' } };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({ data: { data: profile } });
    (httpRequest.put as jest.Mock).mockResolvedValueOnce({ data: { data: updatedProfile } });

    await expect(jobSeekerProfileService.getProfile()).resolves.toEqual(profile);
    await expect(jobSeekerProfileService.updateProfile({ user: { fullName: 'Candidate Updated' } })).resolves.toEqual(
      updatedProfile,
    );
    expect(httpRequest.get).toHaveBeenCalledWith('info/profile/');
    expect(httpRequest.put).toHaveBeenCalledWith('info/profile/', { user: { fullName: 'Candidate Updated' } });
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
