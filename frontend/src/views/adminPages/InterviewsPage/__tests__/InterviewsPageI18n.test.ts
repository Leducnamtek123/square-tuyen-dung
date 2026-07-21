import { readFileSync } from 'fs';
import { join } from 'path';

describe('InterviewsPage i18n', () => {
  it('does not hard-code fallback text for fixed interview management copy', () => {
    const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
    const lines = source.split(/\r?\n/);
    const keys = [
      'common.cancel',
      'common.clearFilters',
      'common.close',
      'common.delete',
      'common.deleting',
      'pages.interviews.deleteTitle',
      'pages.interviews.detailTitle',
      'pages.interviews.filter.title',
      'pages.interviews.recordingLink',
      'pages.interviews.searchPlaceholder',
      'pages.interviews.table.actions',
      'pages.interviews.table.cancel',
      'pages.interviews.table.delete',
      'pages.interviews.table.markCompleted',
      'pages.interviews.table.view',
      'pages.interviews.toast.deleteError',
      'pages.interviews.toast.deleteSuccess',
      'pages.interviews.toast.statusUpdateError',
      'pages.interviews.toast.statusUpdated',
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
