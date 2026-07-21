import aiService from '../aiService';
import httpRequest from '../../utils/httpRequest';

jest.mock('../../utils/httpRequest', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe('aiService response contracts', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('unwraps nested screening result and health response envelopes', async () => {
    const screeningResult = {
      id: 12,
      status: 'completed',
      score: 82,
      summary: 'Strong match',
    };
    const health = {
      status: 'ready',
      checks: {
        llm: { status: 'online', latencyMs: 120 },
      },
    };
    (httpRequest.get as jest.Mock)
      .mockResolvedValueOnce({ data: { data: screeningResult } })
      .mockResolvedValueOnce({ data: { data: health } });

    await expect(aiService.getScreeningResult(12)).resolves.toEqual(screeningResult);
    await expect(aiService.getHealth()).resolves.toEqual(health);
  });

  it('unwraps nested transcribe response envelopes', async () => {
    const transcription = {
      transcription: 'Xin chao',
      text: 'Xin chao',
      language: 'vi',
      duration: 1.5,
    };
    (httpRequest.post as jest.Mock).mockResolvedValueOnce({
      data: { data: transcription },
    });

    const file = new Blob(['audio'], { type: 'audio/wav' }) as File;

    await expect(aiService.transcribe(file, { language: 'vi' })).resolves.toEqual(transcription);
    expect(httpRequest.post).toHaveBeenCalledWith('ai/transcribe/', expect.any(FormData), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  });
});
