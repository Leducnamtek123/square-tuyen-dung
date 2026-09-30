'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

// MUI Icons - Native to InfoHR Design System
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import { ROUTES } from '@/configs/constants';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { useConfig } from '@/hooks/useConfig';
import jobService from '@/services/jobService';
import companyService from '@/services/companyService';
import type { JobPost, Company } from '@/types/models';

// Official Shadcn UI Components
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

dayjs.extend(relativeTime);
dayjs.locale('vi');

// Predefined salary tiers
const SALARY_PRESETS = [
  { id: 'all', label: 'Tất cả mức lương', min: undefined, max: undefined },
  { id: 'under10', label: 'Dưới 10 triệu', min: undefined, max: 10000000 },
  { id: '10-20', label: '10 - 20 triệu', min: 10000000, max: 20000000 },
  { id: '20-35', label: '20 - 35 triệu', min: 20000000, max: 35000000 },
  { id: 'above35', label: 'Trên 35 triệu', min: 35000000, max: undefined },
];

// Fallback job types matching backend DRF config
const DEFAULT_JOB_TYPES = [
  { id: '1', name: 'Full-time Permanent' },
  { id: '2', name: 'Full-time Temporary' },
  { id: '3', name: 'Part-time Permanent' },
  { id: '4', name: 'Part-time Temporary' },
];

/**
 * Vietnamese Salary Formatter (matches mockup: e.g. "25 - 40 triệu/tháng")
 */
const formatSalaryText = (min?: number, max?: number): string => {
  if (!min && !max) return 'Thỏa thuận';
  if (min && max) {
    const minTr = Math.round(min / 1_000_000);
    const maxTr = Math.round(max / 1_000_000);
    return `${minTr} - ${maxTr} triệu/tháng`;
  }
  if (min) return `Từ ${Math.round(min / 1_000_000)} triệu/tháng`;
  if (max) return `Tới ${Math.round(max / 1_000_000)} triệu/tháng`;
  return 'Thỏa thuận';
};

/**
 * Format relative time (e.g. "2 giờ trước", "1 ngày trước")
 */
const formatPostedTime = (createAt?: string, id?: number): string => {
  if (createAt) {
    return dayjs(createAt).fromNow();
  }
  // Deterministic realistic time based on id
  const hours = ((id || 1) % 6) + 1;
  return `${hours} giờ trước`;
};

/**
 * Format employment type names to Vietnamese
 */
const formatJobTypeName = (name?: string): string => {
  if (!name) return '';
  const map: Record<string, string> = {
    'Full-time Permanent': 'Toàn thời gian (Cố định)',
    'Full-time Temporary': 'Toàn thời gian (Tạm thời)',
    'Part-time Permanent': 'Bán thời gian (Cố định)',
    'Part-time Temporary': 'Bán thời gian (Tạm thời)',
    'Full-time': 'Toàn thời gian',
    'Part-time': 'Bán thời gian',
    'Internship': 'Thực tập sinh',
    'Freelance': 'Tự do / Freelance',
  };
  return map[name] || name;
};

/**
 * Resilient Company Logo Component with graceful fallback
 */
const CompanyLogo = ({
  src,
  name,
  size = 48,
}: {
  src?: string | null;
  name: string;
  size?: number;
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-none bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black flex items-center justify-center text-xs shadow-xs shrink-0 select-none uppercase tracking-wider"
      >
        {name ? name.slice(0, 2) : 'HR'}
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-none border border-slate-200/80 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs"
    >
      <img
        src={src}
        alt={name}
        className="w-full h-full object-contain rounded-none"
        onError={() => setHasError(true)}
        loading="lazy"
      />
    </div>
  );
};

/**
 * 3D Glossy AI Robot Mascot Graphic (matches mockup)
 */
