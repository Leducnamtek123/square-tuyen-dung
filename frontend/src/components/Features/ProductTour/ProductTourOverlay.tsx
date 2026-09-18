'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Portal,
  Fade,
  Stack,
  alpha,
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import type { TourConfig, TourStep } from './types';

interface ProductTourOverlayProps {
  activeTour: TourConfig | null;
  currentStepIndex: number;
  isOpen: boolean;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

const SPOTLIGHT_PADDING = 8;
const CARD_WIDTH = 350;
const CARD_ESTIMATED_HEIGHT = 190;

export const ProductTourOverlay: React.FC<ProductTourOverlayProps> = ({
  activeTour,
  currentStepIndex,
  isOpen,
  onNext,
  onPrev,
  onClose,
}) => {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  const cardRef = useRef<HTMLDivElement | null>(null);

  const currentStep: TourStep | undefined = activeTour?.steps[currentStepIndex];
  const totalSteps = activeTour?.steps.length || 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Determine light vs dark mode for this tour - default to light theme per design system
  const isDarkMode =
    activeTour?.themeMode === 'dark' ||
    (activeTour?.themeMode === 'auto' &&
      typeof document !== 'undefined' &&
      document.documentElement.classList.contains('dark'));

  // 1. Measure Window & Target Position
  const updatePosition = useCallback(() => {
    if (typeof window === 'undefined') return;

    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    if (!currentStep) {
      setTargetRect(null);
      return;
    }

    const targetEl = document.querySelector(currentStep.target);
    if (!targetEl) {
      setTargetRect(null);
      return;
    }

    const rect = targetEl.getBoundingClientRect();
    setTargetRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      bottom: rect.bottom,
      right: rect.right,
    });
  }, [currentStep]);

  // 2. Scroll into view and update rect on step change
  useEffect(() => {
    if (!isOpen || !currentStep) return;

    // Run beforeStep callback if provided
    if (currentStep.beforeStep) {
      void currentStep.beforeStep();
    }

    const timer = setTimeout(() => {
      const targetEl = document.querySelector(currentStep.target);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
      updatePosition();
    }, 120);

    return () => clearTimeout(timer);
  }, [isOpen, currentStep, updatePosition]);

  // 3. Keep updating on window resize or scroll
  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    const interval = setInterval(updatePosition, 400);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      clearInterval(interval);
    };
  }, [isOpen, updatePosition]);

  // 4. Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        onNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onNext, onPrev, onClose]);

  if (!isOpen || !activeTour || !currentStep) {
    return null;
  }

  // 5. Calculate Popover Position
  const pad = SPOTLIGHT_PADDING;
  const placement = currentStep.placement || 'auto';

  let popoverTop = 100;
  let popoverLeft = 100;

  if (targetRect) {
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;

    switch (placement) {
      case 'top':
        popoverTop = targetRect.top - pad - CARD_ESTIMATED_HEIGHT - 16;
        popoverLeft = targetCenterX - CARD_WIDTH / 2;
        break;
      case 'bottom':
        popoverTop = targetRect.bottom + pad + 16;
        popoverLeft = targetCenterX - CARD_WIDTH / 2;
        break;
      case 'left':
        popoverTop = targetCenterY - CARD_ESTIMATED_HEIGHT / 2;
        popoverLeft = targetRect.left - pad - CARD_WIDTH - 16;
        break;
      case 'right':
        popoverTop = targetCenterY - CARD_ESTIMATED_HEIGHT / 2;
        popoverLeft = targetRect.right + pad + 16;
        break;
      case 'auto':
      default:
        if (targetRect.bottom + CARD_ESTIMATED_HEIGHT + 24 < windowSize.height) {
          popoverTop = targetRect.bottom + pad + 16;
          popoverLeft = targetCenterX - CARD_WIDTH / 2;
        } else if (targetRect.top - CARD_ESTIMATED_HEIGHT - 24 > 0) {
          popoverTop = targetRect.top - pad - CARD_ESTIMATED_HEIGHT - 16;
          popoverLeft = targetCenterX - CARD_WIDTH / 2;
        } else if (targetRect.right + CARD_WIDTH + 24 < windowSize.width) {
          popoverTop = targetCenterY - CARD_ESTIMATED_HEIGHT / 2;
          popoverLeft = targetRect.right + pad + 16;
        } else {
          popoverTop = targetCenterY - CARD_ESTIMATED_HEIGHT / 2;
          popoverLeft = Math.max(16, targetRect.left - pad - CARD_WIDTH - 16);
        }
        break;
    }

    // Viewport clamping
    popoverLeft = Math.max(16, Math.min(popoverLeft, windowSize.width - CARD_WIDTH - 16));
    popoverTop = Math.max(16, Math.min(popoverTop, windowSize.height - CARD_ESTIMATED_HEIGHT - 16));
  } else {
    // Center of screen if element not found
    popoverLeft = Math.max(16, (windowSize.width - CARD_WIDTH) / 2);
    popoverTop = Math.max(16, (windowSize.height - CARD_ESTIMATED_HEIGHT) / 2);
  }

  return (
    <Portal>
      <Fade in={isOpen} timeout={220}>
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            pointerEvents: 'auto',
            overflow: 'hidden',
          }}
        >
          {/* SVG Dimmed Overlay with Spotlight Cutout */}
          <svg
            width="100%"
            height="100%"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              pointerEvents: 'none',
            }}
          >
            <defs>
              <mask id="infohr-tour-spotlight-mask">
                {/* Everything white is visible (opaque backdrop) */}
                <rect x="0" y="0" width="100%" height="100%" fill="#ffffff" />
                {/* Black cutout creates the transparent hole */}
                {targetRect && (
                  <rect
                    x={Math.max(0, targetRect.left - pad)}
                    y={Math.max(0, targetRect.top - pad)}
                    width={targetRect.width + pad * 2}
                    height={targetRect.height + pad * 2}
                    rx="14"
                    ry="14"
                    fill="#000000"
                  />
                )}
              </mask>
            </defs>
            {/* The Translucent Backdrop: soft 45% in light mode, 72% in dark mode */}
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill={isDarkMode ? 'rgba(0, 0, 0, 0.72)' : 'rgba(15, 23, 42, 0.45)'}
              mask="url(#infohr-tour-spotlight-mask)"
            />
          </svg>

          {/* Refined Focus Ring Around Spotlight */}
          {targetRect && (
            <Box
              sx={{
                position: 'absolute',
                top: Math.max(0, targetRect.top - pad),
                left: Math.max(0, targetRect.left - pad),
                width: targetRect.width + pad * 2,
                height: targetRect.height + pad * 2,
                borderRadius: '14px',
                border: isDarkMode ? '2px solid #3b82f6' : '2px solid #2563eb',
                boxShadow: isDarkMode
                  ? '0 0 0 4px rgba(59, 130, 246, 0.25), 0 12px 28px -4px rgba(0, 0, 0, 0.6)'
                  : '0 0 0 4px rgba(37, 99, 235, 0.18), 0 10px 25px -4px rgba(15, 23, 42, 0.15)',
                pointerEvents: 'none',
                transition: 'all 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          )}

          {/* Clickable Backdrop Area */}
          <Box
            onClick={(e) => {
              e.stopPropagation();
            }}
            sx={{
              position: 'absolute',
              inset: 0,
              cursor: 'default',
            }}
          />

          {/* Floating Tour Popover Card - Adaptive Light/Dark Theme */}
          <Box
            ref={cardRef}
            sx={{
              position: 'absolute',
              top: `${popoverTop}px`,
              left: `${popoverLeft}px`,
              width: CARD_WIDTH,
              maxWidth: 'calc(100vw - 32px)',
              bgcolor: isDarkMode ? 'rgba(15, 23, 42, 0.96)' : '#ffffff',
              backdropFilter: 'blur(16px)',
              color: isDarkMode ? '#ffffff' : '#0f172a',
              borderRadius: '16px',
              border: isDarkMode
                ? '1px solid rgba(59, 130, 246, 0.3)'
                : '1px solid rgba(226, 232, 240, 0.95)',
              boxShadow: isDarkMode
                ? '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(51, 65, 85, 0.6)'
                : '0 20px 45px -12px rgba(15, 23, 42, 0.14), 0 0 0 1px rgba(226, 232, 240, 0.8)',
              p: 2.5,
              zIndex: 100000,
              transition: 'top 0.24s cubic-bezier(0.16, 1, 0.3, 1), left 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: 'auto',
            }}
          >
            {/* Header: Title & Close Icon */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: '8px',
                    bgcolor: isDarkMode ? 'rgba(37, 99, 235, 0.25)' : '#eff6ff',
                    border: isDarkMode ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid #dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isDarkMode ? '#60a5fa' : '#2563eb',
                    flexShrink: 0,
                  }}
                >
                  <LightbulbOutlinedIcon sx={{ fontSize: 17 }} />
                </Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    color: isDarkMode ? '#ffffff' : '#0f172a',
                    fontSize: '0.9375rem',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {currentStep.title}
                </Typography>
              </Stack>

              <IconButton
                size="small"
                onClick={onClose}
                aria-label="Đóng hướng dẫn"
                sx={{
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                  p: 0.5,
                  borderRadius: '8px',
                  '&:hover': {
                    color: isDarkMode ? '#ffffff' : '#0f172a',
                    bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f1f5f9',
                  },
                }}
              >
                <CloseOutlinedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Stack>

            {/* Content Text */}
            <Typography
              variant="body2"
              sx={{
                color: isDarkMode ? '#cbd5e1' : '#475569',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                mb: 2.25,
              }}
            >
              {currentStep.content}
            </Typography>

            {/* Footer: Step Dots Indicator & Action Buttons */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              {/* Progress Indicator */}
              <Stack direction="row" spacing={0.6} alignItems="center">
                {activeTour.steps.map((_, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      width: idx === currentStepIndex ? 18 : 6,
                      height: 6,
                      borderRadius: '999px',
                      bgcolor:
                        idx === currentStepIndex
                          ? '#2563eb'
                          : isDarkMode
                          ? '#475569'
                          : '#cbd5e1',
                      transition: 'all 0.25s ease',
                    }}
                  />
                ))}
                <Typography
                  variant="caption"
                  sx={{
                    ml: 1,
                    color: isDarkMode ? '#94a3b8' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    userSelect: 'none',
                  }}
                >
                  {currentStepIndex + 1} / {totalSteps}
                </Typography>
              </Stack>

              {/* Action Buttons with 100% explicit styles (prevent MUI light theme override leaks) */}
              <Stack direction="row" spacing={1} alignItems="center">
                {currentStepIndex === 0 ? (
                  /* Step 1: "Bỏ qua" button */
                  <Button
                    size="small"
                    onClick={onClose}
                    sx={{
                      bgcolor: 'transparent !important',
                      color: isDarkMode ? '#cbd5e1 !important' : '#64748b !important',
                      border: isDarkMode
                        ? '1px solid rgba(255, 255, 255, 0.18) !important'
                        : '1px solid #e2e8f0 !important',
                      fontSize: '0.8125rem !important',
                      fontWeight: '600 !important',
                      textTransform: 'none !important',
                      borderRadius: '8px !important',
                      px: 1.5,
                      py: 0.5,
                      minHeight: '32px !important',
                      boxShadow: 'none !important',
                      '&:hover': {
                        bgcolor: isDarkMode
                          ? 'rgba(255, 255, 255, 0.08) !important'
                          : '#f1f5f9 !important',
                        color: isDarkMode ? '#ffffff !important' : '#0f172a !important',
                        borderColor: isDarkMode
                          ? 'rgba(255, 255, 255, 0.3) !important'
                          : '#cbd5e1 !important',
                      },
                    }}
                  >
                    Bỏ qua
                  </Button>
                ) : (
                  /* Step > 1: "Quay lại" button */
                  <Button
                    size="small"
                    onClick={onPrev}
                    startIcon={<ArrowBackOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                    sx={{
                      bgcolor: 'transparent !important',
                      color: isDarkMode ? '#cbd5e1 !important' : '#475569 !important',
                      border: isDarkMode
                        ? '1px solid rgba(255, 255, 255, 0.18) !important'
                        : '1px solid #cbd5e1 !important',
                      fontSize: '0.8125rem !important',
                      fontWeight: '600 !important',
                      textTransform: 'none !important',
                      borderRadius: '8px !important',
                      px: 1.5,
                      py: 0.5,
                      minHeight: '32px !important',
                      boxShadow: 'none !important',
                      '&:hover': {
                        bgcolor: isDarkMode
                          ? 'rgba(255, 255, 255, 0.08) !important'
                          : '#f8fafc !important',
                        color: isDarkMode ? '#ffffff !important' : '#0f172a !important',
                        borderColor: isDarkMode
                          ? 'rgba(255, 255, 255, 0.35) !important'
                          : '#94a3b8 !important',
                      },
                    }}
                  >
                    Quay lại
                  </Button>
                )}

                {/* Primary Forward/Finish button */}
                <Button
                  size="small"
                  onClick={isLastStep ? onClose : onNext}
                  endIcon={
                    isLastStep ? (
                      <CheckOutlinedIcon sx={{ fontSize: '14px !important' }} />
                    ) : (
                      <ArrowForwardOutlinedIcon sx={{ fontSize: '14px !important' }} />
                    )
                  }
                  sx={{
                    bgcolor: '#2563eb !important',
                    color: '#ffffff !important',
                    border: 'none !important',
                    fontSize: '0.8125rem !important',
                    fontWeight: '700 !important',
                    textTransform: 'none !important',
                    borderRadius: '8px !important',
                    px: 2,
                    py: 0.5,
                    minHeight: '32px !important',
                    boxShadow: isDarkMode
                      ? '0 4px 14px rgba(37, 99, 235, 0.4) !important'
                      : '0 2px 8px rgba(37, 99, 235, 0.25) !important',
                    '&:hover': {
                      bgcolor: '#1d4ed8 !important',
                      boxShadow: isDarkMode
                        ? '0 6px 18px rgba(37, 99, 235, 0.55) !important'
                        : '0 4px 12px rgba(37, 99, 235, 0.35) !important',
                    },
                  }}
                >
                  {isLastStep ? 'Hoàn tất' : 'Tiếp theo'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Fade>
    </Portal>
  );
};
