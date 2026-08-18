import { readFileSync } from 'fs';
import { join } from 'path';

describe('Employer SettingPage Component & System Configurations', () => {
  const filePath = join(__dirname, '../SettingPage/index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('renders SettingCard for employer recruitment configurations', () => {
    expect(source).toContain('<SettingCard />');
    expect(source).toContain("useTranslation(\"employer\")");
    expect(source).toContain("TabTitle(`${t('setting.title')} - Square HR`)");
  });
});
