import { readFileSync } from 'fs';
import { join } from 'path';

describe('AppliedJobCard Component & Query Management', () => {
  const filePath = join(__dirname, '../index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('queries job application activity using React Query and jobPostActivityService', () => {
    expect(source).toContain("queryKey: ['applied-jobs', page]");
    expect(source).toContain('jobPostActivityService.getJobPostActivity');
  });

  it('renders NoDataCard when no applied jobs exist', () => {
    expect(source).toContain('<NoDataCard');
    expect(source).toContain('jobSeeker:jobManagement.empty.applied');
    expect(source).toContain('jobSeeker:jobManagement.actions.searchJobs');
  });

  it('distinguishes online profile vs attached resume with fontawesome icons', () => {
    expect(source).toContain('CV_TYPES.cvWebsite');
    expect(source).toContain('CV_TYPES.cvUpload');
    expect(source).toContain('jobSeeker:jobApplication.onlineProfile');
    expect(source).toContain('jobSeeker:jobApplication.attachedResume');
  });
});
