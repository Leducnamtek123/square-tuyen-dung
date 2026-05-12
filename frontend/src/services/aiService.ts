import httpRequest from '../utils/httpRequest';

interface TTSPayload {
  text: string;
  voice?: string;
  speed?: number;
  format?: 'mp3' | 'wav';
}

interface TranscribeParams {
  model?: string;
  language?: string;
}

type TranscribeResponse = {
  transcription?: string;
  text?: string;
  language?: string;
  duration?: number;
};

type ScreeningResult = {
  id?: number | string;
  status?: string;
  score?: number;
  summary?: string;
};

export type AIServiceStatus = 'online' | 'offline' | 'not_configured';

export type AIHealthResponse = {
  status: 'ready' | 'degraded';
  checks: Record<string, {
    status: AIServiceStatus;
    latencyMs?: number | null;
    statusCode?: number;
    workers?: number;
    error?: string;
  }>;
};

const aiService = {
  tts: async (payload: TTSPayload): Promise<Blob> => {
    const url = 'ai/tts/';
    const response = await httpRequest.post<ArrayBuffer>(url, payload, {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    // httpRequest interceptor unwraps .data, so response IS the arraybuffer
    return new Blob([response], { type: 'audio/mpeg' });
  },

  getAudioFeedback: async (url: string): Promise<ArrayBuffer> => {
    return httpRequest.get<ArrayBuffer>(url, { responseType: 'arraybuffer' });
  },

  transcribe: async (file: File, params: TranscribeParams = {}): Promise<TranscribeResponse> => {
    const url = 'ai/transcribe/';
    const formData = new FormData();
    formData.append('audio', file);
    if (params.model) formData.append('model', String(params.model));
    if (params.language) formData.append('language', String(params.language));
    const response = await httpRequest.post<TranscribeResponse>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response ?? {};
  },

  getScreeningResult: async (id: string | number): Promise<ScreeningResult> => {
    return httpRequest.get<ScreeningResult>(`interview/web/screening-results/${id}/`);
  },

  getHealth: async (): Promise<AIHealthResponse> => {
    return httpRequest.get<AIHealthResponse>('ai/health/');
  },
};

export default aiService;

