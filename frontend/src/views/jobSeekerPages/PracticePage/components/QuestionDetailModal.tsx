'use client';

import React from 'react';
import {
  X,
  Clock,
  Lightbulb,
  Target,
  AlertTriangle,
  HelpCircle,
  Layers,
  Sparkles,
} from 'lucide-react';
import { QuestionBankItem } from '@/types/models';

interface QuestionDetailModalProps {
  open: boolean;
  question: QuestionBankItem | null;
  onClose: () => void;
  onPracticeQuestion?: (question: QuestionBankItem) => void;
  isStarting?: boolean;
}

export const QuestionDetailModal: React.FC<QuestionDetailModalProps> = ({
  open,
  question,
  onClose,
  onPracticeQuestion,
  isStarting = false,
}) => {
  if (!open || !question) return null;

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '02:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getSeniorityBadge = (seniority?: string) => {
    switch (seniority) {
      case 'senior':
      case 'lead':
        return { label: 'Senior / Quản lý', bg: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'middle':
        return { label: 'Trung cấp (Middle)', bg: 'bg-blue-100 text-blue-700 border-blue-200' };
      default:
        return { label: 'Junior / Mới bắt đầu', bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    }
  };

  const seniority = getSeniorityBadge(question.seniority);
  const steps = question.answer_structure?.steps || [];
  const tips = question.important_tips || [];
  const followUps = question.follow_up_questions || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-question-title"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 bg-gradient-to-r from-sky-50/50 via-white to-indigo-50/50 p-6">
          <div className="pr-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${seniority.bg}`}>
                {seniority.label}
              </span>
              {question.category && (
                <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                  {question.category}
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                <Clock className="h-3 w-3" />
                Thời lượng khuyến nghị: {formatDuration(question.default_duration_seconds)}
              </span>
            </div>
            <h2 id="modal-question-title" className="text-lg md:text-xl font-bold text-slate-900 leading-snug">
              {question.question_text}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            aria-label="Đóng modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Interviewer Intent */}
          {question.interviewer_intent && (
            <div className="rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50/40 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Target className="h-4 w-4 text-sky-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-sky-900">
                  Mục đích của Người phỏng vấn
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                {question.interviewer_intent}
              </p>
            </div>
          )}

          {/* Answer Structure */}
          {question.answer_structure && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Cấu trúc Dàn bài Trả lời Gợi ý
                </h3>
              </div>

              <div className="relative pl-6 space-y-4 border-l-2 border-indigo-100 ml-2">
                {/* START */}
                {question.answer_structure.start && (
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-black text-white shadow-sm ring-4 ring-white">
                      S
                    </div>
                    <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-3">
                      <div className="text-xs font-bold text-indigo-700 mb-0.5">MỞ ĐẦU (START)</div>
                      <p className="text-sm text-slate-700">{question.answer_structure.start}</p>
                    </div>
                  </div>
                )}

                {/* Steps */}
                {steps.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[31px] top-0 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-black text-white shadow-sm ring-4 ring-white">
                      {step.step || idx + 1}
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-xs">
                      <div className="text-xs font-bold text-slate-900 mb-1">{step.title}</div>
                      <p className="text-sm text-slate-600">{step.guidance}</p>
                    </div>
                  </div>
                ))}

                {/* END */}
                {question.answer_structure.end && (
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white shadow-sm ring-4 ring-white">
                      E
                    </div>
                    <div className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-3">
                      <div className="text-xs font-bold text-emerald-700 mb-0.5">KẾT LUẬN (END)</div>
                      <p className="text-sm text-slate-700">{question.answer_structure.end}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Important Tips */}
          {tips.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Mẹo Quan Trọng &amp; Lời Khuyên
                </h3>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {tips.map((tip, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border p-3 text-xs leading-relaxed ${
                      tip.type === 'do'
                        ? 'border-emerald-200 bg-emerald-50/60 text-emerald-900'
                        : 'border-rose-200 bg-rose-50/60 text-rose-900'
                    }`}
                  >
                    <span className="font-bold mr-1">
                      {tip.type === 'do' ? '✓ NÊN:' : '✕ TRÁNH:'}
                    </span>
                    {tip.content}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up Traps */}
          {followUps.length > 0 && (
            <div className="space-y-2.5 rounded-xl border border-amber-200/80 bg-amber-50/40 p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Câu Hỏi Mở Rộng / Đào Sâu Của Nhà Tuyển Dụng
                </h3>
              </div>
              <ul className="space-y-2">
                {followUps.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <HelpCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-xs"
          >
            Đóng
          </button>

          {onPracticeQuestion && (
            <button
              onClick={() => onPracticeQuestion(question)}
              disabled={isStarting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-sky-500/20 hover:from-sky-500 hover:to-indigo-500 transition disabled:opacity-60"
            >
              {isStarting ? (
                <>
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang khởi tạo phòng phỏng vấn...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Luyện tập câu này trong Mock Interview
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailModal;