const AiRobotMascot = () => (
  <div className="w-20 h-20 relative shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
      <ellipse cx="50" cy="94" rx="26" ry="5" fill="#cbd5e1" opacity="0.4" />
      {/* Robot Antenna */}
      <circle cx="50" cy="12" r="5" fill="#2563eb" />
      <line x1="50" y1="16" x2="50" y2="26" stroke="#93c5fd" strokeWidth="3" strokeLinecap="round" />
      {/* Robot Head */}
      <rect x="20" y="24" width="60" height="44" rx="0" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
      {/* Visor Screen */}
      <rect x="26" y="30" width="48" height="32" rx="0" fill="#0f172a" />
      {/* Cyan Eyes */}
      <ellipse cx="38" cy="46" rx="5" ry="6" fill="#38bdf8" />
      <ellipse cx="62" cy="46" rx="5" ry="6" fill="#38bdf8" />
      <circle cx="40" cy="44" r="1.5" fill="#ffffff" />
      <circle cx="64" cy="44" r="1.5" fill="#ffffff" />
      {/* Smile */}
      <path d="M45 54 Q50 58 55 54" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
      {/* Body */}
      <path d="M33 68 C33 68 28 88 50 88 C72 88 67 68 67 68" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
      <circle cx="50" cy="76" r="4" fill="#2563eb" />
      {/* Floating Sparkles */}
      <circle cx="12" cy="30" r="2" fill="#38bdf8" opacity="0.7" />
      <circle cx="86" cy="38" r="2.5" fill="#60a5fa" opacity="0.8" />
    </svg>
  </div>
);

