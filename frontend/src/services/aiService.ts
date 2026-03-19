import axios from 'axios';

type AnyRecord = Record<string, unknown>;

const baseURL = import.meta.env.VITE_API_BASE || '/api/';

const aiService = {
  tts: async (payload: AnyRecord): Promise<Blob> => {
    const url = 'ai/tts/';
    const response = await axios.post(url, payload, {
      baseURL,
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    const contentType =
      response.headers?.['content-type'] || 'audio/mpeg';
    return new Blob([response.data], { type: contentType });
  },

  transcribe: async (file: File, params: AnyRecord = {}): Promise<AnyRecord> => {
    const url = 'ai/transcribe/';
    const formData = new FormData();
    formData.append('audio', file);
    if (params.model) formData.append('model', String(params.model));
    if (params.language) formData.append('language', String(params.language));
    const response = await axios.post(url, formData, {
      baseURL,
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data ?? response.data;
  },
};

export default aiService;
