import { readFileSync } from 'fs';
import { join } from 'path';

describe('NotFoundPage Design Taste & A11y Audit Tests', () => {
  const notFoundSource = readFileSync(join(__dirname, '../NotFoundPage/index.tsx'), 'utf8');

  it('renders semantic landmarks and main heading correctly without heading skipping', () => {
    // Semantic main role
    expect(notFoundSource).toContain('component="main"');
    expect(notFoundSource).toContain('role="main"');
    // Main heading is h1
    expect(notFoundSource).toContain('variant="h1"');
    // Section heading is h2
    expect(notFoundSource).toContain('variant="h2"');
    // Card headings are h3
    expect(notFoundSource).toContain('component="h3"');
  });

  it('provides accessible form inputs with screen-reader labels and search role', () => {
    expect(notFoundSource).toContain('role="search"');
    expect(notFoundSource).toContain('htmlFor="not-found-search-input"');
    expect(notFoundSource).toContain('id="not-found-search-input"');
    expect(notFoundSource).toContain('aria-label');
  });

  it('supports full keyboard navigation and accessible link semantics on destination cards', () => {
    expect(notFoundSource).toContain('tabIndex={0}');
    expect(notFoundSource).toContain('role="link"');
    expect(notFoundSource).toContain('onKeyDown');
    expect(notFoundSource).toContain('&:focus-visible');
  });

  it('detects portal context (Employer vs Job Seeker vs Admin) for smart contextual routing', () => {
    expect(notFoundSource).toContain('isEmployer');
    expect(notFoundSource).toContain('isAdmin');
    expect(notFoundSource).toContain('employerCandidatesTitle');
    expect(notFoundSource).toContain('employerJobPostsTitle');
  });

  it('respects prefers-reduced-motion for all CSS animations and transitions', () => {
    expect(notFoundSource).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
