import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import CompetencyRadarChart, { RadarDimension } from './CompetencyRadarChart';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export interface CompetencyOverviewCardProps {
  overallScore: number; // 0 - 100
  isEvaluating?: boolean;
  completedQuestionsCount?: number;
  totalQuestionsCount?: number;
  dimensions?: RadarDimension[];
  noticeMessage?: string;
  className?: string;
}

export const getCompetencyRating = (score: number) => {
  if (score >= 80) {
    return {
      label: 'Xuất sắc',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      ringColor: '#10b981',
    };
  }
  if (score >= 65) {
    return {
      label: 'Khá / Đạt yêu cầu',
      bg: 'bg-sky-50 text-sky-700 border-sky-200',
      ringColor: '#0284c7',
    };
  }
  if (score >= 50) {
    return {
      label: 'Trung bình',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      ringColor: '#f59e0b',
    };
  }
  if (score > 0) {
    return {
      label: 'Cần cải thiện',
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      ringColor: '#e11d48',
    };
  }
  return {
    label: 'Chưa hoàn thành',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    ringColor: '#94a3b8',
  };
};

export const CompetencyOverviewCard: React.FC<CompetencyOverviewCardProps> = ({
  overallScore,
  completedQuestionsCount,
  totalQuestionsCount,
  dimensions,
  noticeMessage,
  isEvaluating = false,
  className = '',
}) => {
  const normalizedScore = Math.max(0, Math.min(100, Math.round(overallScore)));
  const rating = isEvaluating
    ? {
        label: 'AI đang tổng hợp đánh giá...',
        bg: 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse',
        ringColor: '#3b82f6',
      }
    : getCompetencyRating(normalizedScore);

  // Default radar dimensions if none provided
  const radarDimensions: RadarDimension[] = dimensions || [
    { key: 'content', label: 'Nội dung', value: isEvaluating ? 50 : normalizedScore },
    { key: 'clarity', label: 'Rõ ràng', value: isEvaluating ? 50 : normalizedScore },
    { key: 'relevance', label: 'Liên quan', value: isEvaluating ? 50 : normalizedScore },
    { key: 'confidence', label: 'Tự tin', value: isEvaluating ? 50 : normalizedScore },
  ];

  const hasIncompleteQuestions =
    totalQuestionsCount != null &&
    completedQuestionsCount != null &&
    completedQuestionsCount < totalQuestionsCount;

  return (
    <div
      className={`rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm md:p-8 ${className}`}
    >
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
        {/* Left column: Circular Score Ring & Assessment */}
        <div className="flex flex-col items-center justify-center text-center lg:col-span-5 lg:border-r lg:border-slate-100 lg:pr-8">
          {/* Circular Score Ring */}
          <div className="relative mb-3 flex h-36 w-36 items-center justify-center">
            {/* SVG Circle Track & Progress */}
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={rating.ringColor}
                strokeWidth="8"
                strokeDasharray={314.159}
                strokeDashoffset={isEvaluating ? 150 : 314.159 - (314.159 * normalizedScore) / 100}
                strokeLinecap="round"
                className={`transition-all duration-700 ease-out ${isEvaluating ? 'animate-pulse' : ''}`}
              />
            </svg>

            {/* Centered Score & Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {isEvaluating ? (
                <>
                  <CircularProgress size={26} sx={{ color: '#2563eb', mb: 0.5 }} />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
                    Đang chấm
                  </span>
                </>
              ) : (
                <>
                  <span className="text-4xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                    {normalizedScore}
                  </span>
                  <span className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Tổng điểm
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Rating Pill Badge */}
          <span
            className={`inline-flex items-center rounded-full border px-3.5 py-1 text-xs font-bold shadow-xs ${rating.bg}`}
          >
            {rating.label}
          </span>

          {/* Notice Banner */}
          {(noticeMessage || hasIncompleteQuestions) && (
            <div className="mt-5 flex w-full items-start gap-2.5 rounded-xl border border-amber-200/90 bg-amber-50/80 p-3 text-left">
              <InfoOutlinedIcon sx={{ fontSize: 18, color: '#d97706', mt: 0.2, flexShrink: 0 }} />
              <p className="text-xs font-medium leading-relaxed text-amber-900">
                {noticeMessage ||
                  `Vui lòng hoàn thành tất cả câu hỏi để nhận đánh giá tổng thể, tiến độ ${completedQuestionsCount}/${totalQuestionsCount} câu hỏi đã hoàn thành`}
              </p>
            </div>
          )}
        </div>

        {/* Right column: Competency Radar Overview */}
        <div className="flex flex-col items-center justify-center lg:col-span-7">
          <div className="mb-2 text-center lg:text-left w-full">
            <h3 className="text-base font-bold text-slate-900 md:text-lg">
              Tổng quan năng lực
            </h3>
            <p className="text-xs font-medium text-slate-500">
              Tổng điểm: 0-100
            </p>
          </div>

          <div className="flex w-full items-center justify-center py-2">
            <CompetencyRadarChart
              dimensions={radarDimensions}
              size={300}
              accentColor="#4f46e5"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetencyOverviewCard;
