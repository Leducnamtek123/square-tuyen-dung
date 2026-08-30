'use client';

import React, { useState, useRef, useCallback } from 'react';
import type { JobHoverPreviewData } from './JobHoverPreviewCard';

export const useJobHoverPreview = () => {
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

    // Small delay (140ms) to prevent flicker during fast scrolling
    openTimerRef.current = setTimeout(() => {
      setAnchorEl(target);
      setHoveredJob(job);
      setIsOpen(true);
    }, 140);
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    clearTimers();
    // Grace period (220ms) so user can move cursor to the Popper safely
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      setHoveredJob(null);
      setAnchorEl(null);
    }, 220);
  }, []);

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
