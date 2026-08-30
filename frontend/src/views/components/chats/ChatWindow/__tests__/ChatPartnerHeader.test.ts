import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../ChatPartnerHeader.tsx'), 'utf8');

describe('ChatPartnerHeader Component', () => {
  it('imports necessary MUI components and translation hooks', () => {
    expect(source).toContain("useTranslation('chat')");
    expect(source).toContain('Avatar');
    expect(source).toContain('Badge');
    expect(source).toContain('ChatPartnerHeader');
  });

  it('provides role badges for employer and candidate', () => {
    expect(source).toContain('employerBadge');
    expect(source).toContain('candidateBadge');
  });

  it('supports onBack callback for mobile responsiveness', () => {
    expect(source).toContain('onBack');
    expect(source).toContain('ArrowBackIcon');
  });
});
