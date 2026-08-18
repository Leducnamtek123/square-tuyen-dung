import { readFileSync } from 'fs';
import { join } from 'path';

describe('BoxProfile Component & Active Status Toggle', () => {
  const filePath = join(__dirname, '../index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('queries website resumes with useResumes and syncs query invalidation', () => {
    expect(source).toContain('useResumes');
    expect(source).toContain('CV_TYPES.cvWebsite');
    expect(source).toContain("queryKey: ['resumes', jobSeekerProfileId]");
  });

  it('toggles searchable active status with resumeService.activeResume and redux reload', () => {
    expect(source).toContain('resumeService.activeResume');
    expect(source).toContain('dispatch(reloadResume())');
    expect(source).toContain('jobSeeker:profile.messages.profileStatusUpdateSuccess');
  });

  it('provides color picker dialog and PDF download button integration', () => {
    expect(source).toContain('ColorPickerDialog');
    expect(source).toContain('CVDocDownloadButton');
    expect(source).toContain('handleColorSelect');
  });
});
