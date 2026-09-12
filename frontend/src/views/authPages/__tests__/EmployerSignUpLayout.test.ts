import { readFileSync } from 'fs';
import { join } from 'path';

const signUpSource = readFileSync(join(__dirname, '../EmployerSignUp/index.tsx'), 'utf8');
const loginSource = readFileSync(join(__dirname, '../EmployerLogin/index.tsx'), 'utf8');

describe('Employer Auth Layout Variance (design-taste)', () => {
  it('keeps the promotional showcase panel on employer login page', () => {
    expect(loginSource).toContain('AuthShowcasePanel');
    expect(loginSource).toContain('variant="employer"');
  });

  it('removes the showcase panel from employer registration page to maximize spaciousness', () => {
    expect(signUpSource).not.toContain('AuthShowcasePanel');
  });

  it('uses full-width 12-column container for registration form', () => {
    expect(signUpSource).toContain('size={{ xs: 12 }}');
    expect(signUpSource).toContain("maxWidth: '780px'");
  });
});
