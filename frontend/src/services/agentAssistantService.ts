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

export type AgentMessageAttachment = {
  type: "image";
  name: string;
  mimeType: string;
  size: number;
  dataUrl: string;
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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const unwrapEnvelope = (raw: unknown, expectedKeys: string[]): unknown => {
  let current = raw;
  for (let index = 0; index < 3; index += 1) {
    if (!isRecord(current)) return current;
    const record = current;
    if (expectedKeys.some((key) => key in record)) return record;
    if (!("data" in record)) return record;
    current = record.data;
  }
  return current;
};

const normalizeListEnvelope = <T>(raw: unknown, key: string): Record<string, T[]> => {
  const data = unwrapEnvelope(raw, [key]);
  if (Array.isArray(data)) return { [key]: data as T[] };
  if (isRecord(data) && Array.isArray(data[key])) return { [key]: data[key] as T[] };
  return { [key]: [] };
};

const agentAssistantService = {
  getTools(): Promise<ToolRegistryResponse> {
    return (httpRequest.get("agent-assistants/tools/") as Promise<unknown>).then((data) =>
      normalizeListEnvelope<AgentToolDefinition>(data, "tools") as ToolRegistryResponse
    );
  },

  listThreads(): Promise<ThreadListResponse> {
    return (httpRequest.get("agent-assistants/threads/") as Promise<unknown>).then((data) =>
      normalizeListEnvelope<AgentThread>(data, "threads") as ThreadListResponse
    );
  },

  createThread(portal: AgentPortal): Promise<AgentThread> {
    return (httpRequest.post("agent-assistants/threads/", { portal }) as Promise<unknown>).then((data) =>
      unwrapEnvelope(data, ["id", "portal", "title"]) as AgentThread
    );
  },

  listMessages(threadId: number): Promise<MessageListResponse> {
    return (httpRequest.get(`agent-assistants/threads/${threadId}/messages/`) as Promise<unknown>).then((data) =>
      normalizeListEnvelope<AgentMessage>(data, "messages") as MessageListResponse
    );
  },

  sendMessage(
    threadId: number,
    content: string,
    attachments: AgentMessageAttachment[] = [],
  ): Promise<SendMessageResponse> {
    const payload = attachments.length ? { content, attachments } : { content };
    return (httpRequest.post(
      `agent-assistants/threads/${threadId}/messages/`,
      payload,
      { timeout: 120000 },
    ) as Promise<unknown>).then((data) =>
      unwrapEnvelope(data, ["thread", "userMessage", "assistantMessage"]) as SendMessageResponse
    );
  },

  deleteThread(threadId: number): Promise<void> {
    return httpRequest.delete(`agent-assistants/threads/${threadId}/`);
  },
};

export default agentAssistantService;
