import { readFileSync } from 'fs';
import { join } from 'path';

describe('JobSeeker MyInterviewsPage Component & Contract', () => {
  const filePath = join(__dirname, '../MyInterviewsPage/index.tsx');
  const source = readFileSync(filePath, 'utf8');
  const vi = JSON.parse(readFileSync(join(__dirname, '../../../../src/i18n/locales/vi/jobSeeker.json'), 'utf8'));
  const en = JSON.parse(readFileSync(join(__dirname, '../../../../src/i18n/locales/en/jobSeeker.json'), 'utf8'));

  it('queries interviews with pageSize 50 and handles loading/error states', () => {
    expect(source).toContain('useMyInterviews({ pageSize: 50 })');
    expect(source).toContain('isLoading ?');
    expect(source).toContain('isError ?');
  });

  it('transforms raw session data safely using transformInterviewSession', () => {
    expect(source).toContain('transformInterviewSession(session)');
  });

  it('routes to interview room using route constants and invite token', () => {
    expect(source).toContain('ROUTES.JOBSEEKER_INTERVIEW.INTERVIEW_ROOM.replace(\':id\', inviteToken)');
  });

  it('localizes jobs search link with current i18n language', () => {
    expect(source).toContain("localizeRoutePath('/jobs', i18n.language)");
  });

  it('has bilingual i18n keys for myInterviews empty states and fallback labels', () => {
    expect(vi.myInterviews.emptyTitle).toBeDefined();
    expect(en.myInterviews.emptyTitle).toBeDefined();
    expect(vi.myInterviews.emptySubtitle).toBeDefined();
    expect(en.myInterviews.emptySubtitle).toBeDefined();
    expect(vi.myInterviews.findJobs).toBeDefined();
    expect(en.myInterviews.findJobs).toBeDefined();
    expect(vi.myInterviews.jobNameFallback).toBeDefined();
    expect(en.myInterviews.jobNameFallback).toBeDefined();
    expect(vi.myInterviews.companyNameFallback).toBeDefined();
    expect(en.myInterviews.companyNameFallback).toBeDefined();
    expect(vi.myInterviews.join).toBeDefined();
    expect(en.myInterviews.join).toBeDefined();
  });
});
