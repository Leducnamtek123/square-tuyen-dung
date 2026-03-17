import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import { AUTH_CONFIG } from "../../configs/constants";
import { isEmployerPortalPath } from "../../configs/portalRouting";
import api from "../../services/axiosClient";
import { MessageResponse } from "../ai-elements/message";
import "./chatbot.css";

const MAX_HISTORY = 12;

const ChatBot = () => {
  const { t } = useTranslation(['chat', 'common']);
  const { currentUser, isAuthenticated, activeWorkspace } = useSelector(
    /** @type {(state: any) => any} */ ((state) => state.user)
  );
  const [botConfig, setBotConfig] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);

  const fullPathname = window.location.pathname || "/";
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

  const botMode = botConfig?.MODE || AUTH_CONFIG.BOT_RENDER_MODE;
  const enableRichRendering = ["dev", "architecture", "docs"].includes(
    (botMode || "chat").toLowerCase()
  );

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ id: "greeting", role: "assistant", content: greeting }]);
    }
  }, [isOpen, messages.length, greeting]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isSending]);

  const buildPayload = (nextMessages) => {
    const history = nextMessages
      .filter((message) => message.role !== "system")
      .slice(-MAX_HISTORY)
      .map((message) => ({ role: message.role, content: message.content }));
    return {
      messages: [{ role: "system", content: systemPrompt }, ...history],
    };
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    setError("");
    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const payload = buildPayload(nextMessages);
      const response = await api.post("ai/chat/", payload);
      const reply =
        response?.data?.data?.reply ||
        response?.data?.reply ||
        t('chat:chatbot.error.apology');
      setMessages((prev) => [
        ...prev,
        { id: `assistant-${Date.now()}`, role: "assistant", content: reply },
      ]);
    } catch (err) {
      setError(t('chat:chatbot.error.busy'));
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: t('chat:chatbot.error.tryAgainLater'),
        },
      ]);
    } finally {
      setIsSending(false);
    }
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
        <img src={botConfig.CHAT_ICON} alt="Square AI" />
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

        {error && <div className="sq-chatbot__error">{error}</div>}
      </div>
    </div>
  );
};

export default ChatBot;
