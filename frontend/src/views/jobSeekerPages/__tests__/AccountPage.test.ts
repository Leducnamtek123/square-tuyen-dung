import { readFileSync } from 'fs';
import { join } from 'path';

describe('JobSeeker AccountPage Security & Preferences', () => {
  const filePath = join(__dirname, '../AccountPage/index.tsx');
  const source = readFileSync(filePath, 'utf8');
  const vi = JSON.parse(readFileSync(join(__dirname, '../../../../src/i18n/locales/vi/jobSeeker.json'), 'utf8'));
  const en = JSON.parse(readFileSync(join(__dirname, '../../../../src/i18n/locales/en/jobSeeker.json'), 'utf8'));

  it('manages 3 core account sections: Security, Notifications, and Preferences/Logout', () => {
    expect(source).toContain('Card');
    expect(source).toContain('handleOpenEmailDialog');
    expect(source).toContain('handleOpenPhoneDialog');
    expect(source).toContain('handleOpenPasswordDialog');
    expect(source).toContain('handleToggleEmailNotify');
    expect(source).toContain('handleToggleSmsNotify');
    expect(source).toContain('handleToggleJobAlertNotify');
    expect(source).toContain('handleSaveLanguage');
    expect(source).toContain('handleConfirmLogout');
  });

  it('persists notification preferences in localStorage', () => {
    expect(source).toContain("localStorage.getItem('sq_notify_email')");
    expect(source).toContain("localStorage.getItem('sq_notify_sms')");
    expect(source).toContain("localStorage.getItem('sq_notify_jobs')");
  });

  it('validates password update with minimum length 6 and confirmation check', () => {
    expect(source).toContain('newPassword.length < 6');
    expect(source).toContain('newPassword !== confirmPassword');
  });

  it('clears auth token and calls Redux removeUserInfo upon logout', () => {
    expect(source).toContain('tokenService.removeAccessTokenAndRefreshTokenFromCookie');
    expect(source).toContain('removeUserInfo');
    expect(source).toContain("window.location.replace('/login')");
  });

  it('has comprehensive bilingual keys in account namespace', () => {
    const requiredKeys = [
      'security',
      'email',
      'phone',
      'password',
      'changePassword',
      'notifications',
      'emailNotify',
      'smsNotify',
      'jobAlertNotify',
      'other',
      'language',
      'logout',
      'updateEmailTitle',
      'newEmail',
      'updatePhoneTitle',
      'newPhone',
      'changePasswordTitle',
      'currentPassword',
      'newPassword',
      'confirmNewPassword',
      'selectLanguageTitle',
      'logoutTitle',
      'logoutConfirm',
      'logoutBtn',
      'verified',
      'notUpdated',
      'vietnameseLang',
      'englishLang',
      'saveChanges',
      'applyLang',
      'cancel',
    ];

    requiredKeys.forEach((key) => {
      expect(vi.account[key]).toBeDefined();
      expect(en.account[key]).toBeDefined();
    });
  });
});
