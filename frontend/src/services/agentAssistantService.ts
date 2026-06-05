import httpRequest from "../utils/httpRequest";

export type AgentPortal = "employer" | "admin";
export type AgentRole = "user" | "assistant" | "system";
export type AgentToolStatus = "pending" | "running" | "succeeded" | "failed";

export type AgentToolDefinition = {
  name: string;
  displayName: string;
  description: string;
  category: string;
  dangerLevel: "read" | "write" | string;
  inputSchema: Record<string, unknown>;
};

export type AgentToolCall = {
  id: number;
  toolName: string;
  displayName: string;
  status: AgentToolStatus;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  errorMessage?: string;
  requiresConfirmation: boolean;
  metadata?: Record<string, unknown>;
  createAt: string;
  updateAt: string;
};

export type AgentMessage = {
  id: number;
  role: AgentRole;
  content: string;
  parts: Array<Record<string, unknown>>;
  metadata?: Record<string, unknown>;
  toolCalls: AgentToolCall[];
  createAt: string;
  updateAt: string;
};

export type AgentThread = {
  id: number;
  title: string;
  portal: AgentPortal;
  status: "active" | "archived";
  ownerId: number;
  companyId?: number | null;
  metadata?: Record<string, unknown>;
  lastMessageAt?: string | null;
  createAt: string;
  updateAt: string;
};

type ToolRegistryResponse = {
  tools: AgentToolDefinition[];
};

type ThreadListResponse = {
  threads: AgentThread[];
};

type MessageListResponse = {
  messages: AgentMessage[];
};

type SendMessageResponse = {
  thread: AgentThread;
  userMessage: AgentMessage;
  assistantMessage: AgentMessage;
  toolCalls: AgentToolCall[];
};

const agentAssistantService = {
  getTools(): Promise<ToolRegistryResponse> {
    return httpRequest.get("agent-assistants/tools/");
  },

  listThreads(): Promise<ThreadListResponse> {
    return httpRequest.get("agent-assistants/threads/");
  },

  createThread(portal: AgentPortal): Promise<AgentThread> {
    return httpRequest.post("agent-assistants/threads/", { portal });
  },

  listMessages(threadId: number): Promise<MessageListResponse> {
    return httpRequest.get(`agent-assistants/threads/${threadId}/messages/`);
  },

  sendMessage(threadId: number, content: string): Promise<SendMessageResponse> {
    return httpRequest.post(`agent-assistants/threads/${threadId}/messages/`, { content }, { timeout: 120000 });
  },

  deleteThread(threadId: number): Promise<void> {
    return httpRequest.delete(`agent-assistants/threads/${threadId}/`);
  },
};

export default agentAssistantService;
