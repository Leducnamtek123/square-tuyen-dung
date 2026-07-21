import { readFileSync } from 'fs';
import { join } from 'path';

import { isCompanyFormSaveDisabled } from '../CompanyFormDialog';
import {
  getCompanyFormValidationErrors,
  type CompanyFormValidationData,
} from '../companyFormValidation';
import { createEmptyCompanyFormData } from '../types';

describe('CompanyFormDialog validation state', () => {
  const validFormData = (): CompanyFormValidationData => ({
    ...createEmptyCompanyFormData(),
    companyName: 'Square Test',
    taxCode: 'TAX-001',
    companyEmail: 'company@example.com',
    companyPhone: '0901234567',
    employeeSize: 1,
    fieldOperation: 'Technology',
    location: {
      ...createEmptyCompanyFormData().location,
      city: 1,
      district: 1,
      address: '1 Nguyen Hue',
    },
  });

  it('accepts values that match the backend CompanySerializer contract', () => {
    expect(getCompanyFormValidationErrors(validFormData())).toEqual({});
  });

  it.each([
    ['company name', { companyName: '   ' }],
    ['tax code', { taxCode: '   ' }],
    ['company email', { companyEmail: '   ' }],
    ['company phone', { companyPhone: '   ' }],
    ['employee size', { employeeSize: 0 }],
    ['field operation', { fieldOperation: '   ' }],
    ['city', { location: { ...validFormData().location, city: null } }],
    ['district', { location: { ...validFormData().location, district: null } }],
    ['address', { location: { ...validFormData().location, address: '   ' } }],
  ])('disables saving when %s is missing', (_field, override) => {
    const formData = { ...validFormData(), ...override };

    expect(isCompanyFormSaveDisabled(formData, false)).toBe(true);
  });

  it('rejects company fields that backend serializer would reject', () => {
    expect(
      getCompanyFormValidationErrors({
        ...validFormData(),
        companyName: 'A'.repeat(256),
        taxCode: 'T'.repeat(31),
        companyEmail: 'not-an-email',
        companyPhone: 'not-a-phone',
        employeeSize: 999,
        fieldOperation: 'F'.repeat(256),
        websiteUrl: 'not-a-url',
        since: '2999-01-01',
      }),
    ).toEqual({
      companyName: 'companyNameMax',
      taxCode: 'taxCodeMax',
      companyEmail: 'companyEmailInvalid',
      companyPhone: 'companyPhoneInvalid',
      employeeSize: 'employeeSizeInvalid',
      fieldOperation: 'fieldOperationMax',
      websiteUrl: 'websiteUrlInvalid',
      since: 'sinceFuture',
    });
  });

  it('rejects invalid company location values before submitting', () => {
    expect(
      getCompanyFormValidationErrors({
        ...validFormData(),
        location: {
          ...validFormData().location,
          city: 0,
          district: 1.5,
          ward: -1,
          address: 'A'.repeat(256),
        },
      }),
    ).toEqual({
      city: 'cityInvalid',
      district: 'districtInvalid',
      ward: 'wardInvalid',
      address: 'addressMax',
    });
  });

  it('disables saving while a mutation is pending', () => {
    expect(isCompanyFormSaveDisabled(validFormData(), true)).toBe(true);
  });

  it('allows saving when all backend-required fields are present', () => {
    expect(isCompanyFormSaveDisabled(validFormData(), false)).toBe(false);
  });

  it('wires validation errors into the company dialog fields', () => {
    const source = readFileSync(join(__dirname, '../CompanyFormDialog.tsx'), 'utf8');

    expect(source).toContain('getCompanyFormValidationErrors');
    expect(source).toContain("getCompanyValidationText('companyName')");
    expect(source).toContain("getCompanyValidationText('taxCode')");
    expect(source).toContain("getCompanyValidationText('companyEmail')");
    expect(source).toContain("getCompanyValidationText('companyPhone')");
    expect(source).toContain("getCompanyValidationText('city')");
    expect(source).toContain("getCompanyValidationText('district')");
    expect(source).toContain('disabled={isCompanyFormSaveDisabled(formData, isMutating)}');
  });
});
