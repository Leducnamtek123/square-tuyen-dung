import { readFileSync } from 'fs';
import { join } from 'path';

describe('Feedback i18n', () => {
  it('does not hard-code fallback text for evidence image copy', () => {
    const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
    const feedbackKeys = [
      'feedback.evidenceImageInvalid',
      'feedback.evidenceImageTooLarge',
      'feedback.evidenceImageLabel',
      'feedback.evidenceImageUpload',
      'feedback.evidenceImageRemove',
      'feedback.evidenceImageHint',
    ];

    for (const key of feedbackKeys) {
      const call = source.match(new RegExp(`t\\('${key.replaceAll('.', '\\.')}'[\\s\\S]*?\\)`))?.[0] || '';

      expect(call).toContain(`t('${key}'`);
      expect(call).not.toContain('defaultValue');
    }
  });
});
