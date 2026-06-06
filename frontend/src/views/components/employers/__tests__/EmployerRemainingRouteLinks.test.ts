import { readFileSync } from 'fs';
import { join } from 'path';

const readSource = (relativePath: string) => readFileSync(join(__dirname, '../../../../', relativePath), 'utf8');

const routeGuards = [
  {
    path: 'views/employerPages/VerificationPage/components/VerificationIntroCard.tsx',
    forbidden: ['push(`/${ROUTES.EMPLOYER.COMPANY}`)'],
  },
  {
    path: 'views/employerPages/InterviewPages/InterviewHistoryPage.tsx',
    forbidden: ['href={`/${ROUTES.EMPLOYER.INTERVIEW_DETAIL'],
  },
  {
    path: 'views/components/employers/InterviewListCard/index.tsx',
    forbidden: ['href={`/${ROUTES.EMPLOYER.INTERVIEW_CREATE}`}'],
  },
  {
    path: 'views/components/employers/JobPostCard/index.tsx',
    forbidden: ['href={`/${ROUTES.EMPLOYER.VERIFICATION}`}'],
  },
  {
    path: 'views/components/employers/InterviewCreateCard/index.tsx',
    forbidden: ['push(`/${ROUTES.EMPLOYER.INTERVIEW_LIST}`)'],
  },
];

describe('remaining employer route links', () => {
  it.each(routeGuards)('$path uses localized employer routes', ({ path, forbidden }) => {
    const source = readSource(path);

    expect(source).toContain('localizeRoutePath');
    expect(source).toContain('i18n.language');
    forbidden.forEach((pattern) => {
      expect(source).not.toContain(pattern);
    });
  });
});
