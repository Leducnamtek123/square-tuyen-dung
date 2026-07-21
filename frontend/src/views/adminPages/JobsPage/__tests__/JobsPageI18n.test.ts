import { readFileSync } from 'fs';
import { join } from 'path';

const expectNoFallbackForKeys = (source: string, keys: string[]) => {
  const lines = source.split(/\r?\n/);

  for (const key of keys) {
    const matchingLines = lines.filter((line) => line.includes(`t('${key}'`));

    expect(matchingLines).not.toHaveLength(0);
    for (const line of matchingLines) {
      expect(line).not.toMatch(new RegExp(`t\\('${key.replaceAll('.', '\\.')}'\\s*,\\s*['"]`));
    }
  }
};

describe('JobsPage i18n', () => {
  it('does not hard-code fallback text for fixed job management copy', () => {
    const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

    expectNoFallbackForKeys(source, [
      'common.all',
      'common.clearFilters',
      'common.status.label',
      'pages.jobs.filter.title',
      'pages.jobs.status.approved',
      'pages.jobs.status.expired',
      'pages.jobs.status.pending',
      'pages.jobs.status.rejected',
      'pages.jobs.status.unknown',
      'pages.jobs.table.approveAction',
      'pages.jobs.table.rejectAction',
      'pages.jobs.table.view',
    ]);
  });

  it('does not hard-code fallback text in the reusable job filters component', () => {
    const source = readFileSync(join(__dirname, '../components/JobFilters.tsx'), 'utf8');

    expectNoFallbackForKeys(source, [
      'common.clearFilters',
      'pages.jobs.filter.title',
    ]);
  });
});
