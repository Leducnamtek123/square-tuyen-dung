'use client';

import React, { useEffect, useMemo, useRef, useReducer, useState, useCallback } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
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
  | { type: 'open' }
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
    case 'open':
      return { ...state, isOpen: true };
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

interface ActionCardItem {
  icon: string;
  title: string;
  desc: string;
  prompt: string;
}

const ChatBot = () => {
  const { t } = useTranslation(['chat', 'common']);
  const { currentUser, isAuthenticated, activeWorkspace } = useAppSelector((state) => state.user);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [serverConfig, setServerConfig] = useState<ChatbotConfigResponse | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasDismissedTeaser, setHasDismissedTeaser] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
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
    chatbotService
      .getChatbotConfig()
      .then((cfg) => {
        if (cfg) setServerConfig(cfg);
      })
      .catch(() => {
        // Use fallback defaults
      });
  }, []);

  // Teaser is off by default to avoid obstructing cards and interactive buttons
  // Users interact with the sleek launcher button directly
  useEffect(() => {
    // Keep teaser closed to prevent blocking page content
    setShowTeaser(false);
  }, [fullPathname]);

  // Focus input automatically when panel is opened
  useEffect(() => {
    if (state.isOpen) {
      setShowTeaser(false);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [state.isOpen]);

  const botTitle = serverConfig?.title || botConfig?.CHAT_TITLE || 'AILA AI';
  const botIcon = isEmployer ? CHATBOT_ICONS.EMPLOYER : CHATBOT_ICONS.JOB_SEEKER;
  const botSubtitle = serverConfig?.subtitle || (isEmployer ? t('chat:chatbot.subtitleEmployer', 'Trợ lý tuyển dụng thông minh') : t('chat:chatbot.subtitleJobSeeker', 'Trợ lý nghề nghiệp thông minh'));

  const greeting = useMemo(() => {
    if (isEmployer) {
      return serverConfig?.employerGreeting || t('chat:chatbot.greeting.employer');
    }
    return serverConfig?.jobSeekerGreeting || t('chat:chatbot.greeting.jobSeeker');
  }, [isEmployer, serverConfig, t]);

  const defaultEmployerSuggestions = useMemo(() => [
    t('chat:suggestions.findDesigners', 'Tìm ứng viên cho vị trí thiết kế'),
    t('chat:suggestions.writeInterviewInvite', 'Soạn tin mời phỏng vấn'),
    t('chat:suggestions.marketSalary', 'Mức lương thị trường hiện nay'),
  ], [t]);

  const defaultJobSeekerSuggestions = useMemo(() => [
    t('chat:suggestions.findFrontendJobs', 'Tìm việc làm vị trí Frontend'),
    t('chat:suggestions.downloadEnglishCv', 'Tải mẫu CV tiếng Anh'),
    t('chat:suggestions.salaryInterviewTips', 'Cách trả lời phỏng vấn về mức lương'),
  ], [t]);

  const suggestions = useMemo(() => {
    if (isEmployer) {
      return serverConfig?.employerSuggestions && serverConfig.employerSuggestions.length > 0
        ? serverConfig.employerSuggestions
        : defaultEmployerSuggestions;
    }
    return serverConfig?.jobSeekerSuggestions && serverConfig.jobSeekerSuggestions.length > 0
      ? serverConfig.jobSeekerSuggestions
      : defaultJobSeekerSuggestions;
  }, [isEmployer, serverConfig, defaultEmployerSuggestions, defaultJobSeekerSuggestions]);

  // 4 Interactive quick action cards for the welcome screen
  const actionCards = useMemo<ActionCardItem[]>(() => {
    if (isEmployer) {
      return [
        {
          icon: '👥',
          title: t('chat:actionCards.employer.findCandidates', 'Tìm ứng viên'),
          desc: t('chat:actionCards.employer.findCandidatesDesc', 'Lọc ứng viên tiềm năng theo vị trí'),
          prompt: suggestions[0] || 'Tìm ứng viên cho vị trí thiết kế',
        },
        {
          icon: '✉️',
          title: t('chat:actionCards.employer.inviteInterview', 'Mời phỏng vấn'),
          desc: t('chat:actionCards.employer.inviteInterviewDesc', 'Soạn thư mời phỏng vấn ấn tượng'),
          prompt: suggestions[1] || 'Soạn tin mời phỏng vấn',
        },
        {
          icon: '📝',
          title: t('chat:actionCards.employer.optimizeJd', 'Tối ưu JD'),
          desc: t('chat:actionCards.employer.optimizeJdDesc', 'Hỗ trợ viết mô tả công việc thu hút'),
          prompt: 'Gợi ý cách viết JD tuyển dụng chuẩn và thu hút ứng viên',
        },
        {
          icon: '📊',
          title: t('chat:actionCards.employer.salarySurvey', 'Khảo sát lương'),
          desc: t('chat:actionCards.employer.salarySurveyDesc', 'Mặt bằng đãi ngộ thị trường'),
          prompt: suggestions[2] || 'Mức lương thị trường hiện nay',
        },
      ];
    }
    return [
      {
        icon: '💼',
        title: t('chat:actionCards.jobSeeker.findJobs', 'Tìm việc phù hợp'),
        desc: t('chat:actionCards.jobSeeker.findJobsDesc', 'Gợi ý việc làm theo năng lực & lương'),
        prompt: suggestions[0] || 'Tìm việc làm vị trí Frontend',
      },
      {
        icon: '📄',
        title: t('chat:actionCards.jobSeeker.reviewCv', 'Đánh giá & Sửa CV'),
        desc: t('chat:actionCards.jobSeeker.reviewCvDesc', 'Rà soát hồ sơ theo chuẩn ATS'),
        prompt: suggestions[1] || 'Tải mẫu CV tiếng Anh',
      },
      {
        icon: '🎯',
        title: t('chat:actionCards.jobSeeker.interviewTips', 'Luyện phỏng vấn'),
        desc: t('chat:actionCards.jobSeeker.interviewTipsDesc', 'Mẹo trả lời câu hỏi nhà tuyển dụng'),
        prompt: suggestions[2] || 'Cách trả lời phỏng vấn về mức lương',
      },
      {
        icon: '📊',
        title: t('chat:actionCards.jobSeeker.salarySurvey', 'Khảo sát lương'),
        desc: t('chat:actionCards.jobSeeker.salarySurveyDesc', 'Tra cứu thu nhập trung bình ngành'),
        prompt: 'Mức lương trung bình của các ngành nghề hiện nay',
      },
    ];
  }, [isEmployer, suggestions, t]);

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

  const buildPayload = useCallback((nextMessages: ChatMessage[]): ChatPayload => {
    const history: ChatMessagePayload[] = nextMessages
      .filter((message) => message.role !== 'system')
      .slice(-MAX_HISTORY)
      .map((message) => ({ role: message.role, content: message.content }));
    return { messages: [{ role: 'system', content: systemPrompt }, ...history], max_tokens: 1024 };
  }, [systemPrompt]);

  const sendChat = useCallback(async (payload: ChatPayload) => {
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
  }, [t]);

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
  }, [buildPayload, sendChat, state.isSending, state.messages]);

  const handleSend = async (event: React.SyntheticEvent<HTMLFormElement>) => {
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

  const handleCopy = useCallback((text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  const isCvBuilderPage =
    fullPathname.includes('/tao-cv') ||
    fullPathname.includes('/cv-builder') ||
    fullPathname.includes('/danh-sach-mau-cv') ||
    fullPathname.includes('/ung-vien/trang-tri-cv');

  if (!botConfig || isCvBuilderPage) return null;

  const isOnlyGreeting = state.messages.length <= 1;

  return (
    <div className={`sq-chatbot ${state.isOpen ? 'is-open' : ''}`}>
      {/* Proactive Floating Teaser */}
      {!state.isOpen && showTeaser && !hasDismissedTeaser && (
        <div className="sq-chatbot__teaser" onClick={() => dispatch({ type: 'open' })}>
          <div className="sq-chatbot__teaser-content">
            <div className="sq-chatbot__teaser-avatar">
              <Image
                src={botIcon}
                alt={botTitle}
                width={18}
                height={18}
                className="sq-chatbot__teaser-avatar-img"
              />
            </div>
            <span className="sq-chatbot__teaser-text">
              {isEmployer ? `Tìm ứng viên tài năng cùng ${botTitle}?` : `Cần ${botTitle} gợi ý việc làm & sửa CV không?`}
            </span>
          </div>
          <button
            type="button"
            className="sq-chatbot__teaser-close"
            onClick={(e) => {
              e.stopPropagation();
              setHasDismissedTeaser(true);
            }}
            aria-label="Đóng gợi ý"
          >
            ×
          </button>
        </div>
      )}

      {/* Modern Circular Launcher Button */}
      <button
        className="sq-chatbot__launcher"
        type="button"
        onClick={() => dispatch({ type: 'toggle_open' })}
        aria-label={t('chat:chatbot.launcherAria')}
      >
        <span className="sq-chatbot__launcher-ring" />
        <span className="sq-chatbot__launcher-icon">
          {state.isOpen ? (
            <CloseRoundedIcon sx={{ fontSize: 24, color: '#ffffff' }} />
          ) : (
            <Image
              src={botIcon}
              alt={botTitle}
              width={34}
              height={34}
              className="sq-chatbot__launcher-avatar"
            />
          )}
        </span>
        {!state.isOpen && <span className="sq-chatbot__launcher-status" />}
      </button>

      {/* Main Chat Panel */}
      <dialog className="sq-chatbot__panel" open aria-label={t('chat:chatbot.panelAria')}>
        {/* Header */}
        <header className="sq-chatbot__header">
          <div className="sq-chatbot__brand">
            <div className="sq-chatbot__avatar">
              <Image
                src={botIcon}
                alt={botTitle}
                width={28}
                height={28}
                className="sq-chatbot__avatar-img"
              />
            </div>
            <div className="sq-chatbot__header-text">
              <div className="sq-chatbot__name">
                <span>{botTitle}</span>
                <span className="sq-chatbot__badge-ai">AI</span>
              </div>
              <div className="sq-chatbot__status">
                <span className="sq-chatbot__status-dot" />
                <span className="sq-chatbot__status-label">{botSubtitle}</span>
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
              title="Thu nhỏ cửa sổ"
            >
              <CloseRoundedIcon fontSize="small" />
            </button>
          </div>
        </header>

        {/* Message Thread */}
        <div className="sq-chatbot__messages" ref={listRef}>
          {state.messages.map((message) => (
            <div key={message.id} className={`sq-chatbot__message sq-chatbot__message--${message.role}`}>
              {message.role === 'assistant' && (
                <div className="sq-chatbot__msg-avatar" aria-hidden="true">
                  <Image
                    src={botIcon}
                    alt={botTitle}
                    width={22}
                    height={22}
                    className="sq-chatbot__msg-avatar-img"
                  />
                </div>
              )}

              <div className="sq-chatbot__bubble-wrapper">
                <div className="sq-chatbot__bubble">
                  {message.role === 'assistant' ? (
                    <MessageResponse enableRich={true}>{message.content}</MessageResponse>
                  ) : (
                    message.content
                  )}
                </div>

                {message.role === 'assistant' && message.id !== 'greeting' && (
                  <div className="sq-chatbot__msg-actions">
                    <button
                      type="button"
                      className="sq-chatbot__action-pill"
                      onClick={() => handleCopy(message.content, message.id)}
                      title="Sao chép nội dung"
                    >
                      {copiedId === message.id ? (
                        <>
                          <CheckRoundedIcon sx={{ fontSize: 13, color: '#16a34a' }} />
                          <span>Đã chép</span>
                        </>
                      ) : (
                        <>
                          <ContentCopyRoundedIcon sx={{ fontSize: 13 }} />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* 2x2 Quick Action Cards on Welcome Screen */}
          {isOnlyGreeting && (
            <div className="sq-chatbot__suggestions-container">
              <div className="sq-chatbot__suggestions-title">
                <span>Gợi ý tác vụ nhanh:</span>
              </div>
              <div className="sq-chatbot__action-grid">
                {actionCards.map((card, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="sq-chatbot__action-card"
                    onClick={() => handleSuggestionClick(card.prompt)}
                    disabled={state.isSending}
                  >
                    <div className="sq-chatbot__action-card-header">
                      <span className="sq-chatbot__action-card-icon">{card.icon}</span>
                      <span className="sq-chatbot__action-card-arrow">↗</span>
                    </div>
                    <div className="sq-chatbot__action-card-title">{card.title}</div>
                    <div className="sq-chatbot__action-card-desc">{card.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Typing Animation */}
          {state.isSending && (
            <div className="sq-chatbot__message sq-chatbot__message--assistant">
              <div className="sq-chatbot__msg-avatar" aria-hidden="true">
                <Image
                  src={botIcon}
                  alt={botTitle}
                  width={22}
                  height={22}
                  className="sq-chatbot__msg-avatar-img"
                />
              </div>
              <div className="sq-chatbot__bubble sq-chatbot__bubble--typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
        </div>

        {/* Input Composer & Disclaimer */}
        <div className="sq-chatbot__footer">
          <form className="sq-chatbot__composer" onSubmit={handleSend}>
            <input
              ref={inputRef}
              type="text"
              aria-label={t('chat:chatbot.placeholder')}
              placeholder={isEmployer ? 'Hỏi về ứng viên, JD, đãi ngộ...' : 'Hỏi về việc làm, CV, phỏng vấn...'}
              value={state.input}
              onChange={(event) => dispatch({ type: 'set_input', value: event.target.value })}
              disabled={state.isSending}
            />
            <button
              type="submit"
              disabled={!state.input.trim() || state.isSending}
              aria-label={t('chat:send')}
              className={`sq-chatbot__send-btn ${state.input.trim() ? 'is-active' : ''}`}
            >
              <SendRoundedIcon sx={{ fontSize: 18 }} />
            </button>
          </form>

          <div className="sq-chatbot__disclaimer">
            <span>✨ Được hỗ trợ bởi {botTitle} • Thông tin mang tính chất tham khảo</span>
          </div>

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
        </div>
      </dialog>
    </div>
  );
};

export default ChatBot;
