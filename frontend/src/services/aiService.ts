import httpRequest from '../utils/httpRequest';

type AnyRecord = Record<string, unknown>;

const aiService = {
  tts: async (payload: AnyRecord): Promise<Blob> => {
    const url = 'ai/tts/';
    const response = await httpRequest.post(url, payload, {
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    // httpRequest interceptor unwraps .data, so response IS the arraybuffer
    const raw = response as unknown as ArrayBuffer;
    return new Blob([raw], { type: 'audio/mpeg' });
  },

  transcribe: async (file: File, params: AnyRecord = {}): Promise<AnyRecord> => {
    const url = 'ai/transcribe/';
    const formData = new FormData();
    formData.append('audio', file);
    if (params.model) formData.append('model', String(params.model));
    if (params.language) formData.append('language', String(params.language));
    const response = await httpRequest.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return (response as unknown as AnyRecord) ?? {};
  },
};

export default aiService;
