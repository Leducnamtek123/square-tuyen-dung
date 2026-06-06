import agentAssistantService from '../agentAssistantService';
import httpRequest from '../../utils/httpRequest';

jest.mock('../../utils/httpRequest', () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
}));

describe('agentAssistantService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
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

  it('normalizes nested tools, threads, and messages responses', async () => {
    const tool = { name: 'list_job_posts', displayName: 'List jobs' };
    const thread = { id: 1, title: 'Thread' };
    const message = { id: 2, role: 'assistant', content: 'Xin chao' };
    (httpRequest.get as jest.Mock)
      .mockResolvedValueOnce({ data: { tools: [tool] } })
      .mockResolvedValueOnce({ data: { threads: [thread] } })
      .mockResolvedValueOnce({ data: { messages: [message] } });

    await expect(agentAssistantService.getTools()).resolves.toEqual({ tools: [tool] });
    await expect(agentAssistantService.listThreads()).resolves.toEqual({ threads: [thread] });
    await expect(agentAssistantService.listMessages(1)).resolves.toEqual({ messages: [message] });
  });

  it('normalizes nested create thread responses', async () => {
    const thread = { id: 14, title: 'New thread', portal: 'employer' };
    (httpRequest.post as jest.Mock).mockResolvedValueOnce({ data: thread });

    await expect(agentAssistantService.createThread('employer')).resolves.toEqual(thread);
  });

  it('normalizes nested send message responses', async () => {
    const payload = {
      thread: { id: 12 },
      userMessage: { id: 20, role: 'user', content: 'Hi' },
      assistantMessage: { id: 21, role: 'assistant', content: 'Hello' },
      toolCalls: [],
    };
    (httpRequest.post as jest.Mock).mockResolvedValueOnce({ data: payload });

    await expect(agentAssistantService.sendMessage(12, 'Hi')).resolves.toEqual(payload);
  });
});
