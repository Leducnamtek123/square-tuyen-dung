import { readFileSync } from 'fs';
import { join } from 'path';

describe('ErrorBoundary i18n', () => {
  it('does not hard-code fallback text for fixed error boundary copy', () => {
    const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
    const lines = source.split(/\r?\n/);
    const keys = [
      'common:errorBoundary.copyError',
      'common:errorBoundary.message',
      'common:errorBoundary.reload',
      'common:errorBoundary.retry',
      'common:errorBoundary.title',
      'common:errorBoundary.unknownError',
    ];

    for (const key of keys) {
      const matchingLines = lines.filter((line) => line.includes(`i18next.t('${key}'`));

      expect(matchingLines).not.toHaveLength(0);
      for (const line of matchingLines) {
        expect(line).not.toMatch(new RegExp(`i18next\\.t\\('${key.replaceAll('.', '\\.')}'\\s*,\\s*['"]`));
      }
    }
  });
});
