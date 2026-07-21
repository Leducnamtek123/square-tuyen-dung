import chatbotService from '../chatbotService';
import httpRequest from '../../utils/httpRequest';

jest.mock('../../utils/httpRequest', () => ({
  post: jest.fn(),
}));

describe('chatbotService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('unwraps nested AI chat response envelopes', async () => {
    const response = {
      reply: 'Found matching information.',
      model: 'gemma4:e4b',
      source: 'primary',
    };
    (httpRequest.post as jest.Mock).mockResolvedValueOnce({ data: { data: response } });

    await expect(chatbotService.chat({ messages: [{ role: 'user', content: 'Hello' }] })).resolves.toEqual(response);
    expect(httpRequest.post).toHaveBeenCalledWith(
      'ai/chat/',
      { messages: [{ role: 'user', content: 'Hello' }] },
      { timeout: 120000 },
    );
  });
});
