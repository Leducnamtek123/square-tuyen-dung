import chatbotService from '../chatbotService';
import httpRequest from '../../utils/httpRequest';

jest.mock('../../utils/httpRequest', () => ({
  get: jest.fn(),
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

  it('fetches chatbot configuration', async () => {
    const config = {
      title: 'InfoHR AI',
      subtitle: 'Trợ lý tuyển dụng thông minh',
      employerGreeting: 'Chào bạn',
      employerSuggestions: ['Gợi ý 1', 'Gợi ý 2'],
    };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({ data: { data: config } });

    await expect(chatbotService.getChatbotConfig()).resolves.toEqual(config);
    expect(httpRequest.get).toHaveBeenCalledWith('ai/chatbot/config/');
  });
});
