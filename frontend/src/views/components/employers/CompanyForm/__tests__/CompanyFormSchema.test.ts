import { createCompanyFormSchema } from '../index';
import { readFileSync } from 'fs';
import { join } from 'path';

const t = (_key: string, defaultValue?: string) => defaultValue || _key;

const companyFormT = (key: string, defaultValue?: string) => {
  const translations: Record<string, string> = {
    'companyForm.placeholder.entercompanytaxcode': 'Nhập mã số thuế',
    'companyForm.placeholder.selectcompanysize': 'Chọn quy mô công ty',
    'companyForm.placeholder.entercompanyfieldofoperation': 'Nhập lĩnh vực hoạt động của công ty',
    'companyForm.validation.companyNameRequired': 'Tên công ty là bắt buộc',
    'companyForm.validation.taxCodeRequired': 'Mã số thuế là bắt buộc',
    'companyForm.validation.employeeSizeRequired': 'Quy mô công ty là bắt buộc',
    'companyForm.validation.fieldOperationRequired': 'Lĩnh vực hoạt động là bắt buộc',
    'companyForm.validation.foundedDateInFuture': 'Ngày thành lập không được ở tương lai.',
    'companyForm.validation.employeeSizeInvalid': 'Quy mô công ty không hợp lệ.',
    'companyForm.validation.companyEmailRequired': 'Email công ty là bắt buộc',
    'companyForm.validation.companyEmailInvalid': 'Email công ty không hợp lệ',
    'companyForm.validation.companyEmailMax': 'Email công ty tối đa 100 ký tự',
    'companyForm.validation.companyPhoneRequired': 'Số điện thoại công ty là bắt buộc',
    'companyForm.validation.companyPhoneInvalid': 'Số điện thoại công ty không hợp lệ',
    'companyForm.validation.companyPhoneMax': 'Số điện thoại công ty tối đa 15 ký tự',
  };

  return translations[key] || defaultValue || key;
};

describe('createCompanyFormSchema', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('allows manual company locations without coordinates', async () => {
    const schema = createCompanyFormSchema(t as never);
    const location = {
      city: 1,
      district: 2,
      address: '123 Nguyen Trai',
      lat: '',
      lng: '',
    };

    await expect(schema.validateAt('location', { location })).resolves.toMatchObject({
      ...location,
      lat: null,
      lng: null,
    });
  });

  it('rejects invalid company location relation ids', async () => {
    const schema = createCompanyFormSchema(t as never);

    await expect(schema.validateAt('location.city', { location: { city: 0 } })).rejects.toThrow(
      'jobPostForm.validation.cityprovinceisrequired',
    );
    await expect(schema.validateAt('location.city', { location: { city: 1.5 } })).rejects.toThrow(
      'jobPostForm.validation.cityprovinceisrequired',
    );
    await expect(schema.validateAt('location.district', { location: { district: 0 } })).rejects.toThrow(
      'jobPostForm.validation.districtisrequired',
    );
    await expect(schema.validateAt('location.district', { location: { district: 1.5 } })).rejects.toThrow(
      'jobPostForm.validation.districtisrequired',
    );
  });

  it('rejects future founded dates', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 5, 4, 12, 0, 0).getTime());
    const schema = createCompanyFormSchema(companyFormT as never);
    const tomorrow = new Date(2026, 5, 5, 0, 0, 0);

    await expect(schema.validateAt('since', { since: tomorrow })).rejects.toThrow(
      'Ngày thành lập không được ở tương lai.',
    );
  });

  it('rejects invalid employee size options', async () => {
    const schema = createCompanyFormSchema(companyFormT as never);

    await expect(schema.validateAt('employeeSize', { employeeSize: 999 })).rejects.toThrow(
      'Quy mô công ty không hợp lệ.',
    );
  });

  it('uses validation messages instead of placeholders for required company fields', async () => {
    const schema = createCompanyFormSchema(companyFormT as never);

    await expect(schema.validateAt('companyName', { companyName: '' })).rejects.toThrow(
      'Tên công ty là bắt buộc',
    );
    await expect(schema.validateAt('taxCode', { taxCode: '' })).rejects.toThrow(
      'Mã số thuế là bắt buộc',
    );
    await expect(schema.validateAt('employeeSize', { employeeSize: undefined })).rejects.toThrow(
      'Quy mô công ty là bắt buộc',
    );
    await expect(schema.validateAt('fieldOperation', { fieldOperation: '' })).rejects.toThrow(
      'Lĩnh vực hoạt động là bắt buộc',
    );
  });

  it('uses company-specific validation messages for company email and phone', async () => {
    const schema = createCompanyFormSchema(companyFormT as never);

    await expect(schema.validateAt('companyEmail', { companyEmail: '' })).rejects.toThrow(
      'Email công ty là bắt buộc',
    );
    await expect(schema.validateAt('companyEmail', { companyEmail: 'not-an-email' })).rejects.toThrow(
      'Email công ty không hợp lệ',
    );
    await expect(schema.validateAt('companyEmail', { companyEmail: `${'a'.repeat(101)}@test.com` })).rejects.toThrow(
      'Email công ty tối đa 100 ký tự',
    );
    await expect(schema.validateAt('companyPhone', { companyPhone: '' })).rejects.toThrow(
      'Số điện thoại công ty là bắt buộc',
    );
    await expect(schema.validateAt('companyPhone', { companyPhone: 'not-a-phone' })).rejects.toThrow(
      'Số điện thoại công ty không hợp lệ',
    );
    await expect(schema.validateAt('companyPhone', { companyPhone: '1234567890123456' })).rejects.toThrow(
      'Số điện thoại công ty tối đa 15 ký tự',
    );
  });

  it('keeps founded date and coordinate fields aligned with schema', () => {
    const fieldsSource = readFileSync(join(__dirname, '../CompanyFormFields.tsx'), 'utf8');
    const latFieldSource = fieldsSource.slice(
      fieldsSource.indexOf('name="location.lat"'),
      fieldsSource.indexOf('</Grid>', fieldsSource.indexOf('name="location.lat"')),
    );
    const lngFieldSource = fieldsSource.slice(
      fieldsSource.indexOf('name="location.lng"'),
      fieldsSource.indexOf('</Grid>', fieldsSource.indexOf('name="location.lng"')),
    );

    expect(fieldsSource).toContain('name="since"');
    expect(fieldsSource).toContain('maxDate={DATE_OPTIONS.today()}');
    expect(latFieldSource).not.toContain('showRequired={true}');
    expect(lngFieldSource).not.toContain('showRequired={true}');
  });

  it('does not hard-code fallback labels or placeholders in company form fields', () => {
    const fieldsSource = readFileSync(join(__dirname, '../CompanyFormFields.tsx'), 'utf8');

    expect(fieldsSource).not.toMatch(/t\('companyForm\.[^']+'\s*,\s*['"]/);
    expect(fieldsSource).not.toContain('defaultValue');
  });
});
