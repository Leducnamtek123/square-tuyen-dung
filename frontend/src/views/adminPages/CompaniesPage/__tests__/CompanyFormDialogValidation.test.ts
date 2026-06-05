import { isCompanyFormSaveDisabled } from '../CompanyFormDialog';
import { createEmptyCompanyFormData } from '../types';

describe('CompanyFormDialog validation state', () => {
  const validFormData = () => ({
    ...createEmptyCompanyFormData(),
    companyName: 'Square Test',
    taxCode: 'TAX-001',
    companyEmail: 'company@example.com',
    companyPhone: '0901234567',
    employeeSize: 1,
    fieldOperation: 'Technology',
    location: {
      ...createEmptyCompanyFormData().location,
      address: '1 Nguyen Hue',
    },
  });

  it.each([
    ['company name', { companyName: '   ' }],
    ['tax code', { taxCode: '   ' }],
    ['company email', { companyEmail: '   ' }],
    ['company phone', { companyPhone: '   ' }],
    ['employee size', { employeeSize: 0 }],
    ['field operation', { fieldOperation: '   ' }],
    ['address', { location: { ...validFormData().location, address: '   ' } }],
  ])('disables saving when %s is missing', (_field, override) => {
    const formData = { ...validFormData(), ...override };

    expect(isCompanyFormSaveDisabled(formData, false)).toBe(true);
  });

  it('disables saving while a mutation is pending', () => {
    expect(isCompanyFormSaveDisabled(validFormData(), true)).toBe(true);
  });

  it('allows saving when all backend-required fields are present', () => {
    expect(isCompanyFormSaveDisabled(validFormData(), false)).toBe(false);
  });
});
