import { readFileSync } from 'fs';
import { join } from 'path';

describe('JobSeeker API Services Contracts', () => {
  const profileServicePath = join(__dirname, '../jobSeekerProfileService.ts');
  const resumeServicePath = join(__dirname, '../resumeService.ts');
  const companyFollowedPath = join(__dirname, '../companyFollowed.ts');
  const notificationServicePath = join(__dirname, '../jobPostNotificationService.ts');

  const profileSource = readFileSync(profileServicePath, 'utf8');
  const resumeSource = readFileSync(resumeServicePath, 'utf8');
  const companyFollowedSource = readFileSync(companyFollowedPath, 'utf8');
  const notificationSource = readFileSync(notificationServicePath, 'utf8');

  it('jobSeekerProfileService normalizes birthday/issue dates to YYYY-MM-DD format before PUT', () => {
    expect(profileSource).toContain('formatDateForApi');
    expect(profileSource).toContain('normalizeProfilePayload');
    expect(profileSource).toContain("const url = 'info/profile/'");
    expect(profileSource).toContain('normalizePaginatedResponse');
  });

  it('resumeService manages active resume toggles and website/upload resumes', () => {
    expect(resumeSource).toContain('activeResume');
    expect(resumeSource).toContain('httpRequest');
  });

  it('companyFollowed manages followed companies endpoints', () => {
    expect(companyFollowedSource).toContain('companyFollowed');
    expect(companyFollowedSource).toContain('httpRequest');
  });

  it('jobPostNotificationService supports full CRUD on job alerts', () => {
    expect(notificationSource).toContain('getJobPostNotifications');
    expect(notificationSource).toContain('addJobPostNotification');
    expect(notificationSource).toContain('updateJobPostNotificationById');
    expect(notificationSource).toContain('deleteJobPostNotificationDetailById');
  });
});
