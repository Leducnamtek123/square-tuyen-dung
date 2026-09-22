import {
  formatDate,
  formatDateTime,
  formatDateDivider,
  formatDateForApi,
  formatMessageDate,
  formatMessageTime,
  formatTime,
  formatTimer,
} from '../dateHelper';
import {
  convertMoney,
  formatLocalizedMoney,
  formatLocalizedSalaryRange,
  salaryString,
  default as toSlug,
} from '../customData';
import { formatRoute } from '../funcUtils';
import {
  formatNationalPhoneInput,
  getPhoneInputStateFromValue,
  toE164PhoneNumber,
} from '../../views/components/auths/PhoneOTPLoginForm/phoneNumberUtils';
import {
  getApiErrorMessage,
  normalizePaginatedResponse,
  unwrapDataResponse,
} from '../apiResponse';
import {
  convertEditorStateToHTMLString,
  createEditorStateFromHTMLString,
} from '../editorUtils';
import sanitizeHtml from '../sanitizeHtml';

describe('Frontend Edge Case Resilience: Utility Handlers', () => {
  describe('dateHelper Edge Cases', () => {
    it('handles null, undefined, NaN, and invalid strings gracefully without runtime crashes', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
      expect(formatDate('invalid-date-string')).toBe('');
      expect(formatDate('not-a-date')).toBe('');

      expect(formatDateTime(null)).toBe('');
      expect(formatDateTime(undefined)).toBe('');
      expect(formatDateTime('not-a-valid-date')).toBe('');

      expect(formatDateDivider(null)).toBe('');
      expect(formatDateDivider(undefined)).toBe('');
      expect(formatDateDivider('garbage-value')).toBe('');

      expect(formatMessageTime(null)).toBe('');
      expect(formatMessageTime(undefined)).toBe('');
      expect(formatMessageTime('corrupted-timestamp')).toBe('');

      expect(formatMessageDate(null)).toBe('');
      expect(formatMessageDate(undefined)).toBe('');
      expect(formatMessageDate('invalid-date')).toBe('');

      expect(formatTime(null)).toBe('');
      expect(formatTime(undefined)).toBe('');
      expect(formatTime(NaN)).toBe('');
      expect(formatTime('invalid-time')).toBe('');

      expect(formatDateForApi(null)).toBeNull();
      expect(formatDateForApi(undefined)).toBeUndefined();
      expect(formatDateForApi('invalid-date')).toBeUndefined();
    });

    it('formatTimer handles NaN, negative numbers, undefined, and boundary seconds', () => {
      expect(formatTimer(NaN)).toBe('00:00');
      expect(formatTimer(-10)).toBe('00:00');
      expect(formatTimer(-1)).toBe('00:00');
      expect(formatTimer(undefined as unknown as number)).toBe('00:00');
      expect(formatTimer(0)).toBe('00:00');
      expect(formatTimer(59)).toBe('00:59');
      expect(formatTimer(60)).toBe('01:00');
      expect(formatTimer(3661)).toBe('61:01');
    });

    it('formats valid dates and times correctly', () => {
      const sample = '2026-06-15T10:30:00Z';
      expect(formatDate(sample, 'YYYY-MM-DD')).toBe('2026-06-15');
      expect(formatDateForApi(sample)).toBe('2026-06-15');
    });
  });

  describe('customData & Salary Edge Cases', () => {
    it('convertMoney handles zero, negative numbers, NaN, and large boundaries', () => {
      expect(convertMoney(0)).toBe('0');
      expect(convertMoney(-5000000)).toBe('0');
      expect(convertMoney(NaN)).toBe('0');
      expect(convertMoney(null as unknown as number)).toBe('0');
      expect(convertMoney(undefined as unknown as number)).toBe('0');

      expect(convertMoney(500000)).toBe('500000');
      expect(convertMoney(1500000)).toBe('1 tr');
      expect(convertMoney(2000000000)).toBe('2 tỷ');
    });

    it('salaryString handles negative, NaN, null, and partial values safely', () => {
      expect(salaryString(null, null)).toBe('---');
      expect(salaryString(undefined, undefined)).toBe('---');
      expect(salaryString(-100, -200)).toBe('---');
      expect(salaryString(NaN, NaN)).toBe('---');
      expect(salaryString(10000000, null)).toBe('10 tr - ?');
      expect(salaryString(null, 25000000)).toBe('? - 25 tr');
      expect(salaryString(15000000, 30000000)).toBe('15 tr - 30 tr');
    });

    it('formatLocalizedSalaryRange handles invalid inputs gracefully', () => {
      expect(formatLocalizedSalaryRange(null, null)).toBe('---');
      expect(formatLocalizedSalaryRange(undefined, undefined)).toBe('---');
      expect(formatLocalizedSalaryRange(-500, -1000)).toBe('---');
      expect(formatLocalizedSalaryRange(NaN, NaN)).toBe('---');
      expect(formatLocalizedSalaryRange('invalid', 'garbage')).toBe('---');
      expect(formatLocalizedMoney(null)).toBe('---');
      expect(formatLocalizedMoney(NaN)).toBe('---');
    });

    it('toSlug handles non-strings, null, undefined, empty, and unicode without throwing', () => {
      expect(toSlug(undefined)).toBe('');
      expect(toSlug(null as unknown as string)).toBe('');
      expect(toSlug(12345 as unknown as string)).toBe('');
      expect(toSlug({} as unknown as string)).toBe('');
      expect(toSlug('')).toBe('');
      expect(toSlug('   ---   ')).toBe('');
      expect(toSlug('Lập Trình Viên Frontend Next.js & React 2026')).toBe('lap-trinh-vien-frontend-nextjs-react-2026');
      expect(toSlug('Đặc Biệt: C# / C++ & Node.js!')).toBe('dac-biet-c-c-nodejs');
    });
  });

  describe('funcUtils formatRoute Edge Cases', () => {
    it('handles non-string routes and null/undefined values safely', () => {
      expect(formatRoute(null as unknown as string, 'val')).toBe('');
      expect(formatRoute(undefined as unknown as string, 'val')).toBe('');
      expect(formatRoute('/jobs/:slug', null as unknown as string)).toBe('/jobs/');
      expect(formatRoute('/jobs/:slug', undefined as unknown as string)).toBe('/jobs/');
      expect(formatRoute('/jobs/:id', '123', ':id')).toContain('123');
    });
  });

  describe('phoneNumberUtils Edge Cases', () => {
    it('handles non-string, null, undefined, and garbage input gracefully', () => {
      expect(formatNationalPhoneInput(null as unknown as string, 'VN')).toBe('');
      expect(formatNationalPhoneInput(undefined as unknown as string, 'VN')).toBe('');
      expect(formatNationalPhoneInput(123456 as unknown as string, 'VN')).toBe('');
      expect(formatNationalPhoneInput('invalid-text', 'VN')).toBe('');
      expect(formatNationalPhoneInput('+', 'VN')).toBe('+');

      const stateNull = getPhoneInputStateFromValue(null as unknown as string, 'VN');
      expect(stateNull.phoneNumber).toBe('');
      expect(stateNull.countryCode).toBe('VN');

      expect(toE164PhoneNumber(null as unknown as string, 'VN')).toBeNull();
      expect(toE164PhoneNumber(undefined as unknown as string, 'VN')).toBeNull();
      expect(toE164PhoneNumber('invalid-phone', 'VN')).toBeNull();
      expect(toE164PhoneNumber('123', 'VN')).toBeNull();
    });

    it('correctly parses and formats valid phone numbers', () => {
      const e164 = toE164PhoneNumber('0912345678', 'VN');
      expect(e164).toBe('+84912345678');
    });
  });

  describe('apiResponse Resilience & Safe Error Parsing', () => {
    it('unwrapDataResponse handles null, primitive, nested envelopes, and empty objects', () => {
      expect(unwrapDataResponse(null)).toBeNull();
      expect(unwrapDataResponse(undefined)).toBeUndefined();
      expect(unwrapDataResponse('text-data')).toBe('text-data');
      expect(unwrapDataResponse({ data: { data: { id: 1 } } })).toEqual({ id: 1 });
      expect(unwrapDataResponse({ data: [1, 2, 3] })).toEqual([1, 2, 3]);
    });

    it('normalizePaginatedResponse handles null, empty array, nested structures without crashing', () => {
      expect(normalizePaginatedResponse(null)).toEqual({ count: 0, results: [] });
      expect(normalizePaginatedResponse(undefined)).toEqual({ count: 0, results: [] });
      expect(normalizePaginatedResponse([])).toEqual({ count: 0, results: [] });
      expect(normalizePaginatedResponse([1, 2])).toEqual({ count: 2, results: [1, 2] });
      expect(normalizePaginatedResponse({ count: 5, results: [1, 2, 3, 4, 5] })).toEqual({
        count: 5,
        results: [1, 2, 3, 4, 5],
      });
      expect(normalizePaginatedResponse({ data: [10, 20] })).toEqual({
        count: 2,
        results: [10, 20],
      });
    });

    it('getApiErrorMessage ALWAYS returns a string and NEVER returns an object or array', () => {
      const fallback = 'Fallback Error';

      // 1. Primitive error
      expect(getApiErrorMessage(null, fallback)).toBe(fallback);
      expect(getApiErrorMessage(undefined, fallback)).toBe(fallback);
      expect(getApiErrorMessage('string error', fallback)).toBe(fallback);

      // 2. Error with string detail
      const errWithDetail = { response: { data: { detail: 'Specific server error' } } };
      expect(getApiErrorMessage(errWithDetail, fallback)).toBe('Specific server error');

      // 3. Error where detail is an OBJECT (e.g. Django validation dict)
      const errWithObjectDetail = {
        response: { data: { detail: { field: ['is required', 'must be unique'] } } },
      };
      const resultObj = getApiErrorMessage(errWithObjectDetail, fallback);
      expect(typeof resultObj).toBe('string');
      expect(resultObj).toContain('is required');

      // 4. Error where message is nested
      const errWithNestedMsg = {
        response: { data: { error: { message: 'Nested error occurred' } } },
      };
      expect(getApiErrorMessage(errWithNestedMsg, fallback)).toBe('Nested error occurred');

      // 5. Standard Error instance
      const errStandard = new Error('Standard JS Error message');
      expect(getApiErrorMessage(errStandard, fallback)).toBe('Standard JS Error message');
    });
  });

  describe('editorUtils Draft.js Edge Cases', () => {
    it('createEditorStateFromHTMLString handles null, undefined, non-strings, and malformed HTML', () => {
      const emptyState1 = createEditorStateFromHTMLString(null);
      expect(emptyState1.getCurrentContent().hasText()).toBe(false);

      const emptyState2 = createEditorStateFromHTMLString(undefined);
      expect(emptyState2.getCurrentContent().hasText()).toBe(false);

      const emptyState3 = createEditorStateFromHTMLString(12345 as unknown as string);
      expect(emptyState3.getCurrentContent().hasText()).toBe(false);

      const emptyState4 = createEditorStateFromHTMLString('');
      expect(emptyState4.getCurrentContent().hasText()).toBe(false);

      // Malformed HTML
      const malformedState = createEditorStateFromHTMLString('<div><p>Unclosed paragraph');
      expect(malformedState).toBeDefined();
    });

    it('convertEditorStateToHTMLString handles null, plain string, corrupted objects', () => {
      expect(convertEditorStateToHTMLString(null)).toBe('');
      expect(convertEditorStateToHTMLString(undefined)).toBe('');
      expect(convertEditorStateToHTMLString('pre-existing html')).toBe('pre-existing html');
      expect(convertEditorStateToHTMLString({} as unknown as any)).toBe('');
      expect(convertEditorStateToHTMLString({ getCurrentContent: null } as unknown as any)).toBe('');
    });
  });

  describe('sanitizeHtml Security & Boundary Tests', () => {
    it('returns empty string for null, undefined, and non-string inputs', () => {
      expect(sanitizeHtml(null)).toBe('');
      expect(sanitizeHtml(undefined)).toBe('');
      expect(sanitizeHtml(12345 as unknown as string)).toBe('');
      expect(sanitizeHtml({} as unknown as string)).toBe('');
    });

    it('strips script tags, onerror, and javascript: protocols', () => {
      const malicious = '<p>Normal text</p><script>alert("xss")</script><img src="x" onerror="alert(1)">';
      const clean = sanitizeHtml(malicious);
      expect(clean).not.toContain('<script');
      expect(clean).not.toContain('onerror');
      expect(clean).toContain('Normal text');
    });

    it('strips dangerous iframe and javascript links', () => {
      const malicious = '<iframe src="javascript:alert(1)"></iframe><a href="javascript:stealCookie()">Click me</a>';
      const clean = sanitizeHtml(malicious);
      expect(clean).not.toContain('<iframe');
      expect(clean).not.toContain('javascript:stealCookie()');
    });

    it('handles super long strings (>10,000 characters) without hanging or crashing', () => {
      const hugeSafeString = `<p>${'A'.repeat(15000)}</p>`;
      const cleaned = sanitizeHtml(hugeSafeString);
      expect(cleaned).toContain('AAAA');
      expect(cleaned.length).toBeGreaterThan(15000);
    });
  });
});
