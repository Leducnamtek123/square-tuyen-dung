import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Admin JobsPage Component & Job Moderation Architecture', () => {
  const filePath = join(__dirname, '../JobsPage/index.tsx');
  const hooksPath = join(__dirname, '../JobsPage/hooks/useJobs.ts');

  it('verifies JobsPage and useJobs exist', () => {
    expect(existsSync(filePath)).toBe(true);
    expect(existsSync(hooksPath)).toBe(true);
  });

  it('moderates job postings with approve, reject, and delete mutations', () => {
    const source = readFileSync(filePath, 'utf8');
    expect(source).toContain('useJobs');
    expect(source).toContain('approveJob');
    expect(source).toContain('rejectJob');
    expect(source).toContain('deleteJob');
  });

  it('integrates AdminDataGrid, bulk actions, and status badges in JobsPage', () => {
    const source = readFileSync(filePath, 'utf8');
    expect(source).toContain('AdminDataGrid');
    expect(source).toContain('AdminStatusBadge');
    expect(source).toContain('AdminConfirmDialog');
    expect(source).toContain('AdminDetailDrawer');
    expect(source).toContain('bulkActions');
  });

  it('supports bulk approve and bulk reject mutations in useJobs', () => {
    const source = readFileSync(hooksPath, 'utf8');
    expect(source).toContain('bulkApprove');
    expect(source).toContain('bulkReject');
  });
});
