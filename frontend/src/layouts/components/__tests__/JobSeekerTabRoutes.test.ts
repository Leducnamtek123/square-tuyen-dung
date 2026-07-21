import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../jobSeekers/TabBar/index.tsx'), 'utf8');

describe('job seeker tab routes', () => {
  it('localizes job seeker portal tab routes with the current language', () => {
    expect(source).toContain('localizeRoutePath');
    expect(source).toContain('i18n.language');
    expect(source).not.toContain('path: `/${ROUTES.JOB_SEEKER.DASHBOARD}`');
    expect(source).not.toContain('path: `/${ROUTES.JOB_SEEKER.PROFILE}`');
    expect(source).not.toContain('path: `/${ROUTES.JOB_SEEKER.MY_JOB}`');
    expect(source).not.toContain('path: `/${ROUTES.JOB_SEEKER.MY_COMPANY}`');
    expect(source).not.toContain('path: `/${ROUTES.JOB_SEEKER.MY_INTERVIEWS}`');
    expect(source).not.toContain('path: `/${ROUTES.JOB_SEEKER.NOTIFICATION}`');
    expect(source).not.toContain('path: `/${ROUTES.JOB_SEEKER.ACCOUNT}`');
  });
});
