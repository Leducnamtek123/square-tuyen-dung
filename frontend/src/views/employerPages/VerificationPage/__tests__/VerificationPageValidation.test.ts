import { readFileSync } from 'fs';
import { join } from 'path';

import {
  validateVerificationLegalProfile,
} from '../index';

const t = (key: string) => key;

describe('verification page validation', () => {
  it('rejects invalid legal profile phone numbers', () => {
    const legalErrors = validateVerificationLegalProfile(
      {
        companyName: 'Square Test',
        taxCode: '1234567890',
        businessLicense: 'BL-001',
        representative: 'HR Lead',
        phone: 'not-a-phone',
        email: 'verify@test.com',
        website: '',
      },
      t as never,
    );

    expect(legalErrors.phone).toBe('verification.validation.phone');
  });

  it('allows blank website but rejects invalid website URLs', () => {
    const baseProfile = {
      companyName: 'Square Test',
      taxCode: '1234567890',
      businessLicense: 'BL-001',
      representative: 'HR Lead',
      phone: '0901234567',
      email: 'verify@test.com',
    };

    const blankWebsiteErrors = validateVerificationLegalProfile(
      {
        ...baseProfile,
        website: '',
      },
      t as never,
    );
    const invalidWebsiteErrors = validateVerificationLegalProfile(
      {
        ...baseProfile,
        website: 'not-a-url',
      },
      t as never,
    );

    expect(blankWebsiteErrors.website).toBeUndefined();
    expect(invalidWebsiteErrors.website).toBe('verification.validation.website');
  });

  it('rejects legal profile fields longer than backend model limits', () => {
    const legalErrors = validateVerificationLegalProfile(
      {
        companyName: 'a'.repeat(256),
        taxCode: '1'.repeat(31),
        businessLicense: 'b'.repeat(256),
        representative: 'c'.repeat(101),
        phone: '0901234567',
        email: `${'e'.repeat(64)}@${'a'.repeat(32)}.com`,
        website: 'https://example.com',
      },
      t as never,
    );

    expect(legalErrors.companyName).toBe('verification.validation.maxLength');
    expect(legalErrors.taxCode).toBe('verification.validation.maxLength');
    expect(legalErrors.businessLicense).toBe('verification.validation.maxLength');
    expect(legalErrors.representative).toBe('verification.validation.maxLength');
    expect(legalErrors.email).toBe('verification.validation.maxLength');
  });

  it('does not hard-code fallback text in validation helpers', () => {
    const tSpy = jest.fn((key: string) => key);

    validateVerificationLegalProfile(
      {
        companyName: '',
        taxCode: '1'.repeat(31),
        businessLicense: '',
        representative: '',
        phone: 'not-a-phone',
        email: 'invalid-email',
        website: 'not-a-url',
      },
      tSpy as never,
    );

    const callsWithDefaultValue = tSpy.mock.calls.filter(([, options]) => (
      options &&
      typeof options === 'object' &&
      'defaultValue' in options
    ));
    expect(callsWithDefaultValue).toEqual([]);
  });

  it('does not hard-code fallback text for verification snackbar messages', () => {
    const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
    const messageCalls = source.match(/t\('verification\.messages\.[\s\S]*?\)/g) || [];

    expect(messageCalls).not.toHaveLength(0);
    for (const call of messageCalls) {
      expect(call).not.toContain('defaultValue');
    }
  });

  it('does not hard-code fallback text for verification summary card copy', () => {
    const source = readFileSync(join(__dirname, '../components/VerificationIntroCard.tsx'), 'utf8');
    const summaryCalls = source.match(/t\('verification\.summary\.[\s\S]*?\)/g) || [];

    expect(summaryCalls).not.toHaveLength(0);
    for (const call of summaryCalls) {
      expect(call).not.toContain('defaultValue');
    }
  });

  it('keeps employer verification focused on legal verification without interview scheduling', () => {
    const pageSource = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
    const introSource = readFileSync(join(__dirname, '../components/VerificationIntroCard.tsx'), 'utf8');

    expect(pageSource).not.toContain('<VerificationInterviewRequestForm');
    expect(pageSource).not.toContain('handleRequestInterview');
    expect(introSource).not.toContain('verification.summary.appointment');
    expect(introSource).not.toContain('scheduleReady');
  });
});
