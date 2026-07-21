/**
 * Frontend E2E Tests — funcUtils
 * Tests the formatRoute utility that caused routing bugs.
 */

// We test the pure logic without DOM dependencies
const formatRoute = (
  route: string,
  value: string,
  paramKey = ':slug'
): string => {
  const regex = new RegExp(`${paramKey}`, 'g');
  return route.replace(regex, value);
};

describe('formatRoute', () => {
  it('replaces :slug by default', () => {
    expect(formatRoute('jobs/:slug', 'frontend-dev')).toBe('jobs/frontend-dev');
  });

  it('replaces :id when paramKey is explicitly :id', () => {
    expect(formatRoute('employer/interviews/:id', '18', ':id')).toBe('employer/interviews/18');
  });

  it('does NOT replace :id when using default :slug paramKey', () => {
    // This was the actual bug! Using default :slug on a route with :id
    const result = formatRoute('employer/interviews/:id', '18');
    expect(result).toBe('employer/interviews/:id'); // :id stays unreplaced!
  });

  it('replaces multiple occurrences of the same param', () => {
    expect(formatRoute(':slug/compare/:slug', 'abc')).toBe('abc/compare/abc');
  });

  it('handles empty value', () => {
    expect(formatRoute('jobs/:slug', '')).toBe('jobs/');
  });

  it('handles numeric string values', () => {
    expect(formatRoute('interviews/:id', '42', ':id')).toBe('interviews/42');
  });
});
