import agentAssistantService from '../agentAssistantService';
import httpRequest from '../../utils/httpRequest';

jest.mock('../../utils/httpRequest', () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
}));

describe('agentAssistantService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sendMessage posts text and image attachments to the agent endpoint', async () => {
    (httpRequest.post as jest.Mock).mockResolvedValueOnce({ thread: { id: 12 } });
    const attachments = [
      {
        type: 'image' as const,
        name: 'candidate.png',
        mimeType: 'image/png',
        size: 8,
        dataUrl: 'data:image/png;base64,iVBORw0KGgo=',
      },
    ];

    await agentAssistantService.sendMessage(12, 'Phân tích ảnh này', attachments);

    expect(httpRequest.post).toHaveBeenCalledWith(
      'agent-assistants/threads/12/messages/',
      {
        content: 'Phân tích ảnh này',
        attachments,
      },
      { timeout: 120000 },
    );
  });
});
