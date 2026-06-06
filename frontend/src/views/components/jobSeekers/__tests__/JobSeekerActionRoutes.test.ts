import { readFileSync } from 'fs';
import { join } from 'path';

const readSource = (relativePath: string) => readFileSync(join(__dirname, '../../../../', relativePath), 'utf8');

const routeGuards = [
  {
    path: 'views/jobSeekerPages/ProfilePage/index.tsx',
    forbidden: ['href={`/${ROUTES.JOB_SEEKER.MY_COMPANY}`}'],
  },
  {
    path: 'views/components/jobSeekers/AppliedJobCard/index.tsx',
    forbidden: ['href={`/${ROUTES.JOB_SEEKER.JOBS}`}'],
  },
  {
    path: 'views/components/jobSeekers/SavedJobCard/index.tsx',
    forbidden: ['href={`/${ROUTES.JOB_SEEKER.JOBS}`}'],
  },
  {
    path: 'views/components/jobSeekers/CompanyFollowedCard/index.tsx',
    forbidden: ['href={`/${ROUTES.JOB_SEEKER.COMPANY}`}'],
  },
  {
    path: 'views/components/jobSeekers/JobApplicationCard/index.tsx',
    forbidden: ['push(`/${ROUTES.JOB_SEEKER.PROFILE}`)'],
  },
  {
    path: 'views/components/jobSeekers/SidebarViewTotal/index.tsx',
    forbidden: ['push(`/${ROUTES.JOB_SEEKER.JOBS}`)'],
  },
];

describe('job seeker action routes', () => {
  it.each(routeGuards)('$path uses localized route helpers', ({ path, forbidden }) => {
    const source = readSource(path);

    expect(source).toContain('localizeRoutePath');
    expect(source).toContain('i18n.language');
    forbidden.forEach((pattern) => {
      expect(source).not.toContain(pattern);
    });
  });
});
