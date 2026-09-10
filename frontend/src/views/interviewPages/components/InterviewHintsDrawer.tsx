import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLightbulb,
  faXmark,
  faClock,
  faExclamationTriangle,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons';
import type { Question } from '@/types/models';

export interface InterviewHintsDrawerProps {
  open: boolean;
  onClose: () => void;
  question: Question | null;
}

export const InterviewHintsDrawer: React.FC<InterviewHintsDrawerProps> = ({
  open,
  onClose,
  question,
}) => {
  if (!open) return null;

  const answerStructure = question?.answer_structure;
  const tips = question?.important_tips || [];
  const followUps = question?.follow_up_questions || [];
  const intent = question?.interviewer_intent;

  return (
    <aside
      aria-label="Gợi ý trả lời"
      className="absolute top-0 left-0 z-40 flex h-full w-full flex-col border-r border-slate-800 bg-slate-950/95 text-slate-100 shadow-2xl backdrop-blur-xl transition-all duration-300 sm:w-[360px] md:w-[400px]"
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-800 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
            <FontAwesomeIcon icon={faLightbulb} className="text-base" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white">Gợi ý trả lời</h3>
            <p className="text-[11px] text-slate-400">Dàn ý & mẹo phỏng vấn chuẩn</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng gợi ý"
          className="flex size-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <FontAwesomeIcon icon={faXmark} className="text-sm" />
        </button>
      </div>

      {/* Content scroll area */}
      <div className="flex-1 space-y-6 overflow-y-auto p-5 text-sm">
        {/* Interviewer Intent */}
        {intent && (
          <div className="rounded-xl border border-sky-500/20 bg-sky-950/30 p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
              <FontAwesomeIcon icon={faQuestionCircle} />
              <span>Interviewer đang đánh giá gì?</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">{intent}</p>
          </div>
        )}

        {/* Answer Structure */}
        {answerStructure ? (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-4 w-1 rounded bg-amber-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Cấu trúc câu trả lời
              </h4>
            </div>

            <div className="space-y-3">
              {/* START */}
              {answerStructure.start && (
                <div className="relative rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3.5">
                  <span className="inline-block rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-emerald-400">
                    START
                  </span>
                  <p className="mt-1.5 text-xs text-slate-200">{answerStructure.start}</p>
                </div>
              )}

              {/* STEPS */}
              {answerStructure.steps?.map((stepItem) => (
                <div
                  key={stepItem.step}
                  className="relative rounded-xl border border-slate-800 bg-slate-900/60 p-3.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-amber-500/20 text-[11px] font-bold text-amber-400">
                      {stepItem.step}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      Bước {stepItem.step}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                    {stepItem.title}
                  </p>
                  {stepItem.detail && (
                    <p className="mt-1 text-[11px] text-slate-400">{stepItem.detail}</p>
                  )}
                </div>
              ))}

              {/* END */}
              {answerStructure.end && (
                <div className="relative rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3.5">
                  <span className="inline-block rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-cyan-400">
                    END
                  </span>
                  <p className="mt-1.5 text-xs text-slate-200">{answerStructure.end}</p>
                </div>
              )}

              {/* Time guidance */}
              {answerStructure.time_guidance && (
                <div className="flex items-center gap-2 rounded-lg bg-slate-900/80 px-3 py-2 text-[11px] text-amber-300/90">
                  <FontAwesomeIcon icon={faClock} className="text-amber-400" />
                  <span>{answerStructure.time_guidance}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-center text-xs text-slate-400">
            Chưa có dàn bài gợi ý chi tiết cho câu hỏi này. Hãy trả lời theo cấu trúc Mở - Thân - Kết.
          </div>
        )}

        {/* Important Tips */}
        {tips.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-4 w-1 rounded bg-rose-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Mẹo quan trọng
              </h4>
            </div>

            <div className="space-y-2.5">
              {tips.map((tip, idx) => {
                const isHigh = tip.priority === 'HIGH';
                const isMedium = tip.priority === 'MEDIUM';
                return (
                  <div
                    key={idx}
                    className="flex gap-2.5 rounded-xl border border-slate-800 bg-slate-900/60 p-3"
                  >
                    <span
                      className={`inline-flex h-5 shrink-0 items-center justify-center rounded px-1.5 text-[9px] font-black uppercase tracking-wider ${
                        isHigh
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : isMedium
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      }`}
                    >
                      {tip.priority}
                    </span>
                    <p className="text-xs leading-relaxed text-slate-300">{tip.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Follow-up Questions */}
        {followUps.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-4 w-1 rounded bg-indigo-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Câu hỏi follow-up có thể gặp
              </h4>
            </div>

            <div className="space-y-2">
              {followUps.map((q, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3 text-xs leading-relaxed text-slate-300"
                >
                  <span className="mr-1.5 font-bold text-indigo-400">{idx + 1}.</span>
                  {q}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default InterviewHintsDrawer;
