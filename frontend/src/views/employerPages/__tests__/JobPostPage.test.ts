import { readFileSync } from 'fs';
import { join } from 'path';

describe('Employer JobPostPage Component & Architecture', () => {
  const filePath = join(__dirname, '../JobPostPage/index.tsx');
  const source = readFileSync(filePath, 'utf8');

  it('renders JobPostCard and sets translated tab title', () => {
    expect(source).toContain('<JobPostCard />');
    expect(source).toContain("useTranslation('employer')");
    expect(source).toContain("TabTitle(`${t('jobPost.title')} - ${APP_NAME}`)");
  });
});
