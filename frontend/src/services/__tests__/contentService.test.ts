import httpRequest from '../../utils/httpRequest';
import contentService from '../contentService';

jest.mock('../../utils/httpRequest', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe('contentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes nested data.results feedback list responses', async () => {
    const feedback = { id: 4, content: 'Great hiring experience', rating: 5 };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({
      data: { results: [feedback] },
    });

    const result = await contentService.getFeedbacks();

    expect(httpRequest.get).toHaveBeenCalledWith('content/web/feedbacks/');
    expect(result).toEqual([feedback]);
  });
});
