'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/redux/hooks';
import { useProfileSearch } from '../../ProfileSearch';
import {
  useEmployerResumes,
  useToggleSaveResumeOptimistic,
  useJobPostOptions,
} from '../../hooks/useEmployerQueries';
import { searchResume } from '@/redux/filterSlice';
import type { ResumeFilter } from '@/redux/filterSlice';
import type { Resume } from '@/types/models';
import toastMessages from '@/utils/toastMessages';
import { localizeRoutePath } from '@/configs/routeLocalization';
import { formatRoute } from '@/utils/funcUtils';
import { ROUTES } from '@/configs/constants';

export const useProfileCardState = () => {
  const { t, i18n } = useTranslation(['employer', 'common']);
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    handleFilter,
    handleReset,
    allConfig,
    drawerOpen,
    setDrawerOpen,
    activeFilterCount,
  } = useProfileSearch();

  const { data: rawJobPosts = [] } = useJobPostOptions();
  const formattedJobPostOptions = useMemo(
    () => [
      { id: '', name: t('employer:profileCard.aiMatch.allJobPosts', 'Tất cả tin tuyển dụng đang mở') },
      ...rawJobPosts.map((jp: { id: number | string; jobName: string }) => ({ id: String(jp.id), name: jp.jobName })),
    ],
    [rawJobPosts, t]
  );

  const { resumeFilter } = useAppSelector((state) => state.filter);
  const { pageSize } = resumeFilter;
  const [page, setPage] = useState(1);

  // Active Tab: 'all' (Find candidates) vs 'ai' (AI-suggested candidates)
  const [activeTab, setActiveTab] = useState<'all' | 'ai'>(
    resumeFilter.aiSuggested ? 'ai' : 'all'
  );

  // Sort: 'suitable' (Most suitable) vs 'newest' (Newest)
  const [sortOption, setSortOption] = useState<string>(
    resumeFilter.sort || 'suitable'
  );

  const queryParams = useMemo(
    () => ({
      ...resumeFilter,
      sort: sortOption,
      aiSuggested: activeTab === 'ai' ? true : undefined,
      page,
    }),
    [resumeFilter, sortOption, activeTab, page]
  );

  const { data: queryData, isLoading } = useEmployerResumes(queryParams);
  const resumes: Resume[] = queryData?.results || [];
  const count = queryData?.count || 0;

  // Selected candidate state
  const [selectedSlug, setSelectedSlug] = useState<string>('');

  // Synchronously select first candidate when resumes load
  useEffect(() => {
    if (resumes.length > 0 && !selectedSlug) {
      setSelectedSlug(resumes[0].slug);
    }
  }, [resumes, selectedSlug]);

  const { mutate: toggleSave } = useToggleSaveResumeOptimistic();

  const currentSelectedIndex = useMemo(() => {
    return resumes.findIndex((r) => r.slug === (selectedSlug || resumes[0]?.slug));
  }, [resumes, selectedSlug]);

  const handleSave = useCallback(
    (slug: string) => {
      toggleSave(slug, {
        onSuccess: (resData: any) => {
          const isSaved = resData?.isSaved;
          toastMessages.success(
            isSaved ? t('profileCard.messages.saveSuccess') : t('profileCard.messages.unsaveSuccess')
          );
        },
        onError: () => {
          toastMessages.error('Đã xảy ra lỗi khi lưu hồ sơ. Vui lòng thử lại.');
        },
      });
    },
    [toggleSave, t]
  );

  // Keyboard navigation for Master Candidate List (↑/↓ to navigate, S to save, Enter to open full profile)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      if (!resumes || resumes.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = currentSelectedIndex < resumes.length - 1 ? currentSelectedIndex + 1 : 0;
        if (resumes[nextIndex]) {
          setSelectedSlug(resumes[nextIndex].slug);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = currentSelectedIndex > 0 ? currentSelectedIndex - 1 : resumes.length - 1;
        if (resumes[prevIndex]) {
          setSelectedSlug(resumes[prevIndex].slug);
        }
      } else if (e.key === 's' || e.key === 'S') {
        const activeResume = resumes[currentSelectedIndex >= 0 ? currentSelectedIndex : 0];
        if (activeResume) {
          e.preventDefault();
          handleSave(activeResume.slug);
        }
      } else if (e.key === 'Enter') {
        const activeResume = resumes[currentSelectedIndex >= 0 ? currentSelectedIndex : 0];
        if (activeResume) {
          e.preventDefault();
          const targetUrl = localizeRoutePath(
            `/${formatRoute(ROUTES.EMPLOYER.PROFILE_DETAIL, activeResume.slug)}`,
            i18n.language
          );
          window.open(targetUrl, '_blank');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [resumes, currentSelectedIndex, handleSave, i18n.language]);

  const handleChangePage = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    setSelectedSlug('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (_: React.SyntheticEvent, newTab: 'all' | 'ai') => {
    setActiveTab(newTab);
    setPage(1);
    setSelectedSlug('');
    dispatch(
      searchResume({
        ...resumeFilter,
        aiSuggested: newTab === 'ai' ? true : undefined,
        sort: newTab === 'ai' ? 'suitable' : sortOption,
        page: 1,
      } as ResumeFilter)
    );
  };

  const handleSortChange = (newSort: string) => {
    setSortOption(newSort);
    setPage(1);
    dispatch(
      searchResume({
        ...resumeFilter,
        sort: newSort,
        page: 1,
      } as ResumeFilter)
    );
  };

  const totalPages = Math.ceil(count / pageSize);
  const selectedResume = resumes.find((r) => r.slug === selectedSlug) || (resumes[0] ?? null);

  return {
    t,
    control,
    handleSubmit,
    handleFilter,
    handleReset,
    allConfig,
    drawerOpen,
    setDrawerOpen,
    activeFilterCount,
    formattedJobPostOptions,
    activeTab,
    sortOption,
    handleTabChange,
    handleSortChange,
    isLoading,
    resumes,
    count,
    selectedSlug,
    setSelectedSlug,
    selectedResume,
    handleSave,
    page,
    totalPages,
    handleChangePage,
  };
};

export default useProfileCardState;
