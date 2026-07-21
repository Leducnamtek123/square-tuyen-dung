import { readFileSync } from 'fs';
import { join } from 'path';

const readSource = (relativePath: string) => readFileSync(join(__dirname, '../../../../', relativePath), 'utf8');

const routeGuards = [
  'components/Features/AppIntroductionCard/index.tsx',
  'components/Common/Controls/InputBaseSearchHomeCustom/index.tsx',
  'views/components/defaults/HomeSearch/index.tsx',
];

describe('public search route shortcuts', () => {
  it.each(routeGuards)('%s uses localized jobs route', (relativePath) => {
    const source = readSource(relativePath);

    expect(source).toContain('localizeRoutePath');
    expect(source).toContain('i18n.language');
    expect(source).not.toContain('push(`/${ROUTES.JOB_SEEKER.JOBS}`)');
    expect(source).not.toContain('onClick={() => push(`/${ROUTES.JOB_SEEKER.JOBS}`)}');
  });
});
