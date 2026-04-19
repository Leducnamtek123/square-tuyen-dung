import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import { AUTH_CONFIG } from "@/configs/constants";
import { CHATBOT_ICONS } from "@/configs/images";
import { isEmployerPortalPath } from "@/configs/portalRouting";
import chatbotService from "@/services/chatbotService";
import { MessageResponse } from "@/components/Features/AiElements/message";
import { useAppSelector } from "@/hooks/useAppStore";
import type { BotConfig } from "@/types/auth";
import type { ChatPayload } from "@/services/chatbotService";
import type { ChatMessagePayload } from "@/services/chatbotService";
import "./chatbot.css";

type ChatRole = "assistant" | "user" | "system";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

const MAX_HISTORY = 12;
const makeMessageId = (prefix: string) => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const ChatBot = () => {
  const { t } = useTranslation(['chat', 'common']);
  const { currentUser, isAuthenticated, activeWorkspace } = useAppSelector(
    (state) => state.user
  );
  const [botConfig, setBotConfig] = useState<BotConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [canRetry, setCanRetry] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const lastPayloadRef = useRef<ChatPayload | null>(null);

  const fullPathname = typeof window !== 'undefined' ? window.location.pathname : "/";
  const isEmployerRoute = isEmployerPortalPath(fullPathname);
  const isEmployer = activeWorkspace?.type === "company" || isEmployerRoute;

  const greeting = useMemo(() => {
    if (isEmployer) {
      return t('chat:chatbot.greeting.employer');
    }
    return t('chat:chatbot.greeting.jobSeeker');
  }, [isEmployer, t]);

  const systemPrompt = useMemo(() => {
    if (isEmployer) {
      return t('chat:chatbot.systemPrompt.employer');
    }
    return t('chat:chatbot.systemPrompt.jobSeeker');
  }, [isEmployer, t]);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const config = isEmployer ? AUTH_CONFIG.EMPLOYER_BOT : AUTH_CONFIG.JOB_SEEKER_BOT;
      setBotConfig(config || null);
    } else {
      setBotConfig(AUTH_CONFIG.JOB_SEEKER_BOT || null);
    }
  }, [currentUser, isAuthenticated, isEmployer]);

  // Always enable rich markdown rendering for AI assistant messages
  const enableRichRendering = true;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ id: "greeting", role: "assistant", content: greeting }]);
    }
  }, [isOpen, messages.length, greeting]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isSending]);

  const buildPayload = (nextMessages: ChatMessage[]): ChatPayload => {
    const history: ChatMessagePayload[] = nextMessages
      .filter((message) => message.role !== "system")
      .slice(-MAX_HISTORY)
      .map((message) => ({ role: message.role, content: message.content }));
    return {
      messages: [{ role: "system", content: systemPrompt }, ...history],
    };
  };

  const sendChat = async (payload: ChatPayload) => {
    try {
      const response = await chatbotService.chat(payload);
      const reply =
        response?.reply ||
        (response as { data?: { reply?: string } })?.data?.reply ||
        t('chat:chatbot.error.apology');
      setMessages((prev) => [
        ...prev,
        { id: makeMessageId("assistant"), role: "assistant", content: reply },
      ]);
      setError("");
      setCanRetry(false);
    } catch (err) {
      setError(t('chat:chatbot.error.busy'));
      setCanRetry(true);
      setMessages((prev) => [
        ...prev,
        {
          id: makeMessageId("assistant"),
          role: "assistant",
          content: t('chat:chatbot.error.tryAgainLater'),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    setError("");
    setCanRetry(false);
    const userMessage: ChatMessage = {
      id: makeMessageId("user"),
      role: "user",
      content: trimmed,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    const payload = buildPayload(nextMessages);
    lastPayloadRef.current = payload;
    await sendChat(payload);
  };

  const handleRetry = async () => {
    if (!lastPayloadRef.current || isSending) return;
    setError("");
    setCanRetry(false);
    setIsSending(true);
    await sendChat(lastPayloadRef.current);
  };

  if (!botConfig) {
    return null;
  }

  return (
    <div className={`sq-chatbot ${isOpen ? "is-open" : ""}`}>
      <button
        className="sq-chatbot__launcher"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={t('chat:chatbot.launcherAria')}
      >
        <img src={isEmployer ? CHATBOT_ICONS.EMPLOYER : CHATBOT_ICONS.JOB_SEEKER} alt="Square AI" />
        <span className="sq-chatbot__launcher-ring" />
      </button>

      <div className="sq-chatbot__panel" role="dialog" aria-label="Square AI Chat">
        <header className="sq-chatbot__header">
          <div className="sq-chatbot__title">
            <span className="sq-chatbot__badge">
              <SmartToyOutlinedIcon fontSize="small" />
            </span>
            <div>
              <div className="sq-chatbot__name">{botConfig.CHAT_TITLE || "Square AI"}</div>
              <div className="sq-chatbot__status">
                <span className="sq-chatbot__status-dot" />
                {t('chat:chatbot.status')}
              </div>
            </div>
          </div>
          <button
            className="sq-chatbot__close"
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label={t('chat:chatbot.closeAria')}
          >
            <CloseRoundedIcon fontSize="small" />
          </button>
        </header>

        <div className="sq-chatbot__messages" ref={listRef}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`sq-chatbot__message sq-chatbot__message--${message.role}`}
            >
              <div className="sq-chatbot__bubble">
                {message.role === "assistant" ? (
                  <MessageResponse enableRich={enableRichRendering}>
                    {message.content}
                  </MessageResponse>
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="sq-chatbot__message sq-chatbot__message--assistant">
              <div className="sq-chatbot__bubble sq-chatbot__bubble--typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
        </div>

        <form className="sq-chatbot__composer" onSubmit={handleSend}>
          <input
            type="text"
            placeholder={t('chat:chatbot.placeholder')}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={isSending}
          />
          <button type="submit" disabled={!input.trim() || isSending} aria-label={t('chat:send')}>
            <SendRoundedIcon fontSize="small" />
          </button>
        </form>

        {error && (
          <div className="sq-chatbot__error">
            <span>{error}</span>
            {canRetry && (
              <button
                type="button"
                className="sq-chatbot__retry-btn"
                onClick={handleRetry}
                disabled={isSending}
              >
                {t('chat:chatbot.retry') || 'Thử lại'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBot;
