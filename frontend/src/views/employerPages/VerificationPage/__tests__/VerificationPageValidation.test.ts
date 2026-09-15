import { readFileSync } from 'fs';
import { join } from 'path';

import {
  validateVerificationLegalProfile,
  calculateLegalCompletion,
  getStatusLabelKey,
  getStatusColor,
  REQUIRED_LEGAL_FIELDS,
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

  describe('state machine audit & profile completeness separation', () => {
    it('separates completeness percentage calculation from administrative verification status', () => {
      const emptyProfile = {};
      const resEmpty = calculateLegalCompletion(emptyProfile);
      expect(resEmpty.completion).toBe(0);
      expect(resEmpty.missingFields).toHaveLength(REQUIRED_LEGAL_FIELDS.length);

      const partialProfile = {
        companyName: 'Square Inc',
        taxCode: '0101234567',
        representative: 'Director A',
      };
      const resPartial = calculateLegalCompletion(partialProfile);
      expect(resPartial.completion).toBe(50);
      expect(resPartial.missingFields).toEqual(['businessLicense', 'phone', 'email']);

      const fullProfile = {
        companyName: 'Square Tech Vietnam',
        taxCode: '0109998888',
        businessLicense: 'https://example.com/license.pdf',
        representative: 'Nguyen Van A',
        phone: '0901234567',
        email: 'contact@squaretech.vn',
        website: 'https://squaretech.vn',
      };
      const resFull = calculateLegalCompletion(fullProfile);
      expect(resFull.completion).toBe(100);
      expect(resFull.missingFields).toHaveLength(0);
    });

    it('maps administrative verification statuses correctly across all 4 states', () => {
      expect(getStatusLabelKey('pending')).toBe('verification.status.pending');
      expect(getStatusLabelKey('reviewing')).toBe('verification.status.reviewing');
      expect(getStatusLabelKey('approved')).toBe('verification.status.approved');
      expect(getStatusLabelKey('rejected')).toBe('verification.status.rejected');
      expect(getStatusLabelKey(undefined)).toBe('verification.status.pending');

      expect(getStatusColor('approved')).toBe('success');
      expect(getStatusColor('reviewing')).toBe('warning');
      expect(getStatusColor('rejected')).toBe('error');
      expect(getStatusColor('pending')).toBe('info');
      expect(getStatusColor(undefined)).toBe('info');
    });

    it('integrates VerificationLegalProfileReviewCard in index.tsx for approved verification mode', () => {
      const pageSource = readFileSync(join(__dirname, '../index.tsx'), 'utf8');
      expect(pageSource).toContain('VerificationLegalProfileReviewCard');
      expect(pageSource).toContain('isEditing');
      expect(pageSource).toContain('handleCancelEdit');
    });

    it('implements confirmation dialog and re-verification warning in VerificationLegalProfileReviewCard', () => {
      const reviewSource = readFileSync(
        join(__dirname, '../components/VerificationLegalProfileReviewCard.tsx'),
        'utf8',
      );
      expect(reviewSource).toContain('confirmDialogOpen');
      expect(reviewSource).toContain('Thay đổi thông tin pháp lý?');
      expect(reviewSource).toContain('Lưu ý quan trọng');
      expect(reviewSource).toContain('Thông tin doanh nghiệp');
      expect(reviewSource).toContain('Tài liệu pháp lý doanh nghiệp');
    });

    it('supports isPreviouslyVerified warning and onCancel in VerificationLegalProfileForm', () => {
      const formSource = readFileSync(
        join(__dirname, '../components/VerificationLegalProfileForm.tsx'),
        'utf8',
      );
      expect(formSource).toContain('isPreviouslyVerified');
      expect(formSource).toContain('onCancel');
      expect(formSource).toContain('Lưu ý xác thực lại doanh nghiệp');
      expect(formSource).toContain('Hủy');
    });
  });
});
