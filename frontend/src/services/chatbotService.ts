import httpRequest from "../utils/httpRequest";

export interface ChatMessagePayload {
  role: 'assistant' | 'user' | 'system';
  content: string;
}

export interface ChatPayload {
  messages: ChatMessagePayload[];
  max_tokens?: number;
}

type ChatResponse = {
  reply: string;
};

const chatbotService = {
  async chat(payload: ChatPayload): Promise<ChatResponse> {
    return httpRequest.post('ai/chat/', payload, { timeout: 120000 });
  },
};

export default chatbotService;

