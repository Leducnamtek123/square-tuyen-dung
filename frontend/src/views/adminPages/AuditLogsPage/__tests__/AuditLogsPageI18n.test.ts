import { readFileSync } from 'fs';
import { join } from 'path';

describe('AuditLogsPage i18n', () => {
  it('does not hard-code fallback text for fixed audit log copy', () => {
    const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
    const lines = source.split(/\r?\n/);
    const keys = [
      'common.advancedFilters',
      'common.clearFilters',
      'pages.auditLogs.exportCsv',
      'pages.auditLogs.exportingCsv',
      'pages.auditLogs.filter.action',
      'pages.auditLogs.filter.actorEmail',
      'pages.auditLogs.filter.allActions',
      'pages.auditLogs.filter.dateFrom',
      'pages.auditLogs.filter.dateTo',
      'pages.auditLogs.filter.resourceId',
      'pages.auditLogs.filter.resourceType',
      'pages.auditLogs.filter.title',
      'pages.auditLogs.searchPlaceholder',
      'pages.auditLogs.table.action',
      'pages.auditLogs.table.actor',
      'pages.auditLogs.table.request',
      'pages.auditLogs.table.resource',
      'pages.auditLogs.table.time',
      'pages.auditLogs.title',
    ];

    for (const key of keys) {
      const matchingLines = lines.filter((line) => line.includes(`t('${key}'`));

      expect(matchingLines).not.toHaveLength(0);
      for (const line of matchingLines) {
        expect(line).not.toMatch(new RegExp(`t\\('${key.replaceAll('.', '\\.')}'\\s*,\\s*['"]`));
      }
    }
  });
});
