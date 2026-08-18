import { readFileSync } from 'fs';
import { join } from 'path';

describe('Admin AuditLogsPage Component & Compliance Logging', () => {
  const filePath = join(__dirname, '../AuditLogsPage/index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('fetches audit logs via adminManagementService with filtering by action, actor, and date', () => {
    expect(source).toContain('adminManagementService');
    expect(source).toContain('actorEmail');
    expect(source).toContain('dateFrom');
    expect(source).toContain('dateTo');
  });

  it('provides CSV export modal and pagination data table', () => {
    expect(source).toContain('ExportModal');
    expect(source).toContain('DataTable');
  });
});
