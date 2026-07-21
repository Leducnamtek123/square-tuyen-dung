import fs from 'fs';
import path from 'path';

import {
  getCareerFormValidationErrors,
  type CareerFormValidationData,
} from '../careerFormValidation';

const validFormData: CareerFormValidationData = {
  name: 'Software Development',
};

describe('getCareerFormValidationErrors', () => {
  it('accepts values that match the backend Career model contract', () => {
    expect(getCareerFormValidationErrors(validFormData)).toEqual({});
  });

  it('rejects missing or overlong names before submitting', () => {
    expect(getCareerFormValidationErrors({ name: '   ' })).toEqual({
      name: 'nameRequired',
    });

    expect(getCareerFormValidationErrors({ name: 'A'.repeat(151) })).toEqual({
      name: 'nameMax',
    });
  });

  it('wires validation into the Careers dialog field and save action', () => {
    const pageSource = fs.readFileSync(
      path.join(__dirname, '../index.tsx'),
      'utf8',
    );

    expect(pageSource).toContain('getCareerFormValidationErrors');
    expect(pageSource).toContain('hasValidationErrors');
    expect(pageSource).toContain("getCareerValidationText('name')");
    expect(pageSource).toContain('disabled={isMutating || hasValidationErrors}');
  });
});
