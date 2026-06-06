import companyService from '../companyService';
import companyTeamService from '../companyTeamService';
import companyVerificationService from '../companyVerificationService';
import interviewService from '../interviewService';
import jobPostActivityService from '../jobPostActivityService';
import questionGroupService from '../questionGroupService';
import questionService from '../questionService';
import resumeSavedService from '../resumeSavedService';
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

describe('employer and job seeker list services response normalization', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (presignInObject as jest.Mock).mockImplementation((data) => Promise.resolve(data));
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

  it('unwraps nested employer company profile responses after presign', async () => {
    const company = { id: 10, companyName: 'Square HR' };
    const updatedCompany = { id: 10, companyName: 'Square Group HR' };
    const logoCompany = { id: 10, companyImageUrl: 'https://cdn.test/logo.png' };
    const coverCompany = { id: 10, companyCoverImageUrl: 'https://cdn.test/cover.png' };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({ data: { data: company } });
    (httpRequest.put as jest.Mock)
      .mockResolvedValueOnce({ data: { data: updatedCompany } })
      .mockResolvedValueOnce({ data: { data: logoCompany } })
      .mockResolvedValueOnce({ data: { data: coverCompany } });

    await expect(companyService.getCompany()).resolves.toEqual(company);
    await expect(companyService.updateCompany(10, { companyName: 'Square Group HR' })).resolves.toEqual(updatedCompany);
    await expect(companyService.updateCompanyImageUrl(new FormData())).resolves.toEqual(logoCompany);
    await expect(companyService.updateCompanyCoverImageUrl(new FormData())).resolves.toEqual(coverCompany);
  });

  it('unwraps nested company verification responses', async () => {
    const verification = { id: 11, companyName: 'Square HR', status: 'pending' };
    const updatedVerification = { id: 11, companyName: 'Square HR', status: 'submitted' };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({ data: { data: verification } });
    (httpRequest.put as jest.Mock).mockResolvedValueOnce({ data: { data: updatedVerification } });

    await expect(companyVerificationService.getVerification()).resolves.toEqual(verification);
    await expect(companyVerificationService.updateVerification({ notes: 'Ready' })).resolves.toEqual(updatedVerification);
  });

  it('unwraps nested company team mutation and current membership responses', async () => {
    const createdRole = { id: 12, name: 'Recruiter' };
    const updatedRole = { id: 12, name: 'Senior Recruiter' };
    const createdMember = { id: 13, invitedEmail: 'member@square.vn' };
    const updatedMember = { id: 13, status: 'active' };
    const myMembership = { id: 14, role: { id: 12 } };
    (httpRequest.post as jest.Mock)
      .mockResolvedValueOnce({ data: { data: createdRole } })
      .mockResolvedValueOnce({ data: { data: createdMember } });
    (httpRequest.patch as jest.Mock)
      .mockResolvedValueOnce({ data: { data: updatedRole } })
      .mockResolvedValueOnce({ data: { data: updatedMember } });
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({ data: { data: myMembership } });

    await expect(companyTeamService.createRole({ code: 'recruiter', name: 'Recruiter' })).resolves.toEqual(createdRole);
    await expect(companyTeamService.updateRole(12, { name: 'Senior Recruiter' })).resolves.toEqual(updatedRole);
    await expect(companyTeamService.createMember({ userId: 5, roleId: 12, invitedEmail: 'member@square.vn' })).resolves.toEqual(createdMember);
    await expect(companyTeamService.updateMember(13, { status: 'active' })).resolves.toEqual(updatedMember);
    await expect(companyTeamService.getMyMembership()).resolves.toEqual(myMembership);
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

  it('unwraps nested employer question detail and mutation responses', async () => {
    const question = { id: 33, text: 'Tell me about React' };
    const createdQuestion = { id: 34, text: 'Tell me about Next.js' };
    const updatedQuestion = { id: 33, text: 'Tell me about React hooks' };

    (httpRequest.get as jest.Mock).mockResolvedValueOnce({ data: { data: question } });
    (httpRequest.post as jest.Mock).mockResolvedValueOnce({ data: { data: createdQuestion } });
    (httpRequest.patch as jest.Mock).mockResolvedValueOnce({ data: { data: updatedQuestion } });

    await expect(questionService.getQuestionDetail(33)).resolves.toEqual(question);
    await expect(questionService.createQuestion({ text: 'Tell me about Next.js' })).resolves.toEqual(createdQuestion);
    await expect(questionService.updateQuestion(33, { text: 'Tell me about React hooks' })).resolves.toEqual(updatedQuestion);

    expect(httpRequest.get).toHaveBeenCalledWith('interview/web/questions/33/');
    expect(httpRequest.post).toHaveBeenCalledWith('interview/web/questions/', { text: 'Tell me about Next.js' });
    expect(httpRequest.patch).toHaveBeenCalledWith('interview/web/questions/33/', { text: 'Tell me about React hooks' });
  });

  it('unwraps nested employer question group detail and mutation responses', async () => {
    const group = { id: 35, name: 'Frontend set' };
    const createdGroup = { id: 36, name: 'Backend set' };
    const updatedGroup = { id: 35, name: 'Frontend advanced set' };

    (httpRequest.get as jest.Mock).mockResolvedValueOnce({ data: { data: group } });
    (httpRequest.post as jest.Mock).mockResolvedValueOnce({ data: { data: createdGroup } });
    (httpRequest.patch as jest.Mock).mockResolvedValueOnce({ data: { data: updatedGroup } });

    await expect(questionGroupService.getQuestionGroupDetail(35)).resolves.toEqual(group);
    await expect(questionGroupService.createQuestionGroup({ name: 'Backend set' })).resolves.toEqual(createdGroup);
    await expect(questionGroupService.updateQuestionGroup(35, { name: 'Frontend advanced set' })).resolves.toEqual(updatedGroup);

    expect(httpRequest.get).toHaveBeenCalledWith('interview/web/question-groups/35/');
    expect(httpRequest.post).toHaveBeenCalledWith('interview/web/question-groups/', { name: 'Backend set' });
    expect(httpRequest.patch).toHaveBeenCalledWith('interview/web/question-groups/35/', { name: 'Frontend advanced set' });
  });
});
