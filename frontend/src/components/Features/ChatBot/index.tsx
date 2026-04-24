'use client';

import React, { useEffect, useMemo, useRef, useReducer } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { LOGO_IMAGES } from '@/configs/images';
import { AUTH_CONFIG } from '@/configs/constants';
import { CHATBOT_ICONS } from '@/configs/images';
import { isEmployerPortalPath } from '@/configs/portalRouting';
import chatbotService from '@/services/chatbotService';
import { MessageResponse } from '@/components/Features/AiElements/message';
import { useAppSelector } from '@/hooks/useAppStore';
import type { BotConfig } from '@/types/auth';
import type { ChatPayload, ChatMessagePayload } from '@/services/chatbotService';
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

const ChatBot = () => {
  const { t } = useTranslation(['chat', 'common']);
  const { currentUser, isAuthenticated, activeWorkspace } = useAppSelector((state) => state.user);
  const [state, dispatch] = useReducer(reducer, initialState);
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

  const greeting = useMemo(() => {
    return isEmployer ? t('chat:chatbot.greeting.employer') : t('chat:chatbot.greeting.jobSeeker');
  }, [isEmployer, t]);

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
    return { messages: [{ role: 'system', content: systemPrompt }, ...history] };
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

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = state.input.trim();
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
        <Image src={isEmployer ? CHATBOT_ICONS.EMPLOYER : CHATBOT_ICONS.JOB_SEEKER} alt="Square AI" width={28} height={28} />
        <span className="sq-chatbot__launcher-ring" />
      </button>

      <div className="sq-chatbot__panel" role="dialog" aria-label="Square AI Chat">
        <header className="sq-chatbot__header">
          <div className="sq-chatbot__title">
            <span className="sq-chatbot__badge">
              <Image src={LOGO_IMAGES.LOGO_WITH_BG} alt="Square" width={28} height={28} style={{ borderRadius: 6, objectFit: 'contain' }} />
            </span>
            <div>
              <div className="sq-chatbot__name">{botConfig.CHAT_TITLE || 'Square AI'}</div>
              <div className="sq-chatbot__status">
                <span className="sq-chatbot__status-dot" />
                {t('chat:chatbot.status')}
              </div>
            </div>
          </div>
          <button
            className="sq-chatbot__close"
            type="button"
            onClick={() => dispatch({ type: 'close' })}
            aria-label={t('chat:chatbot.closeAria')}
          >
            <CloseRoundedIcon fontSize="small" />
          </button>
        </header>

        <div className="sq-chatbot__messages" ref={listRef}>
          {state.messages.map((message) => (
            <div key={message.id} className={`sq-chatbot__message sq-chatbot__message--${message.role}`}>
              <div className="sq-chatbot__bubble">
                {message.role === 'assistant' ? <MessageResponse enableRich={enableRichRendering}>{message.content}</MessageResponse> : message.content}
              </div>
            </div>
          ))}
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
