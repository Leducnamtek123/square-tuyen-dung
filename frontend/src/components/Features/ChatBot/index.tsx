'use client';

import React, { useEffect, useMemo, useRef, useReducer, useState, useCallback } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { LOGO_IMAGES } from '@/configs/images';
import { AUTH_CONFIG } from '@/configs/constants';
import { CHATBOT_ICONS } from '@/configs/images';
import { isEmployerPortalPath } from '@/configs/portalRouting';
import chatbotService, { type ChatbotConfigResponse, type ChatPayload, type ChatMessagePayload } from '@/services/chatbotService';
import { MessageResponse } from '@/components/Features/AiElements/message';
import { useAppSelector } from '@/hooks/useAppStore';
import type { BotConfig } from '@/types/auth';
import './chatbot.css';

type ChatRole = 'assistant' | 'user' | 'system';

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type ChatBotState = {
  isOpen: boolean;
  messages: ChatMessage[];
  input: string;
  isSending: boolean;
  error: string;
  canRetry: boolean;
};

type ChatBotAction =
  | { type: 'toggle_open' }
  | { type: 'close' }
  | { type: 'set_messages'; value: ChatMessage[] }
  | { type: 'append_message'; value: ChatMessage }
  | { type: 'set_input'; value: string }
  | { type: 'set_sending'; value: boolean }
  | { type: 'set_error'; value: string }
  | { type: 'set_can_retry'; value: boolean }
  | { type: 'reset_composer' };

const MAX_HISTORY = 12;

const initialState: ChatBotState = {
  isOpen: false,
  messages: [],
  input: '',
  isSending: false,
  error: '',
  canRetry: false,
};

function reducer(state: ChatBotState, action: ChatBotAction): ChatBotState {
  switch (action.type) {
    case 'toggle_open':
      return { ...state, isOpen: !state.isOpen };
    case 'close':
      return { ...state, isOpen: false };
    case 'set_messages':
      return { ...state, messages: action.value };
    case 'append_message':
      return { ...state, messages: [...state.messages, action.value] };
    case 'set_input':
      return { ...state, input: action.value };
    case 'set_sending':
      return { ...state, isSending: action.value };
    case 'set_error':
      return { ...state, error: action.value };
    case 'set_can_retry':
      return { ...state, canRetry: action.value };
    case 'reset_composer':
      return { ...state, input: '', error: '', canRetry: false, isSending: false };
    default:
      return state;
  }
}

const makeMessageId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const DEFAULT_EMPLOYER_SUGGESTIONS = [
  'Tìm ứng viên cho vị trí thiết kế',
  'Soạn tin mời phỏng vấn',
  'Mức lương thị trường hiện nay',
];

const DEFAULT_JOBSEEKER_SUGGESTIONS = [
  'Tìm việc làm vị trí Frontend',
  'Tải mẫu CV tiếng Anh',
  'Cách trả lời phỏng vấn về mức lương',
];

