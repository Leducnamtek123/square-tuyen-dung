import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../EmployerSectionClient.tsx'), 'utf8');

describe('EmployerSectionClient auth guard', () => {
  it('redirects to login when protected employer access cannot verify the user', () => {
    expect(source).toMatch(
      /try \{\s*user = await dispatch\(getUserInfo\(\)\)\.unwrap\(\);\s*\} catch \{\s*window\.location\.replace\(loginPath\);\s*return;\s*\}/s
    );
  });
});
