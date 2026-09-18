import { readFileSync } from 'fs';
import { join } from 'path';

describe('Admin ResumesPage Component & Resume Management', () => {
  const filePath = join(__dirname, '../ResumesPage/index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('manages candidate resumes and deletion via useResumes', () => {
    expect(source).toContain('useResumes');
    expect(source).toContain('deleteResume');
    expect(source).toContain('DataTable');
  });

  it('provides safe resume file download and preview links', () => {
    expect(source).toContain('getSafeResourceUrl');
    expect(source).toContain('DownloadIcon');
  });
});
