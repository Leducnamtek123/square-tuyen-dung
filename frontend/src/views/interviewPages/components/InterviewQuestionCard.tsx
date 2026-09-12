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
      <div className="relative mx-auto w-full max-w-2xl px-3 transition-all duration-300">
        {/* Floating Toggle Buttons for Mobile/Tablet */}
        <div className="mb-2 flex items-center justify-between gap-2">
          <button
            type="button"
            data-tour="interview-hints"
            onClick={onToggleHints}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all shadow-sm active:scale-95 ${
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
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all shadow-sm active:scale-95 ${
              roadmapDrawerOpen
                ? 'border-indigo-400 bg-indigo-50 text-indigo-800 ring-1 ring-indigo-300'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <FontAwesomeIcon icon={faMapLocationDot} className="text-indigo-600" />
            <span>Lộ trình: {currentIndex + 1}/{totalQuestions}</span>
          </button>
        </div>

        {/* Main Question Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-2xl sm:p-5">
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

          {/* Header Badges: Question Index & Countdown Timer */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-800 border border-slate-200">
                Câu {currentIndex + 1} / {totalQuestions || 1}
              </span>
              {displayCategory && (
                <span className="hidden rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700 border border-sky-200/80 sm:inline-block">
                  {displayCategory}
                </span>
              )}
            </div>

          {/* Countdown Clock */}
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-mono font-black tracking-wider transition-all border ${
              isLowTime
                ? 'border-rose-300 bg-rose-50 text-rose-700 animate-pulse ring-1 ring-rose-200 shadow-sm'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            <FontAwesomeIcon
              icon={faClock}
              className={isLowTime ? 'text-rose-500' : 'text-emerald-600'}
            />
            <span>{formattedTime}</span>
          </div>
        </div>

        {/* Question Text */}
        <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-900 sm:text-base">
          {question.text}
        </p>

        {/* Action Controls Footer */}
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
            <span className="hidden text-[11px] font-medium text-slate-600 sm:inline-block">
              Trả lời qua micro • Hệ thống tự động ghi nhận
            </span>
          </div>

          {/* Next / Finish Answer Button */}
          <button
            type="button"
            onClick={onNextQuestion}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
          >
            {currentIndex < totalQuestions - 1 ? (
              <>
                <span>Xong câu này</span>
                <FontAwesomeIcon icon={faForwardStep} className="text-[11px]" />
              </>
            ) : (
              <>
                <span>Hoàn thành phỏng vấn</span>
                <FontAwesomeIcon icon={faCheck} className="text-[11px]" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewQuestionCard;
