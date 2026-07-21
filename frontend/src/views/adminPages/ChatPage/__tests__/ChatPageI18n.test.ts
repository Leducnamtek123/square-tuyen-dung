import { readFileSync } from 'fs';
import { join } from 'path';

describe('ChatPage i18n', () => {
  it('does not hard-code fallback text for fixed chat management copy', () => {
    const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
    const lines = source.split(/\r?\n/);
    const keys = [
      'chat.detail.noMessages',
      'chat.detail.openAttachment',
      'chat.detail.title',
      'chat.search.title',
      'common.clearFilters',
      'common.close',
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
