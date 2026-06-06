import { readFileSync } from 'fs';
import { join } from 'path';

const readSource = (relativePath: string) => readFileSync(join(__dirname, '../../../../', relativePath), 'utf8');

describe('job seeker profile route links', () => {
  it.each([
    'components/Features/ApplyForm/index.tsx',
    'components/Common/ProfileUploadCard/index.tsx',
    'views/components/jobSeekers/BoxProfile/index.tsx',
  ])('%s uses localized profile routes', (relativePath) => {
    const source = readSource(relativePath);

    expect(source).toContain('localizeRoutePath');
    expect(source).toContain('i18n.language');
    expect(source).not.toContain('push(`/${formatRoute(ROUTES.JOB_SEEKER.STEP_PROFILE');
    expect(source).not.toContain('push(`/${formatRoute(ROUTES.JOB_SEEKER.ATTACHED_PROFILE');
    expect(source).not.toContain('? `/${formatRoute(ROUTES.JOB_SEEKER.STEP_PROFILE');
    expect(source).not.toContain(': `/${formatRoute(ROUTES.JOB_SEEKER.ATTACHED_PROFILE');
  });
});
