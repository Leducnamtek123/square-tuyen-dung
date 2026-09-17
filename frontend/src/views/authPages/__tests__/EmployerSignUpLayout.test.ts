import { readFileSync } from 'fs';
import { join } from 'path';

const signUpSource = readFileSync(join(__dirname, '../EmployerSignUp/index.tsx'), 'utf8');
const loginSource = readFileSync(join(__dirname, '../EmployerLogin/index.tsx'), 'utf8');

describe('Employer Auth Layout (design-taste)', () => {
  it('includes promotional showcase panel on employer login and dedicated B2B showcase on registration', () => {
    expect(loginSource).toContain('AuthShowcasePanel');
    expect(loginSource).toContain('variant="employer"');
    expect(signUpSource).toContain('EmployerSignUpShowcase');
  });

  it('uses balanced 2-column layout with 1080px max-width', () => {
    expect(signUpSource).toContain('size={{ xs: 12, md: 6 }}');
    expect(signUpSource).toContain("maxWidth: '1080px'");
  });
});
