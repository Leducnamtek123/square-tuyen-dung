import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faLightbulb,
  faMapLocationDot,
  faPlus,
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
  onExtendTime: () => void;
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
  onExtendTime,
  onNextQuestion,
}) => {
  if (!question) return null;

  return (
    <div className="relative mx-auto w-full max-w-2xl px-3 transition-all duration-300">
      {/* Floating Toggle Buttons for Mobile/Tablet */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onToggleHints}
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all shadow-md active:scale-95 ${
            hintsDrawerOpen
              ? 'border-amber-500/50 bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30'
              : 'border-slate-800 bg-slate-900/90 text-slate-300 hover:border-slate-700 hover:text-white'
          }`}
        >
          <FontAwesomeIcon icon={faLightbulb} className="text-amber-400" />
          <span>Gợi ý trả lời</span>
        </button>

        <button
          type="button"
          onClick={onToggleRoadmap}
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all shadow-md active:scale-95 ${
            roadmapDrawerOpen
              ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30'
              : 'border-slate-800 bg-slate-900/90 text-slate-300 hover:border-slate-700 hover:text-white'
          }`}
        >
          <FontAwesomeIcon icon={faMapLocationDot} className="text-indigo-400" />
          <span>Lộ trình ({currentIndex + 1}/{totalQuestions})</span>
        </button>
      </div>

      {/* Main Question Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/90 p-4 shadow-2xl backdrop-blur-2xl sm:p-5">
        {/* Top Progress Bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-slate-800">
          <div
            className={`h-full transition-all duration-500 ${
              isLowTime
                ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Header Badges: Question Index & Countdown Timer */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-extrabold text-slate-200 border border-slate-700">
              Câu {currentIndex + 1} / {totalQuestions || 1}
            </span>
            {question.category && (
              <span className="hidden rounded-full bg-slate-800/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:inline-block">
                {question.category_display || question.category}
              </span>
            )}
          </div>

          {/* Countdown Clock */}
          <div
            className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-mono font-black tracking-wider transition-all border ${
              isLowTime
                ? 'border-rose-500/50 bg-rose-500/20 text-rose-300 animate-pulse ring-1 ring-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                : 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300'
            }`}
          >
            <FontAwesomeIcon
              icon={faClock}
              className={isLowTime ? 'text-rose-400' : 'text-emerald-400'}
            />
            <span>{formattedTime}</span>
          </div>
        </div>

        {/* Question Text */}
        <p className="mt-3 text-sm font-semibold leading-relaxed text-white sm:text-base">
          {question.text}
        </p>

        {/* Action Controls Footer */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3">
          {/* Extend Time Button */}
          <button
            type="button"
            onClick={onExtendTime}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-bold text-amber-300 transition hover:bg-slate-700 active:scale-95"
          >
            <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
            <span>Thêm 30s</span>
          </button>

          {/* Next / Finish Answer Button */}
          <button
            type="button"
            onClick={onNextQuestion}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-sky-500/20 transition hover:opacity-90 active:scale-95"
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
