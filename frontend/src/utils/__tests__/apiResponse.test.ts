import { normalizePaginatedResponse } from '../apiResponse';

describe('normalizePaginatedResponse', () => {
  it('normalizes double data envelopes when the inner data is a raw array', () => {
    const item = { id: 1, name: 'Option' };

    expect(normalizePaginatedResponse({ data: { count: 1, data: [item] } })).toEqual({
      count: 1,
      results: [item],
    });
  });
});
