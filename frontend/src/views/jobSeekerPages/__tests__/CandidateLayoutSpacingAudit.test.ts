import { readFileSync } from 'fs';
import { join } from 'path';

describe('Candidate Portal Top Spacing & Layout Alignment Audit', () => {
  it('verifies MyInterviewsPage root Box has width 100% and no duplicate vertical padding or maxWidth constraint', () => {
    const filePath = join(__dirname, '../MyInterviewsPage/index.tsx');
    const source = readFileSync(filePath, 'utf8');

    expect(source).toContain("<Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>");
    expect(source).not.toContain('maxWidth: 1120');
    expect(source).not.toContain('py: { xs: 2, md: 3 }');
  });

  it('verifies OnlineProfilePage root Box has width 100% and no duplicate vertical padding', () => {
    const filePath = join(__dirname, '../OnlineProfilePage/index.tsx');
    const source = readFileSync(filePath, 'utf8');

    expect(source).toContain("<Box sx={{ width: '100%' }}>");
    expect(source).not.toContain('py: 2');
  });

  it('verifies AttachedProfilePage root Box standardizes vertical padding to design system', () => {
    const filePath = join(__dirname, '../AttachedProfilePage/index.tsx');
    const source = readFileSync(filePath, 'utf8');

    expect(source).toContain("<Box sx={{ width: '100%', py: { xs: 1.5, md: 3 } }}>");
  });

  it('verifies (candidate)/ung-vien/quan-ly-cv does not nest DefaultLayout inside JobSeekerLayout', () => {
    const filePath = join(__dirname, '../../../app/(candidate)/ung-vien/quan-ly-cv/page.tsx');
    const source = readFileSync(filePath, 'utf8');

    expect(source).not.toContain('<DefaultLayout>');
    expect(source).not.toContain('import DefaultLayout');
    expect(source).toContain('return <CandidateCVListPage />;');
  });

  it('verifies JobSeekerLayout has unified top spacing container for sidebar and content', () => {
    const filePath = join(__dirname, '../../../layouts/JobSeekerLayout/index.tsx');
    const source = readFileSync(filePath, 'utf8');

    expect(source).toContain('<Box component="main" sx={{ flexGrow: 1, py: { xs: 1, sm: 2, md: 3 } }}>');
    expect(source).toContain('<CandidateSidebar />');
    expect(source).toContain('<SpaContentTransition>');
  });
});
