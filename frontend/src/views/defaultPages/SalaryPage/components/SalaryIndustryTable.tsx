'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  ChevronRight,
  Sparkles,
  Users,
  SearchX,
  Layers,
} from 'lucide-react';
import { SalaryBenchmarkItem } from '@/types/models';

interface SalaryIndustryTableProps {
  benchmarks: SalaryBenchmarkItem[];
  isLoading: boolean;
  onResetFilter: () => void;
}

export const SalaryIndustryTable: React.FC<SalaryIndustryTableProps> = ({
  benchmarks,
  isLoading,
  onResetFilter,
}) => {
  const formatCurrencyMillions = (val: number) => {
    const millions = (val / 1_000_000).toFixed(val % 1_000_000 === 0 ? 0 : 1);
    return `${millions} Tr`;
  };

  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const getSeniorityBadge = (seniority?: string) => {
    switch (seniority) {
      case 'senior':
      case 'lead':
        return { label: 'Senior / Quản lý', bg: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'middle':
        return { label: 'Trung cấp (1-3 năm)', bg: 'bg-blue-100 text-blue-700 border-blue-200' };
      default:
        return { label: 'Junior / Mới bắt đầu', bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-sky-500 border-t-transparent" />
        <p className="mt-3 text-xs font-medium text-slate-500">Đang truy vấn dữ liệu dải lương thị trường 2026...</p>
      </div>
    );
  }

  if (benchmarks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
        <SearchX className="mx-auto h-12 w-12 text-slate-300 mb-3" />
        <h3 className="text-base font-bold text-slate-800">Không tìm thấy dải lương phù hợp</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          Thử tìm kiếm với chức danh khác hoặc chọn tất cả ngành nghề để xem toàn bộ báo cáo.
        </p>
        <button
          onClick={onResetFilter}
          className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-600 transition"
        >
          Xem lại tất cả dải lương
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop & Tablet Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/75 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Bảng Dải Lương Theo Vị Trí (VNĐ / Tháng)
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Năm dữ liệu: <strong>2026</strong>
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {benchmarks.map((item) => {
            const min = item.min_salary ?? item.salary_min ?? 0;
            const max = item.max_salary ?? item.salary_max ?? 0;
            const median = item.median_salary ?? item.salary_avg ?? Math.round((min + max) / 2);
            const title = item.job_title ?? item.position_title ?? '';
            const cat = item.category ?? item.career_name ?? 'Chung';
            const sampleSize = item.sample_size ?? item.sample_count ?? 0;
            const seniority = getSeniorityBadge(item.seniority || item.experience_level);
            const span = max - min;
            const medianPercent = span > 0 ? Math.round(((median - min) / span) * 100) : 50;

            return (
              <div
                key={item.id}
                className="p-5 sm:p-6 hover:bg-slate-50/70 transition flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Left info: Title, tags, samples */}
                <div className="space-y-2 lg:max-w-md">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${seniority.bg}`}>
                      {seniority.label}
                    </span>
                    <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      {cat}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-slate-400" />
                      <span>{sampleSize ? `${sampleSize.toLocaleString()} mẫu tin tuyển dụng` : 'Khảo sát chuẩn hóa'}</span>
                    </span>
                    {item.source_notes && (
                      <span>&bull; {item.source_notes}</span>
                    )}
                  </div>
                </div>

                {/* Center: Visual Salary Range Bar */}
                <div className="flex-1 lg:max-w-md space-y-2">
                  <div className="flex items-baseline justify-between text-xs font-semibold">
                    <span className="text-slate-600">
                      Thấp nhất: <strong className="text-slate-900">{formatCurrencyMillions(min)}</strong>
                    </span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                      Trung vị: {formatCurrencyMillions(median)}
                    </span>
                    <span className="text-slate-600">
                      Cao nhất: <strong className="text-slate-900">{formatCurrencyMillions(max)}</strong>
                    </span>
                  </div>

                  {/* Gradient progress track */}
                  <div className="relative h-2.5 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400 via-teal-400 to-indigo-500 rounded-full" />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{formatVND(min)}</span>
                    <span>{formatVND(max)}</span>
                  </div>
                </div>

                {/* Right: CTA to practice */}
                <div className="shrink-0 flex items-center lg:justify-end">
                  <Link
                    href={`/practice?category=${encodeURIComponent(cat)}&search=${encodeURIComponent(title)}`}
                    className="inline-flex w-full lg:w-auto items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-sky-600 transition"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    <span>Luyện phỏng vấn vị trí này</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SalaryIndustryTable;
