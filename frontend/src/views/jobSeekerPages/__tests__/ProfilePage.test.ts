import { readFileSync } from 'fs';
import { join } from 'path';

describe('JobSeeker ProfilePage Architecture & Lifecycle', () => {
  const filePath = join(__dirname, '../ProfilePage/index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('retrieves user profile and website resumes through services & queries', () => {
    expect(source).toContain('useResumes');
    expect(source).toContain('jobSeekerProfileService');
    expect(source).toContain('CV_TYPES.cvWebsite');
  });

  it('manages candidate hero banner, skills, applied resumes and edit profile modal', () => {
    expect(source).toContain('<CandidateProfileHeroBanner');
    expect(source).toContain('<CandidateSkillsCard');
    expect(source).toContain('<CandidateAppliedResumeCard');
    expect(source).toContain('<CandidateEditProfileModal');
  });

  it('supports updating candidate isJobSeeking status toggle', () => {
    expect(source).toContain('jobSeekerProfileService.updateProfile');
    expect(source).toContain('isJobSeeking');
  });

  it('formats dates safely with fallback value', () => {
    expect(source).toContain('formatDate');
    expect(source).toContain('dayjs(dateStr)');
  });
});
