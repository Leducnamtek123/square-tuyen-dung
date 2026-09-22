'use client';

import React, { useState, useRef, useCallback } from 'react';
import type { JobHoverPreviewData } from './JobHoverPreviewCard';

export interface UseJobHoverPreviewOptions {
  openDelay?: number;
  closeDelay?: number;
}

export const useJobHoverPreview = (options?: UseJobHoverPreviewOptions) => {
  const openDelay = options?.openDelay ?? 350;
  const closeDelay = options?.closeDelay ?? 220;

  const [hoveredJob, setHoveredJob] = useState<JobHoverPreviewData | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openTimerRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleCardMouseEnter = useCallback((event: React.MouseEvent<HTMLElement>, job: JobHoverPreviewData) => {
    clearTimers();
    const target = event.currentTarget;

    // Intentional delay (350ms) to ensure smooth, gradual display and prevent flicker during fast movement
    openTimerRef.current = setTimeout(() => {
      setAnchorEl(target);
      setHoveredJob(job);
      setIsOpen(true);
    }, openDelay);
  }, [openDelay]);

  const handleCardMouseLeave = useCallback(() => {
    clearTimers();
    // Grace period so user can move cursor to the Popper safely
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      setHoveredJob(null);
      setAnchorEl(null);
    }, closeDelay);
  }, [closeDelay]);

  const handlePopperMouseEnter = useCallback(() => {
    clearTimers();
    setIsOpen(true);
  }, []);

  const handlePopperMouseLeave = useCallback(() => {
    clearTimers();
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      setHoveredJob(null);
      setAnchorEl(null);
    }, 180);
  }, []);

  const handleClose = useCallback(() => {
    clearTimers();
    setIsOpen(false);
    setHoveredJob(null);
    setAnchorEl(null);
  }, []);

  return {
    hoveredJob,
    anchorEl,
    isOpen,
    handleCardMouseEnter,
    handleCardMouseLeave,
    handlePopperMouseEnter,
    handlePopperMouseLeave,
    handleClose,
  };
};

export default useJobHoverPreview;
