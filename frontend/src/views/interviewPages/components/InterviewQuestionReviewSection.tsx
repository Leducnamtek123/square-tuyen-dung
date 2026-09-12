'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import MicOutlinedIcon from '@mui/icons-material/MicOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';

export interface QuestionReviewItem {
  id?: string | number;
  questionNumber: number;
  text: string;
  category?: string;
  score?: number | null; // 0 - 100
  feedback?: string | null;
  strengths?: string[];
  weaknesses?: string[];
  suggestedAnswer?: string | null;
  isCompleted?: boolean;
}

export interface InterviewQuestionReviewSectionProps {
  questions: QuestionReviewItem[];
  onRetryQuestion?: (question: QuestionReviewItem) => void;
  className?: string;
}

export const InterviewQuestionReviewSection: React.FC<InterviewQuestionReviewSectionProps> = ({
  questions = [],
  onRetryQuestion,
  className = '',
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  if (!questions || questions.length === 0) {
    return null;
  }

  const activeQuestion = questions[selectedIndex] || questions[0];
  const completedCount = questions.filter((q) => (q.score != null && q.score > 0) || q.isCompleted).length;

  return (
    <div className={`grid grid-cols-1 gap-6 lg:grid-cols-12 ${className}`}>
      {/* ─── Left Column: Question List ───────────────────────────────────── */}
      <div className="flex flex-col gap-3 lg:col-span-5">
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h4 className="text-sm font-bold text-slate-900 md:text-base">
              Câu hỏi
            </h4>
            <p className="text-xs font-medium text-slate-500">
              {completedCount}/{questions.length} câu hỏi đã hoàn thành
            </p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <FormatListBulletedIcon sx={{ fontSize: 18 }} />
          </div>
        </div>

        {/* Scrollable / Vertical question items */}
        <div className="flex flex-col gap-2.5 max-h-[580px] overflow-y-auto pr-1">
          {questions.map((q, idx) => {
            const isSelected = idx === selectedIndex;
            const score = q.score != null ? Math.round(q.score) : 0;
            const hasScore = q.score != null && q.score > 0;

            return (
              <button
                key={`q-item-${q.id || idx}`}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`group relative flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/40 shadow-xs ring-1 ring-blue-500/20'
                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                }`}
              >
                {/* Q badge */}
                <span
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-xs font-extrabold transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                  }`}
                >
                  Q{q.questionNumber || idx + 1}
                </span>

                {/* Text preview */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`line-clamp-2 text-xs font-semibold leading-relaxed transition-colors ${
                      isSelected ? 'text-blue-950 font-bold' : 'text-slate-700'
                    }`}
                  >
                    {q.text}
                  </p>
                </div>

                {/* Score badge */}
                <span
                  className={`flex-shrink-0 rounded-lg border px-2 py-0.5 text-xs font-extrabold tabular-nums ${
                    hasScore
                      ? score >= 70
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : score >= 50
                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                        : 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-slate-200 bg-slate-50 text-slate-400'
                  }`}
                >
                  {score}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Right Column: Selected Question Drilldown ────────────────────── */}
      <div className="lg:col-span-7">
        <div className="relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm min-h-[420px] md:p-8">
          <div>
            {/* Header: Question label & Score /100 */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-blue-600">
                  Q{activeQuestion.questionNumber || selectedIndex + 1}
                </span>
                {activeQuestion.category && (
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    {activeQuestion.category}
                  </span>
                )}
              </div>

              {/* Big score */}
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-rose-600 tabular-nums">
                  {activeQuestion.score != null ? Math.round(activeQuestion.score) : 0}
                </span>
                <span className="text-xs font-semibold text-slate-400">/ 100</span>
              </div>
            </div>

            {/* Question Text */}
            <div className="py-5">
              <h3 className="text-base font-bold leading-snug text-slate-900 md:text-lg">
                {activeQuestion.text}
              </h3>
            </div>

            {/* AI Feedback & Analysis */}
            <div className="space-y-4">
              {activeQuestion.feedback ? (
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4">
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                    <AutoAwesomeIcon sx={{ fontSize: 15, color: '#2563eb' }} />
                    Nhận xét chi tiết từ AI
                  </div>
                  <p className="text-xs font-medium leading-relaxed text-slate-700 md:text-sm">
                    {activeQuestion.feedback}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
                  Chưa có nhận xét chi tiết cho câu hỏi này. Bạn có thể thử lại để cải thiện câu trả lời.
                </div>
              )}

              {/* Strengths / Suggestions if available */}
              {activeQuestion.suggestedAnswer && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <LightbulbOutlinedIcon sx={{ fontSize: 16, color: '#059669' }} />
                    Gợi ý cấu trúc trả lời mẫu STAR
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed">
                    {activeQuestion.suggestedAnswer}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action: "Muốn cải thiện điểm số? -> Thử lại câu này" */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row">
            <span className="text-xs font-medium text-slate-500">
              Muốn cải thiện điểm số?
            </span>

            <div className="flex items-center gap-3">
              {/* Optional mic/listen icon */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                title="Ghi âm giọng nói"
              >
                <MicOutlinedIcon sx={{ fontSize: 18 }} />
              </Button>

              {/* Retry this question button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRetryQuestion?.(activeQuestion)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/90 px-4 text-xs font-semibold text-blue-700 shadow-2xs hover:bg-blue-100 transition-all h-9 active:scale-98"
              >
                <ReplayRoundedIcon sx={{ fontSize: 16 }} />
                <span>Thử lại câu này</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewQuestionReviewSection;
