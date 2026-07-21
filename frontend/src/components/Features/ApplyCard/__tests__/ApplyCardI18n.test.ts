import { readFileSync } from 'fs';
import { join } from 'path';

const applyCardKeys = ['positionCaption', 'submit', 'success'];
const hardCodedCopy = ['Applied successfully.', 'Ứng tuyển vị trí', 'Ứng tuyển'];

describe('ApplyCard i18n', () => {
  it('does not hard-code apply modal copy or toast text', () => {
    const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

    expect(source).toContain('useTranslation("public")');
    hardCodedCopy.forEach((text) => {
      expect(source).not.toContain(text);
    });
    applyCardKeys.forEach((key) => {
      expect(source).toContain(`applyCard.${key}`);
    });
  });

  it('has Vietnamese and English apply card copy', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/public.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/public.json'), 'utf8'));

    applyCardKeys.forEach((key) => {
      expect(vi.applyCard?.[key]).toEqual(expect.any(String));
      expect(en.applyCard?.[key]).toEqual(expect.any(String));
    });
  });
});
