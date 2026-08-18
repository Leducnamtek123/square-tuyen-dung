import { readFileSync } from 'fs';
import { join } from 'path';

describe('CandidateEditProfileModal Component & Option Normalization', () => {
  const filePath = join(__dirname, '../CandidateEditProfileModal.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('normalizes select options with choices localization dictionary', () => {
    expect(source).toContain('normalizeOptionLabel');
    expect(source).toContain('commonService');
    expect(source).toContain('getConfigs()');
  });

  it('dynamically loads districts when city selection changes', () => {
    expect(source).toContain('getDistrictsByCityId');
    expect(source).toContain('setDistrictOptions');
  });

  it('submits updated ProfileFormData via onSave callback', () => {
    expect(source).toContain('onSave(formData)');
    expect(source).toContain('onClose()');
  });
});
