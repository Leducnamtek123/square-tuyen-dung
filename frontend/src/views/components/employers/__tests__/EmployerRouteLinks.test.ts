import { readFileSync } from 'fs';
import { join } from 'path';

const readSource = (relativePath: string) => readFileSync(join(__dirname, '..', relativePath), 'utf8');
const readFeature = (relativePath: string) => readFileSync(join(__dirname, '../../../../components/Features', relativePath), 'utf8');

describe('employer route links', () => {
  it.each([
    'AppliedResumeTable/index.tsx',
    'AppliedResumeKanban/index.tsx',
    'SavedResumeTable/index.tsx',
    'InterviewListCard/useInterviewListCardColumns.tsx',
  ])('%s localizes employer routes', (relativePath) => {
    const source = readSource(relativePath);

    expect(source).toContain('localizeRoutePath');
    expect(source).toContain('i18n.language');
    expect(source).not.toContain('push(`/${formatRoute(ROUTES.EMPLOYER');
    expect(source).not.toContain('href={`/${formatRoute(ROUTES.EMPLOYER');
    expect(source).not.toContain('push(`/${ROUTES.EMPLOYER.INTERVIEW_LIST}/create');
  });

  it('localizes employer profile navigation in the job seeker profile card', () => {
    const source = readFeature('JobSeekerProfile/index.tsx');

    expect(source).toContain('localizeRoutePath');
    expect(source).toContain('i18n.language');
    expect(source).not.toContain('push(`/${formatRoute(ROUTES.EMPLOYER.PROFILE_DETAIL');
  });
});
