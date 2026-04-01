import httpRequest from '../utils/httpRequest';


const aiService = {
  tts: async (payload: Record<string, unknown>): Promise<Blob> => {
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

  transcribe: async (file: File, params: Record<string, unknown> = {}): Promise<Record<string, unknown>> => {
    const url = 'ai/transcribe/';
    const formData = new FormData();
    formData.append('audio', file);
    if (params.model) formData.append('model', String(params.model));
    if (params.language) formData.append('language', String(params.language));
    const response = await httpRequest.post<Record<string, unknown>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response ?? {};
  },

  getScreeningResult: async (id: string | number): Promise<Record<string, unknown>> => {
    return httpRequest.get<Record<string, unknown>>(`interview/web/screening-results/${id}/`);
  },
};

export default aiService;
