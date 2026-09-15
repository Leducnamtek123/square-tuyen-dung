import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapLocationDot,
  faXmark,
  faCheckCircle,
  faChevronRight,
  faUsers,
  faLaptopCode,
  faUserCheck,
  faPuzzlePiece,
  faListCheck,
} from '@fortawesome/free-solid-svg-icons';
import type { Question } from '@/types/models';
import { getQuestionShortTitle } from '@/utils/transformers';

export interface InterviewRoadmapDrawerProps {
  open: boolean;
  onClose: () => void;
  questions: Question[];
  currentIndex: number;
  onSelectQuestion: (index: number) => void;
  completedIds: Set<number>;
}

interface RoadmapStageDef {
  key: string;
  title: string;
  badgeLabel: string;
  icon: any;
  categories: string[];
}

const ROADMAP_STAGES: RoadmapStageDef[] = [
  {
    key: 'culture_fit',
    title: 'PHÙ HỢP VĂN HÓA',
    badgeLabel: 'PHÙ HỢP VĂN HÓA',
    icon: faUsers,
    categories: ['culture_fit', 'general', 'soft_skills'],
  },
  {
    key: 'technical',
    title: 'KỸ NĂNG CHUYÊN MÔN',
    badgeLabel: 'KỸ NĂNG CHUYÊN MÔN',
    icon: faLaptopCode,
    categories: ['technical'],
  },
  {
    key: 'behavioral',
    title: 'HÀNH VI',
    badgeLabel: 'HÀNH VI',
    icon: faUserCheck,
    categories: ['behavioral'],
  },
  {
    key: 'problem_solving',
    title: 'GIẢI QUYẾT VẤN ĐỀ',
    badgeLabel: 'GIẢI QUYẾT VẤN ĐỀ',
    icon: faPuzzlePiece,
    categories: ['situational', 'problem_solving'],
  },
];

export const InterviewRoadmapDrawer: React.FC<InterviewRoadmapDrawerProps> = ({
  open,
  onClose,
  questions,
  currentIndex,
  onSelectQuestion,
  completedIds,
}) => {
  if (!open) return null;

  const totalQuestions = questions.length || 1;

  // Group questions into stages
  const knownCategories = new Set(ROADMAP_STAGES.flatMap((s) => s.categories));
  const fallbackQuestions = questions
    .map((q, origIdx) => ({ question: q, origIdx }))
    .filter(({ question }) => {
      const cat = (question.category || '').toLowerCase();
      return !knownCategories.has(cat);
    });

  const allStages = [
    ...ROADMAP_STAGES.map((stage) => ({
      ...stage,
      items: questions
        .map((q, origIdx) => ({ question: q, origIdx }))
        .filter(({ question }) =>
          stage.categories.includes((question.category || '').toLowerCase())
        ),
    })),
    ...(fallbackQuestions.length > 0
      ? [
          {
            key: 'other',
            title: 'CÂU HỎI PHỎNG VẤN',
            badgeLabel: 'PHỎNG VẤN',
            icon: faListCheck,
            categories: [],
            items: fallbackQuestions,
          },
        ]
      : []),
  ].filter((s) => s.items.length > 0);

  return (
    <aside
      aria-label="Lộ trình phỏng vấn"
      className="absolute top-0 right-0 z-40 flex h-full w-full flex-col border-l border-slate-200 bg-white text-slate-900 shadow-2xl transition-all duration-300 sm:w-[360px] md:w-[400px]"
    >
      {/* Header matching reference: Map icon, Lộ trình phỏng vấn, Bước X / Y */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <FontAwesomeIcon icon={faMapLocationDot} className="text-base" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-slate-900">
              Lộ trình phỏng vấn
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Theo dõi các chặng câu hỏi & đánh giá
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-md bg-blue-50 border border-blue-200/80 px-2.5 py-1 text-xs font-bold text-blue-700">
            Bước {currentIndex + 1} / {totalQuestions}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng lộ trình"
            className="flex size-9 sm:size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
          >
            <FontAwesomeIcon icon={faXmark} className="text-sm" />
          </button>
        </div>
      </div>

      {/* Grouped Question Stages */}
      <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-5 pb-[max(1.5rem,env(safe-area-inset-bottom)+1rem)]">
        {allStages.map((stage) => {
          const stageQuestions = stage.items;
          const completedCount = stageQuestions.filter(({ question }) =>
            completedIds.has(question.id)
          ).length;

          return (
            <div key={stage.key} className="space-y-2.5">
              {/* Stage Category Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={stage.icon}
                    className="text-xs text-slate-400"
                  />
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    {stage.title}
                  </h4>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {completedCount}/{stageQuestions.length}
                </span>
              </div>

              {/* Questions List */}
              <div className="space-y-2">
                {stageQuestions.map(({ question, origIdx }) => {
                  const isCurrent = origIdx === currentIndex;
                  const isDone = completedIds.has(question.id);
                  const shortTitle = getQuestionShortTitle(question);
                  const stepNumber = origIdx + 1;

                  if (isCurrent) {
                    // Active card matching reference: blue circle, red pulse badge, bold title, text preview
                    return (
                      <div
                        key={question.id || origIdx}
                        className="rounded-xl border-2 border-blue-600 bg-white p-3.5 shadow-md shadow-blue-500/10 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm mt-0.5">
                            {stepNumber}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                                {stage.badgeLabel}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                                <span className="relative flex size-2">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                                  <span className="relative inline-flex size-2 rounded-full bg-rose-600" />
                                </span>
                                ĐANG LÀM
                              </span>
                            </div>

                            <h5 className="mt-1 text-xs font-bold text-slate-900 leading-snug">
                              {shortTitle}
                            </h5>

                            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-600">
                              {question.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Completed or Upcoming question
                  return (
                    <button
                      key={question.id || origIdx}
                      type="button"
                      onClick={() => onSelectQuestion(origIdx)}
                      className={`group flex min-h-[44px] w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                        isDone
                          ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50/70'
                          : 'border-slate-100 bg-slate-50/40 hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {/* Step Number or Checkmark */}
                      <div className="shrink-0">
                        {isDone ? (
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="text-emerald-500 text-base"
                          />
                        ) : (
                          <div className="flex size-6 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-400 group-hover:border-slate-400 group-hover:text-slate-600">
                            {stepNumber}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-xs truncate ${
                              isDone
                                ? 'font-semibold text-slate-700 line-through decoration-slate-300'
                                : 'font-medium text-slate-500 group-hover:text-slate-700'
                            }`}
                          >
                            {shortTitle}
                          </span>
                          {isDone && (
                            <span className="rounded bg-emerald-100/80 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                              Đã xong
                            </span>
                          )}
                        </div>
                      </div>

                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="text-[10px] text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500"
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