const ChatBot = () => {
  const { t } = useTranslation(['chat', 'common']);
  const { currentUser, isAuthenticated, activeWorkspace } = useAppSelector((state) => state.user);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [serverConfig, setServerConfig] = useState<ChatbotConfigResponse | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const lastPayloadRef = useRef<ChatPayload | null>(null);

  const fullPathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const isEmployerRoute = isEmployerPortalPath(fullPathname);
  const isEmployer = activeWorkspace?.type === 'company' || isEmployerRoute;

  const botConfig = useMemo<BotConfig | null>(() => {
    if (isAuthenticated && currentUser) {
      return (isEmployer ? AUTH_CONFIG.EMPLOYER_BOT : AUTH_CONFIG.JOB_SEEKER_BOT) || null;
    }
    return AUTH_CONFIG.JOB_SEEKER_BOT || null;
  }, [currentUser, isAuthenticated, isEmployer]);

  useEffect(() => {
    chatbotService.getChatbotConfig().then((cfg) => {
      if (cfg) setServerConfig(cfg);
    }).catch(() => {
      // Use fallback defaults
    });
  }, []);

  const botTitle = serverConfig?.title || botConfig?.CHAT_TITLE || 'InfoHR AI';
  const botSubtitle = serverConfig?.subtitle || (isEmployer ? 'Trợ lý tuyển dụng thông minh' : 'Trợ lý nghề nghiệp thông minh');

  const greeting = useMemo(() => {
    if (isEmployer) {
      return serverConfig?.employerGreeting || t('chat:chatbot.greeting.employer');
    }
    return serverConfig?.jobSeekerGreeting || t('chat:chatbot.greeting.jobSeeker');
  }, [isEmployer, serverConfig, t]);

  const suggestions = useMemo(() => {
    if (isEmployer) {
      return serverConfig?.employerSuggestions && serverConfig.employerSuggestions.length > 0
        ? serverConfig.employerSuggestions
        : DEFAULT_EMPLOYER_SUGGESTIONS;
    }
    return serverConfig?.jobSeekerSuggestions && serverConfig.jobSeekerSuggestions.length > 0
      ? serverConfig.jobSeekerSuggestions
      : DEFAULT_JOBSEEKER_SUGGESTIONS;
  }, [isEmployer, serverConfig]);

  const systemPrompt = useMemo(() => {
    return isEmployer ? t('chat:chatbot.systemPrompt.employer') : t('chat:chatbot.systemPrompt.jobSeeker');
  }, [isEmployer, t]);

  useEffect(() => {
    if (state.isOpen && state.messages.length === 0) {
      dispatch({ type: 'set_messages', value: [{ id: 'greeting', role: 'assistant', content: greeting }] });
    }
  }, [greeting, state.isOpen, state.messages.length]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [state.messages, state.isSending]);

  const enableRichRendering = true;

  const buildPayload = (nextMessages: ChatMessage[]): ChatPayload => {
    const history: ChatMessagePayload[] = nextMessages
      .filter((message) => message.role !== 'system')
      .slice(-MAX_HISTORY)
      .map((message) => ({ role: message.role, content: message.content }));
    return { messages: [{ role: 'system', content: systemPrompt }, ...history], max_tokens: 1024 };
  };

  const sendChat = async (payload: ChatPayload) => {
    try {
      const response = await chatbotService.chat(payload);
      const reply = response?.reply || (response as { data?: { reply?: string } })?.data?.reply || t('chat:chatbot.error.apology');
      dispatch({ type: 'append_message', value: { id: makeMessageId('assistant'), role: 'assistant', content: reply } });
      dispatch({ type: 'set_error', value: '' });
      dispatch({ type: 'set_can_retry', value: false });
    } catch {
      dispatch({ type: 'set_error', value: t('chat:chatbot.error.busy') });
      dispatch({ type: 'set_can_retry', value: true });
      dispatch({
        type: 'append_message',
        value: { id: makeMessageId('assistant'), role: 'assistant', content: t('chat:chatbot.error.tryAgainLater') },
      });
    } finally {
      dispatch({ type: 'set_sending', value: false });
    }
  };

  const executeSendText = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || state.isSending) return;

    dispatch({ type: 'set_error', value: '' });
    dispatch({ type: 'set_can_retry', value: false });
    const userMessage: ChatMessage = { id: makeMessageId('user'), role: 'user', content: trimmed };
    const nextMessages = [...state.messages, userMessage];
    dispatch({ type: 'set_messages', value: nextMessages });
    dispatch({ type: 'set_input', value: '' });
    dispatch({ type: 'set_sending', value: true });

    const payload = buildPayload(nextMessages);
    lastPayloadRef.current = payload;
    await sendChat(payload);
  }, [state.isSending, state.messages, systemPrompt, t]);

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await executeSendText(state.input);
  };

  const handleSuggestionClick = async (promptText: string) => {
    await executeSendText(promptText);
  };

  const handleReset = () => {
    dispatch({ type: 'set_messages', value: [{ id: 'greeting', role: 'assistant', content: greeting }] });
    dispatch({ type: 'reset_composer' });
  };

  const handleRetry = async () => {
    if (!lastPayloadRef.current || state.isSending) return;
    dispatch({ type: 'set_error', value: '' });
    dispatch({ type: 'set_can_retry', value: false });
    dispatch({ type: 'set_sending', value: true });
    await sendChat(lastPayloadRef.current);
  };

  if (!botConfig) return null;

  return (
    <div className={`sq-chatbot ${state.isOpen ? 'is-open' : ''}`}>
      <button
        className="sq-chatbot__launcher"
        type="button"
        onClick={() => dispatch({ type: 'toggle_open' })}
        aria-label={t('chat:chatbot.launcherAria')}
      >
        <Image src={isEmployer ? CHATBOT_ICONS.EMPLOYER : CHATBOT_ICONS.JOB_SEEKER} alt="InfoHR AI" width={28} height={28} />
        <span className="sq-chatbot__launcher-ring" />
      </button>

      <dialog className="sq-chatbot__panel" open aria-label={t('chat:chatbot.panelAria')}>
        <header className="sq-chatbot__header">
          <div className="sq-chatbot__title">
            <div>
              <div className="sq-chatbot__name">{botTitle}</div>
              <div className="sq-chatbot__status">
                <span className="sq-chatbot__status-dot" />
                {botSubtitle}
              </div>
            </div>
          </div>
          <div className="sq-chatbot__header-actions">
            <button
              className="sq-chatbot__icon-btn"
              type="button"
              onClick={handleReset}
              title="Làm mới cuộc trò chuyện"
              aria-label="Làm mới"
            >
              <RefreshRoundedIcon fontSize="small" />
            </button>
            <button
              className="sq-chatbot__icon-btn"
              type="button"
              onClick={() => dispatch({ type: 'close' })}
              aria-label={t('chat:chatbot.closeAria')}
            >
              <CloseRoundedIcon fontSize="small" />
            </button>
          </div>
        </header>

        <div className="sq-chatbot__messages" ref={listRef}>
          {state.messages.map((message) => (
            <div key={message.id} className={`sq-chatbot__message sq-chatbot__message--${message.role}`}>
              <div className="sq-chatbot__bubble">
                {message.role === 'assistant' ? <MessageResponse enableRich={enableRichRendering}>{message.content}</MessageResponse> : message.content}
              </div>
            </div>
          ))}

          {state.messages.length === 1 && suggestions.length > 0 && (
            <div className="sq-chatbot__suggestions">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="sq-chatbot__suggestion-chip"
                  onClick={() => handleSuggestionClick(item)}
                  disabled={state.isSending}
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          {state.isSending && (
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
            aria-label={t('chat:chatbot.placeholder')}
            placeholder={t('chat:chatbot.placeholder')}
            value={state.input}
            onChange={(event) => dispatch({ type: 'set_input', value: event.target.value })}
            disabled={state.isSending}
          />
          <button type="submit" disabled={!state.input.trim() || state.isSending} aria-label={t('chat:send')}>
            <SendRoundedIcon fontSize="small" />
          </button>
        </form>

        {state.error && (
          <div className="sq-chatbot__error">
            <span>{state.error}</span>
            {state.canRetry && (
              <button type="button" className="sq-chatbot__retry-btn" onClick={handleRetry} disabled={state.isSending}>
                {t('chat:chatbot.retry')}
              </button>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
};

export default ChatBot;
