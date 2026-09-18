import { normalizePaginatedResponse, unwrapDataResponse } from '../apiResponse';

describe('normalizePaginatedResponse', () => {
  it('normalizes double data envelopes when the inner data is a raw array', () => {
    const item = { id: 1, name: 'Option' };

    expect(normalizePaginatedResponse({ data: { count: 1, data: [item] } })).toEqual({
      count: 1,
      results: [item],
    });
  });

  it('preserves count when total items exceed current page results', () => {
    const item = { id: 1, name: 'Job' };

    expect(normalizePaginatedResponse({
      success: true,
      data: {
        count: 150,
        results: [item],
      },
    })).toEqual({
      count: 150,
      results: [item],
    });
  });

  it('preserves count when envelope contains data array instead of results', () => {
    const item = { id: 1, name: 'Job' };

    expect(normalizePaginatedResponse({
      data: {
        count: 85,
        data: [item],
      },
    })).toEqual({
      count: 85,
      results: [item],
    });
  });

  it('handles direct array responses gracefully', () => {
    const items = [{ id: 1 }, { id: 2 }];
    expect(normalizePaginatedResponse(items)).toEqual({
      count: 2,
      results: items,
    });
  });

  it('handles empty or invalid responses gracefully', () => {
    expect(normalizePaginatedResponse(null)).toEqual({ count: 0, results: [] });
    expect(normalizePaginatedResponse(undefined)).toEqual({ count: 0, results: [] });
    expect(normalizePaginatedResponse({})).toEqual({ count: 0, results: [] });
  });
});
