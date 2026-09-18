import httpRequest from "../utils/httpRequest";
import { unwrapDataResponse } from "../utils/apiResponse";

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
  model?: string;
  source?: string | null;
  usage?: unknown;
  action?: string;
  activityId?: number;
  manualCandidateProfileId?: number;
};

export interface ChatbotConfigResponse {
  title?: string;
  subtitle?: string;
  employerGreeting?: string;
  jobSeekerGreeting?: string;
  employerSuggestions?: string[];
  jobSeekerSuggestions?: string[];
}

const chatbotService = {
  async chat(payload: ChatPayload): Promise<ChatResponse> {
    const response = await httpRequest.post('ai/chat/', payload, { timeout: 120000 });
    return unwrapDataResponse<ChatResponse>(response);
  },
  async getChatbotConfig(): Promise<ChatbotConfigResponse> {
    const response = await httpRequest.get('ai/chatbot/config/');
    return unwrapDataResponse<ChatbotConfigResponse>(response);
  },
};

export default chatbotService;