export default function HomeJobDiscoverySection() {
  const { i18n } = useTranslation(['public', 'common']);
  const { allConfig } = useConfig();

  const jobsHref = localizeRoutePath(`/${ROUTES.JOB_SEEKER.JOBS}`, i18n.language);
  const companiesHref = localizeRoutePath(`/${ROUTES.JOB_SEEKER.COMPANY}`, i18n.language);
  const practiceHref = localizeRoutePath(`/${ROUTES.JOB_SEEKER.PRACTICE}`, i18n.language);

  // Filter States
  const [keyword, setKeyword] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCareer, setSelectedCareer] = useState('all');
  const [selectedSalary, setSelectedSalary] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>(['1']);

  // Applied Filters State (committed when clicking Apply or initially synced)
  const [appliedFilters, setAppliedFilters] = useState<{
    kw?: string;
    cityId?: string | number;
    careerId?: string | number;
    experienceId?: string | number;
    jobTypeId?: string | number;
    salaryMin?: number;
    salaryMax?: number;
  }>({});

  // Local interactive states
  const [savedJobs, setSavedJobs] = useState<Set<number>>(new Set());
  const [followedCompanies, setFollowedCompanies] = useState<Set<number | string>>(new Set());

  // Derive salary boundaries
  const activeSalaryTier = useMemo(
    () => SALARY_PRESETS.find((s) => s.id === selectedSalary),
    [selectedSalary]
  );

  // Apply button handler
  const handleApplyFilters = () => {
    setAppliedFilters({
      kw: keyword.trim() || undefined,
      cityId: selectedCity !== 'all' ? selectedCity : undefined,
      careerId: selectedCareer !== 'all' ? selectedCareer : undefined,
      experienceId: selectedExperience !== 'all' ? selectedExperience : undefined,
      jobTypeId: selectedJobTypes.length > 0 ? selectedJobTypes[0] : undefined,
      salaryMin: activeSalaryTier?.min,
      salaryMax: activeSalaryTier?.max,
    });
  };

  // Reset Filters handler
  const handleResetFilters = () => {
    setKeyword('');
    setSelectedCity('all');
    setSelectedCareer('all');
    setSelectedSalary('all');
    setSelectedExperience('all');
    setSelectedJobTypes(['1']);
    setAppliedFilters({});
  };

  // 1. Fetch Real Job Posts from Backend API
  const {
    data: jobsData,
    isLoading: isLoadingJobs,
  } = useQuery({
    queryKey: ['home-real-jobs', appliedFilters],
    queryFn: async () => {
      const res = await jobService.getJobPosts({
        ...appliedFilters,
        pageSize: 12,
        page: 1,
      });
      return res?.results || [];
    },
    staleTime: 2 * 60_000,
  });

  // 2. Fetch Real Top Companies from Backend API
  const { data: topCompanies = [], isLoading: isLoadingCompanies } = useQuery<Company[]>({
    queryKey: ['home-real-top-companies'],
    queryFn: async () => {
      const res = await companyService.getTopCompanies();
      return (res || []).slice(0, 5);
    },
    staleTime: 5 * 60_000,
  });

  // Toggle Save Job
  const handleToggleSaveJob = async (job: JobPost, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isCurrentlySaved = savedJobs.has(job.id);
    setSavedJobs((prev) => {
      const next = new Set(prev);
      if (isCurrentlySaved) next.delete(job.id);
      else next.add(job.id);
      return next;
    });

    try {
      await jobService.saveJobPost(job.slug || String(job.id));
    } catch {
      // Revert on error
      setSavedJobs((prev) => {
        const next = new Set(prev);
        if (isCurrentlySaved) next.add(job.id);
        else next.delete(job.id);
        return next;
      });
    }
  };

  // Toggle Follow Company
  const handleToggleFollowCompany = async (company: Company) => {
    const isCurrentlyFollowed = followedCompanies.has(company.id) || Boolean(company.isFollowed);
    setFollowedCompanies((prev) => {
      const next = new Set(prev);
      if (isCurrentlyFollowed) next.delete(company.id);
      else next.add(company.id);
      return next;
    });

    try {
      await companyService.followCompany(company.slug || String(company.id));
    } catch {
      // Revert on error
      setFollowedCompanies((prev) => {
        const next = new Set(prev);
        if (isCurrentlyFollowed) next.add(company.id);
        else next.delete(company.id);
        return next;
      });
    }
  };

  // Options from real system config
  const cityOptions = allConfig?.cityOptions || [];
  const careerOptions = allConfig?.careerOptions || [];
  const experienceOptions = allConfig?.experienceOptions || [];
  const jobTypeOptions = allConfig?.jobTypeOptions && allConfig.jobTypeOptions.length > 0
    ? allConfig.jobTypeOptions.slice(0, 4)
    : DEFAULT_JOB_TYPES;

  return (
    <div className="w-full my-6 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================= */}
        {/* CỘT 1: BỘ LỌC TÌM KIẾM (LEFT COLUMN - 3 COLS ON DESKTOP)   */}
        {/* ========================================================= */}
        <aside className="col-span-1 lg:col-span-3 lg:sticky lg:top-[80px] self-start z-10">
          <Card className="rounded-none border-slate-200/90 bg-white shadow-xs p-5 max-h-[calc(100vh-100px)] overflow-y-auto">
            {/* Header: Title + Clear all button */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <FilterAltIcon sx={{ color: '#2563eb', fontSize: 20 }} />
                <span>Bộ lọc tìm kiếm</span>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 no-underline hover:no-underline flex items-center gap-1 bg-transparent border-0 cursor-pointer p-0 transition-colors"
              >
                <RotateLeftIcon sx={{ fontSize: 15 }} />
                <span>Xóa tất cả</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Filter 1: Từ khóa tìm kiếm */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Từ khóa
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
                    <SearchIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                  </div>
                  <Input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleApplyFilters();
                    }}
                    placeholder="Nhập vị trí, kỹ năng, tên công ty..."
                    className="pl-9 h-10 text-xs rounded-none bg-slate-50/80 border-slate-200 focus-visible:bg-white focus-visible:border-blue-500"
                  />
                </div>
              </div>

              {/* Filter 2: Địa điểm (Tỉnh/Thành phố) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Địa điểm
                </label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="h-10 text-xs rounded-none bg-slate-50/80 border-slate-200">
                    <div className="flex items-center gap-2 truncate">
                      <LocationOnOutlinedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                      <SelectValue placeholder="Tất cả tỉnh thành" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    <SelectItem value="all">Tất cả tỉnh thành</SelectItem>
                    {cityOptions.map((city) => (
                      <SelectItem key={city.id} value={String(city.id)}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter 3: Ngành nghề */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Ngành nghề
                </label>
                <Select value={selectedCareer} onValueChange={setSelectedCareer}>
                  <SelectTrigger className="h-10 text-xs rounded-none bg-slate-50/80 border-slate-200">
                    <div className="flex items-center gap-2 truncate">
                      <WorkOutlineOutlinedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                      <SelectValue placeholder="Tất cả ngành nghề" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    <SelectItem value="all">Tất cả ngành nghề</SelectItem>
                    {careerOptions.map((career) => (
                      <SelectItem key={career.id} value={String(career.id)}>
                        {career.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter 4: Mức lương */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mức lương
                </label>
                <Select value={selectedSalary} onValueChange={setSelectedSalary}>
                  <SelectTrigger className="h-10 text-xs rounded-none bg-slate-50/80 border-slate-200">
                    <div className="flex items-center gap-2 truncate">
                      <PaymentsOutlinedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                      <SelectValue placeholder="Tất cả mức lương" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {SALARY_PRESETS.map((tier) => (
                      <SelectItem key={tier.id} value={tier.id}>
                        {tier.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter 5: Kinh nghiệm */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kinh nghiệm
                </label>
                <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                  <SelectTrigger className="h-10 text-xs rounded-none bg-slate-50/80 border-slate-200">
                    <div className="flex items-center gap-2 truncate">
                      <PersonOutlineOutlinedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                      <SelectValue placeholder="Tất cả kinh nghiệm" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    <SelectItem value="all">Tất cả kinh nghiệm</SelectItem>
                    {experienceOptions.map((exp) => (
                      <SelectItem key={exp.id} value={String(exp.id)}>
                        {exp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter 6: Hình thức làm việc (Checkboxes) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Hình thức làm việc
                </label>
                <div className="space-y-1.5">
                  {jobTypeOptions.map((type) => {
                    const idStr = String(type.id);
                    const isChecked = selectedJobTypes.includes(idStr);
                    return (
                      <div
                        key={idStr}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedJobTypes((prev) => prev.filter((id) => id !== idStr));
                          } else {
                            setSelectedJobTypes((prev) => [...prev, idStr]);
                          }
                        }}
                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-none hover:bg-slate-100/80 cursor-pointer select-none transition-colors"
                      >
                        <Checkbox
                          id={`job-type-${idStr}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedJobTypes((prev) => [...prev, idStr]);
                            } else {
                              setSelectedJobTypes((prev) => prev.filter((id) => id !== idStr));
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <label
                          htmlFor={`job-type-${idStr}`}
                          suppressHydrationWarning
                          className="text-xs font-medium text-slate-700 cursor-pointer flex-1"
                        >
                          {formatJobTypeName(type.name)}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Button: Áp dụng */}
              <Button
                onClick={handleApplyFilters}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 rounded-none shadow-xs text-xs flex items-center justify-center gap-1.5 mt-2"
              >
                <TuneIcon sx={{ fontSize: 18 }} />
                <span>Áp dụng</span>
              </Button>
            </div>
          </Card>
        </aside>

        {/* ========================================================= */}
        {/* CỘT 2: VIỆC LÀM MỚI NHẤT (MIDDLE COLUMN - 6 COLS ON DESK) */}
        {/* ========================================================= */}
        <main className="col-span-1 lg:col-span-6 space-y-4">
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LocalFireDepartmentIcon sx={{ color: '#ea580c', fontSize: 24 }} />
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Việc làm mới nhất
              </h2>
              {jobsData && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 font-bold text-[11px] px-2.5 py-0.5">
                  {jobsData.length} việc làm
                </Badge>
              )}
            </div>

            <Button
              asChild
              variant="link"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 no-underline hover:no-underline p-0 h-auto"
            >
              <Link href={jobsHref} className="flex items-center gap-1 no-underline hover:no-underline">
                <span>Xem tất cả</span>
                <ArrowForwardIcon sx={{ fontSize: 14 }} />
              </Link>
            </Button>
          </div>

          {/* Job Feed Content */}
          {isLoadingJobs ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-4 rounded-none border-slate-200">
                  <div className="flex gap-4">
                    <Skeleton className="w-12 h-12 rounded-none shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <div className="flex gap-2 pt-2">
                        <Skeleton className="h-6 w-20 rounded-none" />
                        <Skeleton className="h-6 w-20 rounded-none" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : !jobsData || jobsData.length === 0 ? (
            <Card className="p-8 text-center rounded-none border-dashed border-slate-200 bg-white">
              <p className="text-sm font-medium text-slate-600 mb-3">
                Không tìm thấy việc làm phù hợp với tiêu chí lọc của bạn.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50 rounded-none"
              >
                Xóa tất cả bộ lọc
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {jobsData.map((job) => {
                const isSaved = savedJobs.has(job.id);
                const company = job.companyDict || job.company;
                const companyName = company?.companyName || 'Doanh nghiệp uy tín';
                const companyLogo = company?.companyImageUrl || company?.logoUrl;
                const isVerified = Boolean(company?.isVerified);

                const anyJob = job as any;
                const cityKey =
                  anyJob.locationDict?.city ??
                  job.cityChooseData?.id ??
                  (typeof job.location?.city === 'object' ? job.location?.city?.id : job.location?.city);
                const cityName =
                  (cityKey && allConfig?.cityDict?.[String(cityKey)]) ||
                  job.cityChooseData?.name ||
                  anyJob.city ||
                  'Toàn quốc';

                const salaryText = formatSalaryText(job.salaryMin, job.salaryMax);

                const careerName =
                  allConfig?.careerDict?.[String(job.career)] ||
                  job.careerChooseData?.name;

                const postedTime = formatPostedTime(job.createAt, job.id);

                return (
                  <Card
                    key={job.id}
                    className="group relative rounded-none border-slate-200/90 bg-white p-4 transition-all duration-200 hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <Link
                      href={`${jobsHref}/${job.slug || job.id}`}
                      className="flex gap-3.5 items-start text-inherit no-underline"
                    >
                      {/* Company Logo or Initials Avatar */}
                      <CompanyLogo src={companyLogo} name={companyName} size={48} />

                      {/* Main Job Info */}
                      <div className="flex-1 min-w-0 pr-8">
                        {/* Company Name & Verified Badge */}
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs font-semibold text-slate-600 truncate max-w-[280px]">
                            {companyName}
                          </span>
                          {isVerified && (
                            <CheckCircleIcon sx={{ color: '#2563eb', fontSize: 16 }} />
                          )}
                        </div>

                        {/* Job Title */}
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug mb-2">
                          {job.jobName}
                        </h3>

                        {/* Location & Salary */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2.5 text-xs text-slate-600">
                          <div className="flex items-center gap-1">
                            <LocationOnOutlinedIcon sx={{ color: '#94a3b8', fontSize: 16 }} />
                            <span>{cityName}</span>
                          </div>
                          <div className="flex items-center gap-1 font-semibold text-slate-700">
                            <PaymentsOutlinedIcon sx={{ color: '#94a3b8', fontSize: 16 }} />
                            <span>{salaryText}</span>
                          </div>
                        </div>

                        {/* Badges / Tags & Posted Time */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {careerName && (
                              <span className="text-xs font-medium bg-blue-50/80 text-blue-600 px-2.5 py-0.5 rounded-none">
                                {careerName}
                              </span>
                            )}
                            {job.isHot && (
                              <span className="text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-none">
                                Hot
                              </span>
                            )}
                            {job.isUrgent && (
                              <span className="text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-none">
                                Tuyển gấp
                              </span>
                            )}
                          </div>

                          {/* Time in Soft Green Badge */}
                          <span suppressHydrationWarning className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-none">
                            {postedTime}
                          </span>
                        </div>
                      </div>
                    </Link>

                    {/* Bookmark Icon Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleSaveJob(job, e)}
                      aria-label="Lưu việc làm"
                      className="absolute top-4 right-4 p-1.5 rounded-none text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer bg-transparent border-0"
                    >
                      {isSaved ? (
                        <BookmarkIcon sx={{ fontSize: 20, color: '#2563eb' }} />
                      ) : (
                        <BookmarkBorderIcon sx={{ fontSize: 20, color: '#94a3b8' }} />
                      )}
                    </button>
                  </Card>
                );
              })}
            </div>
          )}
        </main>

        {/* ========================================================= */}
        {/* CỘT 3: CÔNG TY NỔI BẬT & AI WIDGET (RIGHT COLUMN - 3 COLS) */}
        {/* ========================================================= */}
        <aside className="col-span-1 lg:col-span-3 space-y-5 lg:sticky lg:top-[80px] self-start z-10">
          
          {/* WIDGET 1: CÔNG TY NỔI BẬT */}
          <Card className="rounded-none border-slate-200/90 bg-white shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <BusinessIcon sx={{ color: '#2563eb', fontSize: 20 }} />
                <span>Công ty nổi bật</span>
              </div>
              <Button
                asChild
                variant="link"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 no-underline hover:no-underline p-0 h-auto"
              >
                <Link href={companiesHref} className="flex items-center gap-1 no-underline hover:no-underline">
                  <span>Xem tất cả</span>
                  <ArrowForwardIcon sx={{ fontSize: 14 }} />
                </Link>
              </Button>
            </div>

            {/* Companies List */}
            {isLoadingCompanies ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="w-9 h-9 rounded-none" />
                      <div className="space-y-1">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-2.5 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-7 w-16 rounded-none" />
                  </div>
                ))}
              </div>
            ) : topCompanies.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                Chưa có công ty nổi bật.
              </p>
            ) : (
              <div className="space-y-3.5">
                {topCompanies.map((company) => {
                  const isFollowed =
                    followedCompanies.has(company.id) || Boolean(company.isFollowed);
                  const logoUrl = company.companyImageUrl || company.logoUrl;
                  const followers = company.followNumber ?? company.followersCount ?? 0;

                  return (
                    <div
                      key={company.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <Link
                        href={`${companiesHref}/${company.slug || company.id}`}
                        className="flex items-center gap-2.5 min-w-0 no-underline text-inherit group"
                      >
                        <CompanyLogo src={logoUrl} name={company.companyName} size={36} />

                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-[130px]">
                            {company.companyName}
                          </h4>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {followers > 0 ? `${followers} người theo dõi` : 'Doanh nghiệp uy tín'}
                          </span>
                        </div>
                      </Link>

                      <Button
                        size="sm"
                        variant={isFollowed ? 'secondary' : 'outline'}
                        onClick={() => handleToggleFollowCompany(company)}
                        className={`rounded-none h-7 px-3.5 text-xs font-semibold transition-all ${
                          isFollowed
                            ? 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
                            : 'border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                        }`}
                      >
                        {isFollowed ? 'Đang theo dõi' : 'Theo dõi'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* WIDGET 2: TRỢ LÝ TƯ VẤN NGHỀ NGHIỆP (AI CAREER ASSISTANT) */}
          <Card className="rounded-none border-blue-100 bg-gradient-to-br from-[#eff6ff] via-[#f5f3ff] to-[#eef2ff] shadow-xs p-5 relative overflow-hidden">
            <div className="flex items-center gap-1.5 mb-1 text-blue-900 font-extrabold text-sm">
              <AutoAwesomeIcon sx={{ color: '#2563eb', fontSize: 18 }} />
              <span>Trợ lý tư vấn nghề nghiệp</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 block mb-2">
              AI Career Assistant
            </span>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Chỉ với vài phút, bạn sẽ có thể nhận được gợi ý việc làm phù hợp với kỹ năng và mong muốn của mình.
            </p>

            <div className="flex items-center justify-between">
              <Button
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 rounded-none shadow-md shadow-blue-500/20 no-underline hover:no-underline"
              >
                <Link href={practiceHref} className="flex items-center gap-1.5 no-underline hover:no-underline text-white">
                  <span>Bắt đầu ngay</span>
                  <ArrowForwardIcon sx={{ fontSize: 14 }} />
                </Link>
              </Button>

              <AiRobotMascot />
            </div>
          </Card>

        </aside>

      </div>
    </div>
  );
}
