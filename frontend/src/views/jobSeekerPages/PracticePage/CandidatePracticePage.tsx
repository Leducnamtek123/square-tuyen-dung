'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  Play,
  Video,
  Clock,
  Layers,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { interviewService } from '@/services/interviewService';
import { QuestionBankItem, CreateMockSessionPayload } from '@/types/models';
import QuestionDetailModal from './components/QuestionDetailModal';

const CATEGORY_OPTIONS = [
  'Tất cả ngành nghề',
  'Xây dựng & Kiến trúc',
  'Thiết kế & Nội thất',
  'Công nghệ thông tin',
  'Nhân sự & Tuyển dụng',
  'Kinh doanh & Bán hàng',
];

const SENIORITY_OPTIONS = [
  { value: '', label: 'Tất cả cấp bậc' },
  { value: 'junior', label: 'Junior / Fresher' },
  { value: 'middle', label: 'Middle (1-3 năm)' },
  { value: 'senior', label: 'Senior / Quản lý' },
];

export const CandidatePracticePage: React.FC = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả ngành nghề');
  const [selectedSeniority, setSelectedSeniority] = useState<string>('');
  const [activeModalQuestion, setActiveModalQuestion] = useState<QuestionBankItem | null>(null);
  const [isStartingMock, setIsStartingMock] = useState<boolean>(false);

  // Quick studio form state
  const [mockJobTitle, setMockJobTitle] = useState<string>('Kỹ sư giám sát công trình');
  const [mockCategory, setMockCategory] = useState<string>('Xây dựng & Kiến trúc');
  const [mockSeniority, setMockSeniority] = useState<string>('middle');
  const [mockCount, setMockCount] = useState<number>(5);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await interviewService.getQuestionBank({
        category: selectedCategory === 'Tất cả ngành nghề' ? undefined : selectedCategory,
        seniority: selectedSeniority || undefined,
        search: searchQuery.trim() || undefined,
      });

      // Type-safe extraction from PaginatedResponse<QuestionBankItem>
      const results = Array.isArray(res)
        ? res
        : (res?.results ?? []);
      setQuestions(results);
    } catch (err: unknown) {
      console.error('Failed to fetch question bank:', err);
      toast.error('Không thể tải danh sách câu hỏi. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuestions();
    }, 250);
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedSeniority, searchQuery]);

  const handleStartMockSession = async (customPayload?: Partial<CreateMockSessionPayload>) => {
    setIsStartingMock(true);
    try {
      const payload: CreateMockSessionPayload = {
        job_title: customPayload?.job_title || mockJobTitle.trim() || 'Vị trí thử thách',
        category: customPayload?.category || mockCategory,
        seniority: customPayload?.seniority || mockSeniority,
        question_count: customPayload?.question_count || mockCount,
      };

      const session = await interviewService.createMockSession(payload);

      toast.success('Đã khởi tạo phòng phỏng vấn thử thành công!');

      const targetUrl =
        session.interview_url ||
        session.interviewUrl ||
        (session.id ? `/interview/${session.id}` : undefined);

      if (targetUrl) {
        router.push(targetUrl);
      } else {
        router.push('/my-interviews');
      }
    } catch (err: unknown) {
      console.error('Failed to create mock interview session:', err);
      toast.error('Khởi tạo buổi phỏng vấn thử thất bại. Vui lòng thử lại!');
      setIsStartingMock(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '02:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Header breadcrumb & title */}
      <div className="border-b border-slate-200/80 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 mb-2">
            <Sparkles className="h-4 w-4" />
            <span>AI INTERVIEW STUDIO &amp; QUESTION BANK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Ngân Hàng Câu Hỏi &amp; Phòng Phỏng Vấn Thử AI
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl">
            Luyện tập phản xạ với công nghệ AI Interviewer chuẩn LiveKit WebRTC. Xem trước cấu trúc dàn bài chuẩn, mẹo ứng biến và bẫy câu hỏi trước khi bước vào buổi phỏng vấn chính thức.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {/* ── Mock Interview Studio Quick Launch Card ── */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 border border-indigo-900/40">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 -mb-16 h-60 w-60 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-12 items-center">
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300 backdrop-blur-md">
                <Video className="h-3.5 w-3.5" />
                <span>Giả lập 100% môi trường phỏng vấn thật</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Phòng Luyện Phỏng Vấn AI <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">
                  Tương Tác Giọng Nói Trực Tiếp
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Tập dượt trong phòng phỏng vấn AI với bộ đếm ngược thời gian câu hỏi, dàn ý gợi ý theo thời gian thực và lộ trình phỏng vấn chuẩn doanh nghiệp.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0" />
                  <span>HUD gợi ý trả lời START → END</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0" />
                  <span>Đồng hồ đếm ngược từng câu</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0" />
                  <span>Báo cáo đánh giá năng lực AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0" />
                  <span>Miễn phí không giới hạn</span>
                </div>
              </div>
            </div>

            {/* Quick Setup Box */}
            <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-white/10 p-5 sm:p-6 backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-sky-200 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-300" />
                Thiết Lập Buổi Phỏng Vấn Thử
              </h3>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Vị trí / Chức danh ứng tuyển
                  </label>
                  <input
                    type="text"
                    value={mockJobTitle}
                    onChange={(e) => setMockJobTitle(e.target.value)}
                    placeholder="VD: Kỹ sư xây dựng, Frontend Dev..."
                    className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-3 py-2 text-xs text-white placeholder-slate-400 focus:border-sky-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Ngành nghề chuyên môn
                  </label>
                  <select
                    value={mockCategory}
                    onChange={(e) => setMockCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                  >
                    {CATEGORY_OPTIONS.filter((c) => c !== 'Tất cả ngành nghề').map((c) => (
                      <option key={c} value={c} className="bg-slate-900 text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Cấp bậc mong muốn
                  </label>
                  <select
                    value={mockSeniority}
                    onChange={(e) => setMockSeniority(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                  >
                    <option value="junior" className="bg-slate-900 text-white">Junior / Fresher</option>
                    <option value="middle" className="bg-slate-900 text-white">Trung cấp (Middle)</option>
                    <option value="senior" className="bg-slate-900 text-white">Senior / Chuyên gia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Số lượng câu hỏi
                  </label>
                  <select
                    value={mockCount}
                    onChange={(e) => setMockCount(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-3 py-2 text-xs text-white focus:border-sky-400 focus:outline-none"
                  >
                    <option value={3} className="bg-slate-900 text-white">3 câu (Thử thách nhanh ~6 phút)</option>
                    <option value={5} className="bg-slate-900 text-white">5 câu (Phỏng vấn tiêu chuẩn ~12 phút)</option>
                    <option value={8} className="bg-slate-900 text-white">8 câu (Toàn diện chuyên sâu ~20 phút)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => handleStartMockSession()}
                disabled={isStartingMock}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/25 hover:from-sky-400 hover:to-indigo-400 transition disabled:opacity-60"
              >
                {isStartingMock ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Đang kết nối phòng phỏng vấn LiveKit...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-white" />
                    Bắt đầu phỏng vấn thử ngay
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* ── Question Bank Filter & Search ── */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-sky-600" />
                Ngân Hàng Câu Hỏi Phỏng Vấn Thực Tế
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Xem gợi ý cấu trúc trả lời, bẫy ứng xử và luyện tập theo từng vị trí
              </p>
            </div>

            {/* Tra cuu luong CTA badge */}
            <Link
              href="/salary"
              className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50/80 px-3.5 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition shrink-0"
            >
              <TrendingUp className="h-4 w-4 text-sky-600" />
              <span>Tra cứu dải lương thị trường 2026</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Search bar & filter controls */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <div className="grid gap-3 sm:grid-cols-12">
              <div className="relative sm:col-span-7 lg:col-span-8">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm câu hỏi (VD: xung đột bản vẽ, quản lý tiến độ, xử lý lỗi...)"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-5 lg:col-span-4">
                <select
                  value={selectedSeniority}
                  onChange={(e) => setSelectedSeniority(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 focus:border-sky-500 focus:bg-white focus:outline-none"
                >
                  {SENIORITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {CATEGORY_OPTIONS.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Question Cards Grid ── */}
        <section>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-sky-500 border-t-transparent" />
              <p className="mt-3 text-xs font-medium">Đang tải danh sách câu hỏi phỏng vấn...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-800">Không tìm thấy câu hỏi phù hợp</h3>
              <p className="mt-1 text-xs text-slate-500">
                Hãy thử thay đổi từ khóa tìm kiếm hoặc lọc theo ngành nghề khác.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Tất cả ngành nghề');
                  setSelectedSeniority('');
                }}
                className="mt-4 rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {questions.map((q) => {
                const steps = q.answer_structure?.steps || [];
                const tips = q.important_tips || [];

                return (
                  <div
                    key={q.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-sky-300 hover:shadow-md transition group"
                  >
                    <div className="space-y-3">
                      {/* Tags */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {q.category && (
                            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                              {q.category}
                            </span>
                          )}
                          <span className="rounded-md border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                            {q.seniority ? q.seniority.toUpperCase() : 'ALL LEVEL'}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                          <Clock className="h-3 w-3" />
                          {formatDuration(q.default_duration_seconds)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition leading-snug">
                        {q.question_text}
                      </h3>

                      {/* Quick preview snippet */}
                      {q.interviewer_intent ? (
                        <p className="text-xs text-slate-500 line-clamp-2">
                          <span className="font-semibold text-slate-700">Mục đích: </span>
                          {q.interviewer_intent}
                        </p>
                      ) : (
                        steps.length > 0 && (
                          <div className="text-xs text-slate-500">
                            <span className="font-semibold text-slate-700">Gợi ý: </span>
                            {steps.length} bước cấu trúc trả lời bài bản
                          </div>
                        )
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setActiveModalQuestion(q)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-50 transition"
                      >
                        <Layers className="h-3.5 w-3.5" />
                        <span>Xem dàn ý &amp; mẹo</span>
                      </button>

                      <button
                        onClick={() =>
                          handleStartMockSession({
                            job_title: q.question_text,
                            category: q.category || 'Chung',
                            seniority: q.seniority || 'middle',
                            question_count: 3,
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-600 transition"
                      >
                        <span>Luyện tập</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Bottom Salary Benchmark Teaser Banner ── */}
        <section className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-indigo-50 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700">
              <Award className="h-4 w-4" />
              <span>DỮ LIỆU THỊ TRƯỜNG LAO ĐỘNG 2026</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Bạn Đang Muốn Khảo Sát Mức Lương Để Đàm Phán Khi Phỏng Vấn?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Tra cứu bảng dải lương trung vị &amp; kinh nghiệm theo từng vị trí (Xây dựng, Thiết kế nội thất, CNTT, Nhân sự, Sales).
            </p>
          </div>

          <Link
            href="/salary"
            className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-sky-600/20 hover:bg-sky-500 transition shrink-0"
          >
            <span>Tra cứu bảng lương 2026 ngay</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>

      {/* Modal detail */}
      <QuestionDetailModal
        open={Boolean(activeModalQuestion)}
        question={activeModalQuestion}
        onClose={() => setActiveModalQuestion(null)}
        onPracticeQuestion={(q) => {
          setActiveModalQuestion(null);
          handleStartMockSession({
            job_title: q.question_text,
            category: q.category || 'Chung',
            seniority: q.seniority || 'middle',
            question_count: 3,
          });
        }}
        isStarting={isStartingMock}
      />
    </div>
  );
};

export default CandidatePracticePage;
