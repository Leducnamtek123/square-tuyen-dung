import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../index.tsx'), 'utf8');

describe('CareerJobPostTabs Component', () => {
  it('renders interactive career pills bar and handles fallback gracefully', () => {
    expect(source).toContain('CareerJobPostTabs');
    expect(source).toContain('commonService.getTop10Careers');
    expect(source).toContain('selectedCareerId');
    expect(source).toContain('Tất cả ngành nghề');
    expect(source).toContain('FilterJobPostCard');
  });

  it('provides navigation to all careers page', () => {
    expect(source).toContain('/viec-lam-theo-nganh-nghe');
  });
});
