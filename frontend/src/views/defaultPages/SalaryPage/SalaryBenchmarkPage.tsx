'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import { salaryService } from '@/services/salaryService';
import { SalaryBenchmarkItem } from '@/types/models';
import SalarySearchSection from './components/SalarySearchSection';
import SalaryIndustryTable from './components/SalaryIndustryTable';

const CATEGORIES = [
  'Tất cả ngành nghề',
  'Xây dựng & Bất động sản',
  'Thiết kế kiến trúc & Nội thất',
  'Công nghệ thông tin',
  'Nhân sự & Tuyển dụng',
  'Kinh doanh & Bán hàng',
];

const SENIORITIES = [
  { value: '', label: 'Tất cả cấp bậc' },
  { value: 'junior', label: 'Junior / Mới tốt nghiệp' },
  { value: 'middle', label: 'Trung cấp (Middle 1-3 năm)' },
  { value: 'senior', label: 'Senior / Quản lý (>3 năm)' },
];

export const SalaryBenchmarkPage: React.FC = () => {
  const [benchmarks, setBenchmarks] = useState<SalaryBenchmarkItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả ngành nghề');
  const [selectedSeniority, setSelectedSeniority] = useState<string>('');

  const fetchBenchmarks = async () => {
    setIsLoading(true);
    try {
      const res = await salaryService.getSalaryBenchmarks({
        category: selectedCategory === 'Tất cả ngành nghề' ? undefined : selectedCategory,
        search: searchQuery.trim() || undefined,
      });

      const data = Array.isArray(res)
        ? res
        : (res?.results || (res as any)?.data?.results || (res as any)?.data || []);
      setBenchmarks(data);
    } catch (err) {
      console.error('Failed to fetch salary benchmarks:', err);
      toast.error('Không thể tải dữ liệu mức lương. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBenchmarks();
    }, 200);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  // Client-side seniority filtering
  const filteredBenchmarks = benchmarks.filter((item) => {
    if (!selectedSeniority) return true;
    return item.seniority === selectedSeniority;
  });

  const handleResetFilter = () => {
    setSearchQuery('');
    setSelectedCategory('Tất cả ngành nghề');
    setSelectedSeniority('');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {/* Search & Hero Banner */}
        <SalarySearchSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedSeniority={selectedSeniority}
          onSeniorityChange={setSelectedSeniority}
          categories={CATEGORIES}
          seniorities={SENIORITIES}
          totalCount={filteredBenchmarks.length}
        />

        {/* Feature highlights */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-start gap-3.5">
            <div className="rounded-xl bg-sky-50 p-2.5 text-sky-600 shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Dữ liệu thị trường 2026</h3>
              <p className="text-xs text-slate-500 mt-1">
                Thu thập và chuẩn hóa từ hệ sinh thái tuyển dụng InfoHR và hơn 20.000+ vị trí tuyển dụng thực tế.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-start gap-3.5">
            <div className="rounded-xl bg-teal-50 p-2.5 text-teal-600 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Chuẩn hóa theo dải</h3>
              <p className="text-xs text-slate-500 mt-1">
                Phản ánh đầy đủ 3 mốc: Thấp nhất (P25), Trung vị (P50) và Cao nhất (P75) để bạn tự tin deal lương.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-start gap-3.5">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 shrink-0">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Gắn liền phòng luyện phỏng vấn</h3>
              <p className="text-xs text-slate-500 mt-1">
                Sau khi xác định mục tiêu lương, bạn có thể bấm luyện tập phỏng vấn AI cho chính vị trí đó ngay lập tức.
              </p>
            </div>
          </div>
        </div>

        {/* Salary benchmarks table */}
        <SalaryIndustryTable
          benchmarks={filteredBenchmarks}
          isLoading={isLoading}
          onResetFilter={handleResetFilter}
        />

        {/* Bottom CTA Banner to Practice Studio */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-indigo-600 to-indigo-800 p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-200">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>BƯỚC TIẾP THEO ĐỂ ĐẠT MỨC LƯƠNG KỲ VỌNG</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Tự Tin Chinh Phục Buổi Phỏng Vấn Với AI Interviewer
            </h2>
            <p className="text-xs sm:text-sm text-sky-100">
              Trải nghiệm phòng họp LiveKit chuẩn WebRTC, bộ đếm ngược từng câu hỏi, dàn bài START → END và mẹo bẫy phỏng vấn miễn phí.
            </p>
          </div>

          <Link
            href="/practice"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-900 shadow-xl hover:bg-sky-50 transition shrink-0"
          >
            <span>Vào phòng phỏng vấn thử ngay</span>
            <ArrowRight className="h-4 w-4 text-sky-600" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SalaryBenchmarkPage;
