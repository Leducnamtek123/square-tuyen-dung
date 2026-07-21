import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const source = readFileSync(join(__dirname, '../ProfilesPage/index.tsx'), 'utf8');

describe('ProfilesPage i18n and routing', () => {
  it('uses the localized admin profile detail route', () => {
    expect(source).toContain('ROUTES.ADMIN.PROFILE_DETAIL');
    expect(source).toContain('formatRoute(ROUTES.ADMIN.PROFILE_DETAIL');
    expect(source).not.toContain("href={`/profiles/${profile.id}`}");
  });

  it('uses locale keys for import dialog copy', () => {
    expect(source).toContain("pages.profiles.import.openButton");
    expect(source).toContain("pages.profiles.import.dialogTitle");
    expect(source).toContain("pages.profiles.import.sourceUrlLabel");
    expect(source).toContain("pages.profiles.import.accountLabel");
    expect(source).toContain("pages.profiles.import.passwordLabel");
    expect(source).toContain("pages.profiles.import.careerLabel");
    expect(source).toContain("pages.profiles.import.careerPlaceholder");
    expect(source).toContain("pages.profiles.import.confirm");
  });
});
