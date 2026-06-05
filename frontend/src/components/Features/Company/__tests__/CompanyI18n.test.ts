import { readFileSync } from 'fs';
import { join } from 'path';

const infoSource = readFileSync(join(__dirname, '../CompanyInfoSection.tsx'), 'utf8');
const followSource = readFileSync(join(__dirname, '../CompanyFollowButton.tsx'), 'utf8');

const fixedCompanyKeys = ['company.notUpdated', 'company.following', 'company.follow'];
const followToastKeys = ['companyDetail.followedSuccessfully', 'companyDetail.unfollowedSuccessfully'];

describe('Company feature i18n', () => {
  it('does not hide missing company labels with hard-coded fallback copy', () => {
    expect(infoSource).not.toMatch(/t\('company\.notUpdated',\s*['"]/);
    expect(followSource).not.toMatch(/t\('company\.following',\s*['"]/);
    expect(followSource).not.toMatch(/t\('company\.follow',\s*['"]/);

    fixedCompanyKeys.forEach((key) => {
      expect(`${infoSource}\n${followSource}`).toContain(`'${key}'`);
    });
  });

  it('uses public locale keys for follow and unfollow toast messages', () => {
    ['Followed successfully.', 'Unfollowed successfully.'].forEach((copy) => {
      expect(followSource).not.toContain(copy);
    });

    followToastKeys.forEach((key) => {
      expect(followSource).toContain(`'${key}'`);
    });
  });

  it('has Vietnamese and English locale entries for company follow copy', () => {
    const vi = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/vi/public.json'), 'utf8'));
    const en = JSON.parse(readFileSync(join(__dirname, '../../../../i18n/locales/en/public.json'), 'utf8'));

    fixedCompanyKeys.concat(followToastKeys).forEach((key) => {
      const readKey = (locale: Record<string, unknown>) => key.split('.').reduce<unknown>(
        (value, segment) => (value as Record<string, unknown> | undefined)?.[segment],
        locale
      );

      expect(readKey(vi)).toEqual(expect.any(String));
      expect(readKey(en)).toEqual(expect.any(String));
    });
  });
});
