import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

describe('ResumesPage file actions', () => {
  it('does not open placeholder links when a resume has no file URL', () => {
    expect(source).not.toContain("href={resume.fileUrl || '#'}");
    expect(source).toContain('const fileUrl = resume.fileUrl ||');
    expect(source).toContain('disabled={!fileUrl}');
  });
});
