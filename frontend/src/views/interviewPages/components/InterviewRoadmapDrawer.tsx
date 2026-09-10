import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapLocationDot,
  faXmark,
  faCheckCircle,
  faCircleDot,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import type { Question } from '@/types/models';

export interface InterviewRoadmapDrawerProps {
  open: boolean;
  onClose: () => void;
  questions: Question[];
  currentIndex: number;
  onSelectQuestion: (index: number) => void;
  completedIds: Set<number>;
}

export const InterviewRoadmapDrawer: React.FC<InterviewRoadmapDrawerProps> = ({
  open,
  onClose,
  questions,
  currentIndex,
  onSelectQuestion,
  completedIds,
}) => {
  if (!open) return null;

  // Group questions by section
  const categoryGroups = [
    {
      title: 'PHÙ HỢP VĂN HÓA & MỤC TIÊU',
      categories: ['general', 'soft_skills'],
    },
    {
      title: 'KỸ NĂNG CHUYÊN MÔN',
      categories: ['technical'],
    },
    {
      title: 'HÀNH VI & XỬ LÝ TÌNH HUỐNG',
      categories: ['behavioral', 'situational'],
    },
  ];

  return (
    <aside
      aria-label="Lộ trình phỏng vấn"
      className="absolute top-0 right-0 z-40 flex h-full w-full flex-col border-l border-slate-800 bg-slate-950/95 text-slate-100 shadow-2xl backdrop-blur-xl transition-all duration-300 sm:w-[340px] md:w-[380px]"
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-800 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
            <FontAwesomeIcon icon={faMapLocationDot} className="text-base" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white">Lộ trình phỏng vấn</h3>
            <p className="text-[11px] text-slate-400">
              Bước {currentIndex + 1} / {questions.length || 1}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng lộ trình"
          className="flex size-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <FontAwesomeIcon icon={faXmark} className="text-sm" />
        </button>
      </div>

      {/* Grouped Question List */}
      <div className="flex-1 space-y-6 overflow-y-auto p-5">
        {categoryGroups.map((group) => {
          const groupQuestions = questions
            .map((q, origIdx) => ({ question: q, origIdx }))
            .filter(({ question }) => group.categories.includes(question.category || 'general'));

          if (groupQuestions.length === 0) return null;

          const completedCount = groupQuestions.filter(({ question }) =>
            completedIds.has(question.id)
          ).length;

          return (
            <div key={group.title} className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {group.title}
                </h4>
                <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-slate-400 border border-slate-800">
                  {completedCount}/{groupQuestions.length}
                </span>
              </div>

              <div className="space-y-2">
                {groupQuestions.map(({ question, origIdx }) => {
                  const isCurrent = origIdx === currentIndex;
                  const isDone = completedIds.has(question.id);

                  return (
                    <button
                      key={question.id || origIdx}
                      type="button"
                      onClick={() => onSelectQuestion(origIdx)}
                      className={`group flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                        isCurrent
                          ? 'border-indigo-500/50 bg-indigo-950/40 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/30'
                          : isDone
                          ? 'border-emerald-500/20 bg-emerald-950/10 hover:bg-emerald-950/20'
                          : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80'
                      }`}
                    >
                      {/* State Icon */}
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="text-emerald-400 text-sm"
                          />
                        ) : isCurrent ? (
                          <div className="flex size-4 items-center justify-center">
                            <span className="relative flex size-2.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                              <span className="relative inline-flex size-2.5 rounded-full bg-indigo-500" />
                            </span>
                          </div>
                        ) : (
                          <span className="flex size-4 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-400">
                            {origIdx + 1}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-slate-400">
                            Câu {origIdx + 1}
                          </span>
                          {isCurrent && (
                            <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-indigo-300">
                              ĐANG LÀM
                            </span>
                          )}
                          {isDone && !isCurrent && (
                            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-400">
                              Hoàn thành
                            </span>
                          )}
                        </div>
                        <p
                          className={`mt-1 line-clamp-2 text-xs leading-relaxed ${
                            isCurrent
                              ? 'font-medium text-white'
                              : isDone
                              ? 'text-slate-300'
                              : 'text-slate-400'
                          }`}
                        >
                          {question.text}
                        </p>
                      </div>

                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className={`mt-1 text-[10px] transition-transform group-hover:translate-x-0.5 ${
                          isCurrent ? 'text-indigo-400' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default InterviewRoadmapDrawer;
