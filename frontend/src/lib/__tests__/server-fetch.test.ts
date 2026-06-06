import { serverFetch } from '../server-fetch';

describe('serverFetch', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('unwraps successful response envelopes even when data is null', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: null,
        error: null,
      }),
    });

    const response = await serverFetch('/empty-success-endpoint');

    expect(response).toBeNull();
  });
});
