import { readFileSync } from 'fs';
import { join } from 'path';

describe('JobSeeker ProjectPage (Job Management) Tabs & Views', () => {
  const filePath = join(__dirname, '../ProjectPage/index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('manages 3 tabs: Saved jobs, Applied jobs, and Job notifications', () => {
    expect(source).toContain('<SavedJobCard');
    expect(source).toContain('<AppliedJobCard');
    expect(source).toContain('<JobPostNotificationCard');
    expect(source).toContain('<SuggestedJobPostCard');
  });

  it('initializes selected tab from URL search parameters on client side', () => {
    expect(source).toContain('new URLSearchParams(window.location.search).get("tab")');
  });

  it('binds tab headers with i18n keys', () => {
    expect(source).toContain('jobManagement.tabs.saved');
    expect(source).toContain('jobManagement.tabs.applied');
    expect(source).toContain('jobManagement.tabs.notifications');
  });
});
