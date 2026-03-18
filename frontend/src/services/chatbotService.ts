import httpRequest from "../utils/httpRequest";

export interface ChatResponse {
  reply: string;
  [key: string]: unknown;
}

const chatbotService = {
  async chat(payload: Record<string, unknown>): Promise<ChatResponse> {
    return httpRequest.post('ai/chat/', payload);
  },
};

export default chatbotService;
