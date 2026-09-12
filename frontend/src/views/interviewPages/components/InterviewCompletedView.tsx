'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { Button } from '@/components/ui/button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { AilaLogo } from '@/components/Common/AilaLogo';

import { IMAGES } from '@/configs/images';
import type { InterviewSession } from '@/types/models';
import CompetencyOverviewCard from './CompetencyOverviewCard';
import InterviewQuestionReviewSection, { QuestionReviewItem } from './InterviewQuestionReviewSection';
import type { RadarDimension } from './CompetencyRadarChart';

export interface InterviewCompletedViewProps {
  session: InterviewSession | null;
  isProcessing?: boolean;
  onRefresh?: () => void;
  myInterviewsPath?: string;
  practicePath?: string;
  onBackHome?: () => void;
}

export const InterviewCompletedView: React.FC<InterviewCompletedViewProps> = ({
  session,
  isProcessing = false,
  onRefresh,
  myInterviewsPath = '/phong-van-cua-toi',
  practicePath = '/practice',
  onBackHome,
}) => {
  const router = useRouter();
  const [shareCopied, setShareCopied] = React.useState(false);

  const isMock =
    session?.sessionType === 'mock' ||
    (session as any)?.type === 'practice' ||
    (!session?.jobPost && !session?.companyName);

  // 1. Calculate Scores normalized to 0 - 100 scale
  const isEvaluating = Boolean(
    isProcessing ||
    (!session?.aiOverallScore && !session?.ai_overall_score && !session?.aiSummary && !session?.ai_summary)
  );

  const overallScoreRaw = session?.aiOverallScore ?? session?.ai_overall_score;
  const numOverallScore = overallScoreRaw != null ? Number(overallScoreRaw) : null;
  const score100 = numOverallScore != null ? Math.round(numOverallScore <= 10 ? numOverallScore * 10 : numOverallScore) : 0;

  const techScoreRaw = session?.aiTechnicalScore ?? session?.ai_technical_score;
  const numTechScore = techScoreRaw != null ? Number(techScoreRaw) : null;
  const techScore100 = numTechScore != null ? Math.round(numTechScore <= 10 ? numTechScore * 10 : numTechScore) : score100;

  const commScoreRaw = session?.aiCommunicationScore ?? session?.ai_communication_score;
  const numCommScore = commScoreRaw != null ? Number(commScoreRaw) : null;
  const commScore100 = numCommScore != null ? Math.round(numCommScore <= 10 ? numCommScore * 10 : numCommScore) : score100;

  const detailedFeedback = (session?.aiDetailedFeedback || (session as any)?.ai_detailed_feedback) as any;
  const softSkills = detailedFeedback?.softSkills || detailedFeedback?.soft_skills;
  const confidenceScore = softSkills?.confidence != null ? Math.round(Number(softSkills.confidence) * 10) : Math.round(score100 * 0.95);
  const clarityScore = softSkills?.clarity != null ? Math.round(Number(softSkills.clarity) * 10) : commScore100;
  const relevanceScore = Math.round((techScore100 + score100) / 2);

  // 4 Dimensions matching the user's reference screenshot
  const radarDimensions: RadarDimension[] = [
    { key: 'content', label: 'Nội dung', value: techScore100 },
    { key: 'clarity', label: 'Rõ ràng', value: clarityScore },
    { key: 'relevance', label: 'Liên quan', value: relevanceScore },
    { key: 'confidence', label: 'Tự tin', value: confidenceScore },
  ];

  // 2. Map Questions & AI Performance
  const questionPerformance: Array<{ question: string; feedback: string; score: number }> =
    Array.isArray(detailedFeedback?.questionPerformance)
      ? detailedFeedback.questionPerformance
      : Array.isArray(detailedFeedback?.question_performance)
      ? detailedFeedback.question_performance
      : [];

  const rawQuestions = session?.questions || [];
  const totalQuestionsCount = Math.max(rawQuestions.length, questionPerformance.length, 1);

  let reviewQuestions: QuestionReviewItem[] = [];
  if (rawQuestions.length > 0) {
    reviewQuestions = rawQuestions.map((q, idx) => {
      const qText = typeof q === 'string' ? q : q.text || q.title || `Câu hỏi ${idx + 1}`;
      const matchedPerf = questionPerformance.find(
        (p) => p.question && (p.question.includes(qText.slice(0, 25)) || qText.includes(p.question.slice(0, 25)))
      ) || (questionPerformance.length > idx ? questionPerformance[idx] : undefined);

      const hasAnswered = Boolean(matchedPerf && (matchedPerf.score > 0 || (matchedPerf.feedback && !matchedPerf.feedback.toLowerCase().includes('chưa'))));
      const qScoreRaw = matchedPerf?.score;
      const qScore = qScoreRaw != null ? (qScoreRaw <= 10 ? qScoreRaw * 10 : qScoreRaw) : (hasAnswered && score100 > 0 ? score100 : 0);

      return {
        id: typeof q === 'object' ? q.id : idx + 1,
        questionNumber: idx + 1,
        text: qText,
        category: typeof q === 'object' ? (q.category_display || q.category) : undefined,
        score: qScore,
        feedback: matchedPerf?.feedback || (hasAnswered ? session?.aiSummary : 'Chưa ghi nhận câu trả lời cho câu hỏi này do phiên kết thúc sớm.'),
        isCompleted: hasAnswered,
      };
    });
  } else if (questionPerformance.length > 0) {
    reviewQuestions = questionPerformance.map((p, idx) => ({
      id: idx + 1,
      questionNumber: idx + 1,
      text: p.question,
      score: p.score <= 10 ? p.score * 10 : p.score,
      feedback: p.feedback,
      isCompleted: p.score > 0 || Boolean(p.feedback),
    }));
  }

  const completedQuestionsCount = reviewQuestions.filter((q) => q.isCompleted).length;

  const strengthsList: string[] = Array.isArray(session?.aiStrengths)
    ? session.aiStrengths
    : typeof session?.aiStrengths === 'string' && session.aiStrengths.trim()
    ? [session.aiStrengths]
    : [];

  const weaknessesList: string[] = Array.isArray(session?.aiWeaknesses)
    ? session.aiWeaknesses
    : typeof session?.aiWeaknesses === 'string' && session.aiWeaknesses.trim()
    ? [session.aiWeaknesses]
    : [];

  const handleShare = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setShareCopied(true);
      }
    } catch {
      // Fallback
    }
  };

  const handleRetryQuestion = (question: QuestionReviewItem) => {
    // Redirect to practice room or retry
    router.push(practicePath);
  };

  const handleRetryAll = () => {
    router.push(practicePath);
  };

  return (
    <main className="flex min-h-[100dvh] flex-col bg-[#f8fafc] text-slate-800 pb-28">
      {/* ─── Top Navigation Header ────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl md:px-8 shadow-2xs">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackHome || (() => router.push(myInterviewsPath))}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors h-8 px-2.5 rounded-lg"
          >
            <ArrowBackIcon sx={{ fontSize: 16 }} />
            <span>{isMock ? 'Kết quả luyện tập AI' : 'Kết quả phỏng vấn'}</span>
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Image
            src={IMAGES.getTextLogo('dark')}
            alt="InfoHR"
            width={90}
            height={28}
            style={{ height: 24, width: 'auto', objectFit: 'contain' }}
          />
        </div>
      </header>

      {/* ─── Main Content Container ──────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 md:py-8 space-y-6">
        {/* Processing State Banner */}
        {isProcessing && (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-blue-200 bg-blue-50/90 p-4 text-blue-900 shadow-xs">
            <CircularProgress size={20} sx={{ color: '#2563eb' }} />
            <span className="text-xs font-bold md:text-sm">
              Trợ lý AI đang xử lý và tổng hợp bảng điểm năng lực... Kết quả sẽ tự động cập nhật.
            </span>
          </div>
        )}

        {/* ─── Title & Meta Block ──────────────────────────────────────────── */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              {isMock ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-widest text-blue-700">
                  <AilaLogo size={13} variant="mark" />
                  BÁO CÁO LUYỆN TẬP AILA THỰC CHIẾN
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-widest text-blue-700">
                  <ApartmentOutlinedIcon sx={{ fontSize: 13 }} />
                  KẾT QUẢ PHỎNG VẤN CHÍNH THỨC
                </span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
              {isMock ? 'Kết quả Luyện phỏng vấn AI Cá nhân' : 'Kết quả Phỏng vấn Tuyển dụng'}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-600">
              {isMock
                ? `${(session as any)?.sessionMetadata?.interviewer_name || (session as any)?.session_metadata?.interviewer_name || (session as any)?.interviewerName || 'Trợ lý AI AILA'} · Chế độ Huấn luyện viên cá nhân`
                : `${session?.jobName || 'Vị trí Tuyển dụng'} · ${session?.companyName || 'Nhà tuyển dụng InfoHR'}`}
            </p>

            <div className="mt-2.5 flex flex-wrap items-center gap-3">
              {/* Completed badge */}
              <div className={`flex items-center gap-1.5 text-xs font-bold ${completedQuestionsCount > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                <CheckCircleRoundedIcon sx={{ fontSize: 16 }} />
                <span>{completedQuestionsCount}/{totalQuestionsCount} câu hỏi đã hoàn thành</span>
              </div>

              {/* Privacy or Submission notice */}
              {isMock ? (
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  <LockOutlinedIcon sx={{ fontSize: 13 }} />
                  <span>Dữ liệu riêng tư, không chia sẻ với nhà tuyển dụng</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                  <ApartmentOutlinedIcon sx={{ fontSize: 13 }} />
                  <span>Kết quả đã gửi tới Hội đồng tuyển dụng</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons on top */}
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 px-3.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-all h-9"
            >
              <ShareOutlinedIcon sx={{ fontSize: 16 }} />
              <span>Chia sẻ kết quả</span>
            </Button>
          </div>
        </div>

        {/* ─── 1. Competency Overview Bento (Donut + Radar Chart) ─────────── */}
        <CompetencyOverviewCard
          overallScore={score100}
          isEvaluating={isEvaluating}
          completedQuestionsCount={completedQuestionsCount}
          totalQuestionsCount={totalQuestionsCount}
          dimensions={radarDimensions}
          noticeMessage={
            completedQuestionsCount === 0
              ? `Phiên phỏng vấn kết thúc sớm khi chưa hoàn thành câu hỏi, tiến độ 0/${totalQuestionsCount} câu hỏi đã hoàn thành`
              : completedQuestionsCount < totalQuestionsCount
              ? `Vui lòng hoàn thành tất cả câu hỏi để nhận đánh giá đầy đủ, tiến độ ${completedQuestionsCount}/${totalQuestionsCount} câu hỏi đã hoàn thành`
              : undefined
          }
        />

        {/* ─── 2. Strengths & Weaknesses Quick Highlights (If present) ───── */}
        {(strengthsList.length > 0 || weaknessesList.length > 0) && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {strengthsList.length > 0 && (
              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 shadow-2xs">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                  Điểm mạnh nổi bật
                </div>
                <ul className="space-y-1 text-xs text-emerald-900 leading-relaxed font-medium">
                  {strengthsList.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {weaknessesList.length > 0 && (
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 shadow-2xs">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
                  <LightbulbOutlinedIcon sx={{ fontSize: 16 }} />
                  Khu vực cần cải thiện
                </div>
                <ul className="space-y-1 text-xs text-amber-900 leading-relaxed font-medium">
                  {weaknessesList.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ─── 3. Two-Column Question Review Drilldown ────────────────────── */}
        <InterviewQuestionReviewSection
          questions={reviewQuestions}
          onRetryQuestion={handleRetryQuestion}
        />
      </div>

      {/* ─── Sticky Bottom Action Bar ─────────────────────────────────────── */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center border-t border-slate-200/90 bg-white/95 px-4 py-3 backdrop-blur-lg shadow-lg">
        <div className="flex w-full max-w-5xl items-center justify-center gap-3 sm:justify-end">
          {/* Back to list */}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 px-4 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-all h-9"
          >
            <Link href={myInterviewsPath}>
              <ArrowBackIcon sx={{ fontSize: 14 }} />
              <span>{isMock ? 'Lịch phỏng vấn' : 'Về lịch phỏng vấn'}</span>
            </Link>
          </Button>

          {/* Continue / Practice */}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/90 px-4 text-xs font-semibold text-blue-700 shadow-2xs hover:bg-blue-100 transition-all h-9"
          >
            <Link href={practicePath}>
              <PlayArrowRoundedIcon sx={{ fontSize: 16 }} />
              <span>{isMock ? 'Luyện tập phiên mới' : 'Luyện phỏng vấn AI'}</span>
            </Link>
          </Button>

          {/* Retry entire session */}
          <Button
            variant="default"
            size="sm"
            onClick={handleRetryAll}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-all h-9 active:scale-98"
          >
            <ReplayRoundedIcon sx={{ fontSize: 16 }} />
            <span>{isMock ? 'Luyện lại phiên này' : 'Luyện tập lại'}</span>
          </Button>
        </div>
      </footer>

      {/* Share Toast */}
      <Snackbar
        open={shareCopied}
        autoHideDuration={3000}
        onClose={() => setShareCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%', borderRadius: '12px' }}>
          Đã sao chép liên kết kết quả phỏng vấn vào clipboard!
        </Alert>
      </Snackbar>
    </main>
  );
};

export default InterviewCompletedView;
