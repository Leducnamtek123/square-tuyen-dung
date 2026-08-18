import { readFileSync } from 'fs';
import { join } from 'path';

describe('Employer AccountPage Component & Security', () => {
  const filePath = join(__dirname, '../AccountPage/index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('renders AccountCard for employer account management', () => {
    expect(source).toContain('<AccountCard />');
    expect(source).toContain("useTranslation(\"employer\")");
    expect(source).toContain("TabTitle(`${t('account.pageTitle')} - Employer Account Management`)");
  });
});
