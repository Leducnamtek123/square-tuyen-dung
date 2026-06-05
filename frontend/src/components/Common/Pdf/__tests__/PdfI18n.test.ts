import { readFileSync } from 'fs';
import { join } from 'path';

describe('Pdf i18n', () => {
  it('does not hard-code fallback text for the download action', () => {
    const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
    const call = source.match(/t\('actions\.download'[\s\S]*?\)/)?.[0] || '';

    expect(call).toContain("t('actions.download'");
    expect(call).not.toContain('defaultValue');
    expect(call).not.toMatch(/t\('actions\.download'\s*,\s*['"]/);
  });
});
