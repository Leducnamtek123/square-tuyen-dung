import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faLightbulb,
  faMapLocationDot,
  faForwardStep,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import type { Question } from '@/types/models';

export interface InterviewQuestionCardProps {
  question: Question | null;
  currentIndex: number;
  totalQuestions: number;
  formattedTime: string;
  isLowTime: boolean;
  progressPercent: number;
  hintsDrawerOpen: boolean;
  roadmapDrawerOpen: boolean;
  onToggleHints: () => void;
  onToggleRoadmap: () => void;
  onExtendTime?: () => void;
  onNextQuestion: () => void;
}

export const InterviewQuestionCard: React.FC<InterviewQuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  formattedTime,
  isLowTime,
  progressPercent,
  hintsDrawerOpen,
  roadmapDrawerOpen,
  onToggleHints,
  onToggleRoadmap,
  onExtendTime: _onExtendTime,
  onNextQuestion,
}) => {
  if (!question) return null;

    const rawCategory = (question.category_display || question.category || '').trim();
    const isUncategorized = !rawCategory || rawCategory.toUpperCase() === 'UNCATEGORIZED' || rawCategory.toUpperCase() === 'CHƯA PHÂN LOẠI';
    const categoryMap: Record<string, string> = {
      technical: 'Chuyên môn',
      behavioral: 'Tình huống',
      soft_skills: 'Kỹ năng mềm',
      general: 'Tổng quan',
      situational: 'Xử lý tình huống',
      culture_fit: 'Phù hợp văn hoá',
    };
    const displayCategory = isUncategorized ? null : (categoryMap[rawCategory.toLowerCase()] || rawCategory);

    return (
      <div className="relative mx-auto w-full max-w-2xl px-2 sm:px-3 transition-all duration-300">
        {/* Toggle Buttons for Tablet/Desktop */}
        <div className="mb-2 hidden sm:flex items-center justify-between gap-2">
          <button
            type="button"
            data-tour="interview-hints"
            onClick={onToggleHints}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
              hintsDrawerOpen
                ? 'border-amber-400 bg-amber-50 text-amber-800 ring-1 ring-amber-300'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <FontAwesomeIcon icon={faLightbulb} className="text-amber-500" />
            <span>Gợi ý trả lời</span>
          </button>

          <button
            type="button"
            data-tour="interview-roadmap"
            onClick={onToggleRoadmap}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer ${
              roadmapDrawerOpen
                ? 'border-indigo-400 bg-indigo-50 text-indigo-800 ring-1 ring-indigo-300'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <FontAwesomeIcon icon={faMapLocationDot} className="text-indigo-600" />
            <span>Lộ trình: {currentIndex + 1}/{totalQuestions}</span>
          </button>
        </div>

        {/* Main Question Card - Mobile optimized compact padding */}
        <div data-testid="interview-question-card" className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 bg-white/95 p-3 sm:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-2xl">
          {/* Top Progress Bar */}
          <div className="absolute top-0 inset-x-0 h-1 bg-slate-100">
            <div
              className={`h-full transition-all duration-500 ${
                isLowTime
                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Header Badges: Question Index, Countdown Timer, & Mobile Drawer Quick Toggles */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-extrabold text-slate-800 border border-slate-200 shrink-0">
                Câu {currentIndex + 1}/{totalQuestions || 1}
              </span>
              {displayCategory && (
                <span className="hidden rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700 border border-sky-200/80 md:inline-block">
                  {displayCategory}
                </span>
              )}
            </div>

            {/* Mobile-only Quick Drawer Buttons */}
            <div className="flex items-center gap-1.5 sm:hidden">
              <button
                type="button"
                onClick={onToggleHints}
                aria-label="Mở gợi ý trả lời"
                className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-bold transition-all active:scale-95 cursor-pointer ${
                  hintsDrawerOpen
                    ? 'border-amber-400 bg-amber-50 text-amber-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FontAwesomeIcon icon={faLightbulb} className="text-amber-500 text-[10px]" />
                <span>Gợi ý</span>
              </button>
              <button
                type="button"
                onClick={onToggleRoadmap}
                aria-label="Mở lộ trình câu hỏi"
                className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-bold transition-all active:scale-95 cursor-pointer ${
                  roadmapDrawerOpen
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FontAwesomeIcon icon={faMapLocationDot} className="text-indigo-600 text-[10px]" />
                <span>Lộ trình</span>
              </button>
            </div>

            {/* Countdown Clock */}
            <div
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-mono font-black tracking-wider transition-all border shrink-0 ${
                isLowTime
                  ? 'border-rose-300 bg-rose-50 text-rose-700 animate-pulse ring-1 ring-rose-200 shadow-sm'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              <FontAwesomeIcon
                icon={faClock}
                className={`text-[10px] sm:text-xs ${isLowTime ? 'text-rose-500' : 'text-emerald-600'}`}
              />
              <span>{formattedTime}</span>
            </div>
          </div>

          {/* Question Text */}
          <p data-testid="interview-question-text" className="mt-2 text-xs sm:text-sm md:text-base font-semibold leading-snug sm:leading-relaxed text-slate-900">
            {question.text}
          </p>

          {/* Action Controls Footer */}
          <div className="mt-2.5 sm:mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-2 sm:pt-3">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-500 min-w-0">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-600 truncate">
                <span className="sm:hidden">Đàm thoại tự nhiên</span>
                <span className="hidden sm:inline">Đàm thoại giọng nói tự nhiên • AI tự lắng nghe & chuyển câu</span>
              </span>
            </div>

            {/* Next / Finish Answer Button (Secondary action in Pure Voice mode) */}
            <button
              type="button"
              onClick={onNextQuestion}
              title="Chuyển câu hỏi thủ công nếu muốn"
              aria-label="Chuyển câu hỏi"
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-slate-700 shadow-2xs hover:shadow-xs transition-all active:scale-[0.98] cursor-pointer shrink-0"
            >
              {currentIndex < totalQuestions - 1 ? (
                <>
                  <span>Chuyển câu</span>
                  <FontAwesomeIcon icon={faForwardStep} className="text-[10px] sm:text-[11px] text-slate-400" />
                </>
              ) : (
                <>
                  <span>Hoàn thành</span>
                  <FontAwesomeIcon icon={faCheck} className="text-[10px] sm:text-[11px] text-emerald-600" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
  );
};

export default InterviewQuestionCard;
