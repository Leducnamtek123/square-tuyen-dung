import { readFileSync } from 'fs';
import { join } from 'path';

describe('SidebarProfile Component & User Greeting', () => {
  const filePath = join(__dirname, '../index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('retrieves currentUser from Redux store state', () => {
    expect(source).toContain('useAppSelector((state) => state.user)');
    expect(source).toContain('currentUser?.fullName');
  });

  it('renders custom image avatar when avatarUrl exists, otherwise letter avatar', () => {
    expect(source).toContain('currentUser?.avatarUrl');
    expect(source).toContain('MuiImageCustom');
    expect(source).toContain('currentUser?.fullName?.charAt(0)?.toUpperCase()');
  });

  it('displays welcomeBack greeting from auth i18n namespace', () => {
    expect(source).toContain("useTranslation('auth')");
    expect(source).toContain("t('account.welcomeBack')");
  });
});
