import companyTeamService from '../companyTeamService';
import interviewService from '../interviewService';
import jobPostActivityService from '../jobPostActivityService';
import questionGroupService from '../questionGroupService';
import questionService from '../questionService';
import resumeSavedService from '../resumeSavedService';
import httpRequest from '../../utils/httpRequest';
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

describe('employer and job seeker list services response normalization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes nested applied resume responses after presign', async () => {
    const activity = { id: 21, candidateName: 'Nguyen Van A' };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({
      data: { count: 1, results: [activity] },
    });

    const result = await jobPostActivityService.getAppliedResume({ page: 1 });

    expect(httpRequest.get).toHaveBeenCalledWith('job/web/employer-job-posts-activity/', { params: { page: 1 } });
    expect(result).toEqual({ count: 1, results: [activity] });
  });

  it('normalizes raw saved resume responses', async () => {
    const savedResume = { id: 7, resume: { id: 3 } };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce([savedResume]);

    const result = await resumeSavedService.getResumesSaved({ page: 2 });

    expect(httpRequest.get).toHaveBeenCalledWith('info/web/resumes-saved/', { params: { page: 2 } });
    expect(result).toEqual({ count: 1, results: [savedResume] });
  });

  it('normalizes company team role and member list responses', async () => {
    const role = { id: 4, name: 'HR' };
    const member = { id: 8, invitedEmail: 'member@square.vn' };
    (httpRequest.get as jest.Mock)
      .mockResolvedValueOnce({ data: { count: 1, results: [role] } })
      .mockResolvedValueOnce([member]);

    const roles = await companyTeamService.getRoles({ page: 1 });
    const members = await companyTeamService.getMembers({ page: 1 });

    expect(httpRequest.get).toHaveBeenNthCalledWith(1, 'info/web/company-roles/', { params: { page: 1 } });
    expect(httpRequest.get).toHaveBeenNthCalledWith(2, 'info/web/company-members/', { params: { page: 1 } });
    expect(roles).toEqual({ count: 1, results: [role] });
    expect(members).toEqual({ count: 1, results: [member] });
  });

  it('keeps current company membership typed as nullable when backend returns data null', () => {
    const serviceSource = fs.readFileSync(path.join(process.cwd(), 'src/services/companyTeamService.ts'), 'utf8');

    expect(serviceSource).toContain('getMyMembership: (): Promise<CompanyMember | null>');
    expect(serviceSource).not.toContain('getMyMembership: (): Promise<CompanyMember>');
  });

  it('normalizes interview session and evaluation list responses', async () => {
    const session = { id: 15, status: 'scheduled' };
    const evaluation = { id: 16, result: 'passed' };
    (httpRequest.get as jest.Mock)
      .mockResolvedValueOnce({ data: { count: 1, results: [session] } })
      .mockResolvedValueOnce([evaluation]);

    const sessions = await interviewService.getSessions({ page: 1 });
    const evaluations = await interviewService.getEvaluations(15);

    expect(httpRequest.get).toHaveBeenNthCalledWith(1, 'interview/web/sessions/', { params: { page: 1 } });
    expect(httpRequest.get).toHaveBeenNthCalledWith(2, 'interview/web/evaluations/', { params: { interview: 15 } });
    expect(sessions).toEqual({ count: 1, results: [session] });
    expect(evaluations).toEqual({ count: 1, results: [evaluation] });
  });

  it('normalizes question and question group list responses', async () => {
    const question = { id: 31, text: 'Tell me about yourself' };
    const group = { id: 32, name: 'Frontend set' };
    (httpRequest.get as jest.Mock)
      .mockResolvedValueOnce([question])
      .mockResolvedValueOnce({ data: { count: 1, results: [group] } });

    const questions = await questionService.getQuestions({ page: 1 });
    const groups = await questionGroupService.getQuestionGroups({ page: 1 });

    expect(httpRequest.get).toHaveBeenNthCalledWith(1, 'interview/web/questions/', { params: { page: 1 } });
    expect(httpRequest.get).toHaveBeenNthCalledWith(2, 'interview/web/question-groups/', { params: { page: 1 } });
    expect(questions).toEqual({ count: 1, results: [question] });
    expect(groups).toEqual({ count: 1, results: [group] });
  });
});
