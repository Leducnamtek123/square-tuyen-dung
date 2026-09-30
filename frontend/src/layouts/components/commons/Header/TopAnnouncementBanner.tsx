'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { HOST_NAME, ROUTES } from '@/configs/constants';
import {
  isAdminHostname,
  isAdminPortalPath,
  isEmployerHostname,
  isEmployerPortalPath,
} from '@/configs/portalRouting';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';

const STORAGE_KEY = 'infohr_ai_announcement_dismissed';

interface TopAnnouncementBannerProps {
  isAdminPortal?: boolean;
  isEmployerPortal?: boolean;
}

export default function TopAnnouncementBanner({
  isAdminPortal: propIsAdmin,
  isEmployerPortal: propIsEmployer,
}: TopAnnouncementBannerProps = {}) {
  const { t, i18n } = useTranslation('common');
  const pathname = usePathname() || '';
  const [isDismissed, setIsDismissed] = useState(true); // default true on SSR to prevent hydration mismatch

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY) === 'true';
      setIsDismissed(stored);
    } catch {
      setIsDismissed(false);
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // ignore storage write errors
    }
  };

  const hostName = typeof window !== 'undefined' ? window.location.hostname : '';
  const isAdmin =
    propIsAdmin !== undefined
      ? propIsAdmin
      : isAdminPortalPath(pathname, hostName) || isAdminHostname(hostName);
  const isEmployer =
    propIsEmployer !== undefined
      ? propIsEmployer
      : isEmployerPortalPath(pathname, hostName) || isEmployerHostname(hostName);

  // Announcement banner is exclusively for Job Seekers (candidate AI practice)
  if (isAdmin || isEmployer) return null;
  if (isDismissed) return null;

  const practiceRoute = localizeRoutePath(`/${ROUTES.JOB_SEEKER.PRACTICE}`, i18n.language);
  const isCandidateDomain =
    !hostName ||
    hostName === 'infohr.vn' ||
    hostName === 'www.infohr.vn' ||
    hostName === 'localhost' ||
    hostName.startsWith('localhost:');
  const practiceHref = isCandidateDomain
    ? practiceRoute
    : `https://${HOST_NAME.PROJECT}${practiceRoute}`;

  const badgeText = t('announcement.aiInterviewBadge', i18n.language === 'vi' ? 'MỚI' : 'NEW');
  const messageText = t(
    'announcement.aiInterviewMessage',
    i18n.language === 'vi'
      ? 'Luyện phỏng vấn thực chiến cùng công nghệ Voice AI chuẩn doanh nghiệp.'
      : 'Practice real-world interviews with enterprise-grade Voice AI.'
  );
  const ctaText = t(
    'announcement.aiInterviewCta',
    i18n.language === 'vi' ? 'Khám phá ngay' : 'Explore now'
  );

  return (
    <aside
      aria-label="Thông báo tính năng mới"
      className="w-full bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 text-white py-1.5 sm:py-2 px-3 sm:px-6 relative z-50 transition-all duration-300 select-none shadow-xs border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Main Content & Link */}
        <Link
          href={practiceHref}
          className="flex-1 flex items-center justify-center gap-2 sm:gap-2.5 text-inherit no-underline hover:no-underline group min-w-0"
        >
          {/* Black Badge matching reference */}
          <span className="shrink-0 bg-slate-950 text-white font-black text-[10px] sm:text-[11px] px-2 py-0.5 rounded-none tracking-wider uppercase shadow-xs">
            {badgeText}
          </span>

          <span className="flex items-center gap-1 sm:gap-1.5 truncate font-medium text-white/95 group-hover:text-white min-w-0">
            <AutoAwesomeIcon sx={{ fontSize: { xs: 13, sm: 15 }, color: '#38bdf8', flexShrink: 0 }} />
            <span className="truncate">{messageText}</span>
          </span>

          <span className="shrink-0 font-bold text-cyan-200 group-hover:text-white transition-colors flex items-center gap-0.5 no-underline hover:no-underline ml-1">
            <span>{ctaText}</span>
            <ArrowForwardIcon sx={{ fontSize: 13 }} />
          </span>
        </Link>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label={i18n.language === 'vi' ? 'Đóng thông báo' : 'Close announcement'}
          className="shrink-0 p-1 text-white/70 hover:text-white hover:bg-white/15 rounded-none transition-colors cursor-pointer border-0 bg-transparent flex items-center justify-center"
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </button>
      </div>
    </aside>
  );
}
