'use client';

import React from 'react';
import { Search, TrendingUp, Sparkles, Filter, Briefcase, Award } from 'lucide-react';

interface SalarySearchSectionProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  selectedSeniority: string;
  onSeniorityChange: (val: string) => void;
  categories: string[];
  seniorities: { value: string; label: string }[];
  totalCount: number;
}

export const SalarySearchSection: React.FC<SalarySearchSectionProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSeniority,
  onSeniorityChange,
  categories,
  seniorities,
  totalCount,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 p-6 sm:p-10 text-white shadow-xl">
      {/* Glow shapes */}
      <div className="absolute right-0 top-0 -mr-20 -mt-20 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />
      <div className="absolute left-1/4 bottom-0 -mb-20 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-sky-300 backdrop-blur-md">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>BÁO CÁO THỊ TRƯỜNG LAO ĐỘNG VIỆT NAM 2026</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
          Cổng Tra Cứu Dải Lương Chuẩn <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent">
            Theo Ngành Nghề &amp; Cấp Bậc Kinh Nghiệm
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Số liệu khảo sát chính xác từ hàng chục ngàn tin tuyển dụng thực tế và dữ liệu doanh nghiệp trong các khối Xây dựng &amp; Bất động sản, Thiết kế kiến trúc - Nội thất, CNTT và Nhân sự.
        </p>

        {/* Search & Filter Bar */}
        <div className="pt-4">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-3 sm:p-4 backdrop-blur-xl shadow-2xl">
            <div className="grid gap-3 sm:grid-cols-12 items-center">
              <div className="relative sm:col-span-8">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Nhập chức danh: Kỹ sư xây dựng, Kiến trúc sư, Frontend Developer..."
                  className="w-full rounded-xl border border-white/20 bg-slate-900/70 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:border-sky-400 focus:bg-slate-900 focus:outline-none transition"
                />
              </div>

              <div className="sm:col-span-4">
                <select
                  value={selectedSeniority}
                  onChange={(e) => onSeniorityChange(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-slate-900/70 px-3 py-2.5 text-xs sm:text-sm text-white focus:border-sky-400 focus:outline-none transition"
                >
                  {seniorities.map((sen) => (
                    <option key={sen.value} value={sen.value} className="bg-slate-900 text-white">
                      {sen.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3 border-t border-white/10 mt-3">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => onCategoryChange(cat)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      isActive
                        ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                        : 'bg-white/5 text-slate-300 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats summary strip */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
          <span className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-sky-400" />
            <span>Hiển thị <strong>{totalCount}</strong> dải lương được chuẩn hóa</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-teal-400" />
            <span>Cập nhật Quý I / 2026</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Tích hợp luyện phỏng vấn AI tương ứng</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SalarySearchSection;
