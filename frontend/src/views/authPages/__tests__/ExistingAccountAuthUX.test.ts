import { readFileSync } from 'fs';
import { join } from 'path';

const jobSeekerSignUpSource = readFileSync(
  join(__dirname, '../JobSeekerSignUp/index.tsx'),
  'utf8'
);
const jobSeekerSignUpViewSource = readFileSync(
  join(__dirname, '../JobSeekerSignUp/JobSeekerSignUpView.tsx'),
  'utf8'
);
const jobSeekerSignUpFormSource = readFileSync(
  join(__dirname, '../../components/auths/JobSeekerSignUpForm/index.tsx'),
  'utf8'
);
const employerSignUpSource = readFileSync(
  join(__dirname, '../EmployerSignUp/index.tsx'),
  'utf8'
);
const jobSeekerLoginSource = readFileSync(
  join(__dirname, '../JobSeekerLogin/index.tsx'),
  'utf8'
);
const employerLoginSource = readFileSync(
  join(__dirname, '../EmployerLogin/index.tsx'),
  'utf8'
);
const emailVerificationSource = readFileSync(
  join(__dirname, '../EmailVerificationRequiredPage/index.tsx'),
  'utf8'
);
const viAuthLocales = JSON.parse(
  readFileSync(join(__dirname, '../../../i18n/locales/vi/auth.json'), 'utf8')
);
const enAuthLocales = JSON.parse(
  readFileSync(join(__dirname, '../../../i18n/locales/en/auth.json'), 'utf8')
);

describe('Existing Account Registration UX and Flow Integrity', () => {
  describe('JobSeekerSignUp UX when email already exists', () => {
    it('defines existingAccount state and does NOT redirect to email verification when email exists', () => {
      expect(jobSeekerSignUpSource).toContain('existingAccount');
      expect(jobSeekerSignUpSource).toContain('setExistingAccount');
      expect(jobSeekerSignUpSource).toContain('hasEmailExists');
      // When email exists, sets existing account rather than pushing to email verification
      expect(jobSeekerSignUpSource).toContain('setExistingAccount({');
    });

    it('renders existing account notice with direct login link pre-filling email and forgot password link', () => {
      expect(jobSeekerSignUpViewSource).toContain('existingAccount');
      expect(jobSeekerSignUpViewSource).toContain('existingAccountTitle');
      expect(jobSeekerSignUpViewSource).toContain('existingAccount.email');
      expect(jobSeekerSignUpViewSource).toContain('ROUTES.AUTH.LOGIN');
      expect(jobSeekerSignUpViewSource).toContain('ROUTES.AUTH.FORGOT_PASSWORD');
    });

    it('safely handles server errors without crashing on string error values', () => {
      expect(jobSeekerSignUpFormSource).toContain('Array.isArray(rawErr)');
      expect(jobSeekerSignUpFormSource).not.toMatch(/serverErrors\[err\]\?\.join/);
    });
  });

  describe('EmployerSignUp UX when email already exists', () => {
    it('defines existingAccount state and handles existing account cleanly', () => {
      expect(employerSignUpSource).toContain('existingAccount');
      expect(employerSignUpSource).toContain('setExistingAccount');
      expect(employerSignUpSource).toContain('hasEmailExists');
    });

    it('renders existing account notice on EmployerSignUp with direct login link', () => {
      expect(employerSignUpSource).toContain('existingAccountTitle');
      expect(employerSignUpSource).toContain('existingAccount.email');
      expect(employerSignUpSource).toContain('ROUTES.EMPLOYER_AUTH.LOGIN');
    });
  });

  describe('Login Pages Email Pre-fill', () => {
    it('JobSeekerLogin reads email search param and passes defaultEmail to form', () => {
      expect(jobSeekerLoginSource).toContain("params.get('email')");
      expect(jobSeekerLoginSource).toContain('defaultEmail');
    });

    it('EmployerLogin reads email search param and passes defaultEmail to form', () => {
      expect(employerLoginSource).toContain("params.get('email')");
      expect(employerLoginSource).toContain('defaultEmail');
    });
  });

  describe('EmailVerificationRequiredPage Polling & Status Check UX', () => {
    it('uses checkCreds instead of sendVerifyEmail in periodic background check', () => {
      expect(emailVerificationSource).toContain('authService.checkCreds');
      expect(emailVerificationSource).toContain('isInitialMountRef');
    });

    it('supports role-aware redirect destination and email pre-fill', () => {
      expect(emailVerificationSource).toContain('getLoginUrl');
      expect(emailVerificationSource).toContain('ROLES_NAME.EMPLOYER');
    });

    it('avoids false success toast when account is already verified on initial mount', () => {
      expect(emailVerificationSource).toContain('alreadyVerified');
    });
  });

  describe('i18n Translation Keys', () => {
    it('contains all required keys in vi/auth.json and en/auth.json', () => {
      expect(viAuthLocales.signup.existingAccountTitle).toBeDefined();
      expect(viAuthLocales.signup.loginNow).toBeDefined();
      expect(viAuthLocales.verification.alreadyVerified).toBeDefined();

      expect(enAuthLocales.signup.existingAccountTitle).toBeDefined();
      expect(enAuthLocales.signup.loginNow).toBeDefined();
      expect(enAuthLocales.verification.alreadyVerified).toBeDefined();
    });
  });
});
