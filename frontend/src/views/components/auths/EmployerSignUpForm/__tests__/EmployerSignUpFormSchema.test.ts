import { createEmployerSignUpSchema } from '../index';

const t = (key: string, defaultValue?: string) => {
  const translations: Record<string, string> = {
    'validation.requiredFullName': 'Full name is required.',
    'validation.requiredPhone': 'Contact phone number is required.',
    'validation.invalidPhone': 'Invalid phone number.',
    'validation.requiredEmail': 'Email is required.',
    'validation.invalidEmail': 'Email format is invalid.',
    'validation.requiredPassword': 'Password is required.',
    'validation.passwordMin': 'Password must be at least 8 characters.',
    'validation.passwordRule': 'Password must include uppercase, lowercase, number, special char.',
    'validation.requiredConfirmPassword': 'Confirm password is required.',
    'validation.confirmPasswordMatch': 'Passwords do not match.',
    'validation.requiredCompanyName': 'Company name is required.',
    'validation.requiredCity': 'City is required.',
  };

  return translations[key] || defaultValue || key;
};

describe('createEmployerSignUpSchema (Single-step lean registration)', () => {
  it('validates a correct registration payload successfully', async () => {
    const schema = createEmployerSignUpSchema(t as never);
    const validData = {
      fullName: 'Nguyễn Văn Tuyển',
      phone: '0901234567',
      email: 'recruiter@techcorp.vn',
      password: 'Password@123',
      confirmPassword: 'Password@123',
      company: {
        companyName: 'TechCorp Vietnam JSC',
        location: {
          city: 1,
        },
      },
    };

    await expect(schema.isValid(validData)).resolves.toBe(true);
  });

  it('rejects invalid phone numbers', async () => {
    const schema = createEmployerSignUpSchema(t as never);

    await expect(schema.validateAt('phone', { phone: 'abc12345' })).rejects.toThrow(
      'Invalid phone number.'
    );
  });

  it('rejects invalid company location city ids', async () => {
    const schema = createEmployerSignUpSchema(t as never);

    await expect(schema.validateAt('company.location.city', { company: { location: { city: 0 } } })).rejects.toThrow(
      'City is required.'
    );
    await expect(schema.validateAt('company.location.city', { company: { location: { city: 1.5 } } })).rejects.toThrow(
      'City is required.'
    );
  });

  it('rejects mismatched confirm password', async () => {
    const schema = createEmployerSignUpSchema(t as never);

    await expect(
      schema.validate({
        fullName: 'Nguyễn Văn Tuyển',
        phone: '0901234567',
        email: 'recruiter@techcorp.vn',
        password: 'Password@123',
        confirmPassword: 'DifferentPassword@123',
        company: {
          companyName: 'TechCorp',
          location: { city: 1 },
        },
      })
    ).rejects.toThrow('Passwords do not match.');
  });

  it('does not hard-code English validation fallback messages', () => {
    const tSpy = jest.fn((key: string) => key);

    createEmployerSignUpSchema(tSpy as never);

    const callsWithStringFallback = tSpy.mock.calls.filter(([, defaultValue]) => typeof defaultValue === 'string');
    expect(callsWithStringFallback).toEqual([]);
  });
});
