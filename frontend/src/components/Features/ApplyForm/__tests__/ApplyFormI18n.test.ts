import { readFileSync } from 'fs';
import { join } from 'path';

describe('ApplyForm i18n', () => {
  it('does not hard-code fallback text for validation messages', () => {
    const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
    const validationCalls = source.match(/t\("applyForm\.validation\.[\s\S]*?\)/g) || [];

    expect(validationCalls).not.toHaveLength(0);
    for (const call of validationCalls) {
      expect(call).not.toContain('defaultValue');
    }
  });

  it('does not hard-code fallback text for apply form copy', () => {
    const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
    const applyFormCalls = source.match(/t\("applyForm\.[\s\S]*?\)/g) || [];

    expect(applyFormCalls).not.toHaveLength(0);
    for (const call of applyFormCalls) {
      expect(call).not.toContain('defaultValue');
    }
  });

  it('keeps phone max-length validation aligned with the backend apply serializer', () => {
    const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

    expect(source).toContain('.max(15, t("applyForm.validation.phoneMax"))');
  });
});
