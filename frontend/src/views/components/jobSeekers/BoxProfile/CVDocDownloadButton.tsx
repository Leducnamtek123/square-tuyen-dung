'use client';

import React, { useState, useEffect } from 'react';
import { Chip, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CVDoc, { ExtendedResume } from '@/components/Features/CVDoc';
import toSlug from '@/utils/customData';
import { APP_NAME } from '@/configs/constants';
import type { User } from '@/types/models';

interface CVDocDownloadButtonProps {
  resume: ExtendedResume;
  currentUser: User | null;
  selectedColor: string;
  isGeneratingPDF: boolean;
  handleDownloadClick?: (e: React.MouseEvent) => void;
  blobRef?: React.MutableRefObject<Blob | null>;
  t: (key: string) => string;
}

const CVDocDownloadButton = ({
  resume,
  currentUser,
  selectedColor,
  isGeneratingPDF,
  t,
}: CVDocDownloadButtonProps) => {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading || !resume || !currentUser) return;

    setLoading(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const blob = await pdf(
        <CVDoc resume={resume} user={currentUser} themeColor={selectedColor} />
      ).toBlob();

      const fileName = `${APP_NAME}_CV_${currentUser?.fullName || ''}-${toSlug(resume?.title || 'title')}.pdf`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[CVDocDownloadButton] Failed to generate PDF:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <Chip
        size="small"
        icon={<DownloadIcon />}
        color="secondary"
        label={t('common:actions.download')}
        sx={{
          boxShadow: (theme) => theme.customShadows.medium,
        }}
      />
    );
  }

  return (
    <Chip
      size="small"
      icon={loading || isGeneratingPDF ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
      color="secondary"
      label={loading || isGeneratingPDF ? t('common:loading') : t('common:actions.download')}
      onClick={handleDownload}
      disabled={loading || isGeneratingPDF}
      sx={{
        boxShadow: (theme) => theme.customShadows.medium,
        '&:hover': { transform: 'scale(1.03)' },
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
      }}
    />
  );
};

export default CVDocDownloadButton;
