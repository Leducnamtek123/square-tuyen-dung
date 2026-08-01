'use client';

import React, { useState, useEffect } from 'react';
import { Chip, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CVDoc, { ExtendedResume } from '@/components/Features/CVDoc';
import { PDFDownloadLink } from '@/components/Features/CVDoc/pdf';
import toSlug from '@/utils/customData';
import { APP_NAME } from '@/configs/constants';
import type { User } from '@/types/models';

const PDFDownloadLinkAny = PDFDownloadLink as React.ElementType;

interface CVDocDownloadButtonProps {
  resume: ExtendedResume;
  currentUser: User | null;
  selectedColor: string;
  isGeneratingPDF: boolean;
  handleDownloadClick: (e: React.MouseEvent) => void;
  blobRef: React.MutableRefObject<Blob | null>;
  t: (key: string) => string;
}

const CVDocDownloadButton = ({
  resume,
  currentUser,
  selectedColor,
  isGeneratingPDF,
  handleDownloadClick,
  blobRef,
  t,
}: CVDocDownloadButtonProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !resume) {
    return (
      <Chip
        size="small"
        icon={<DownloadIcon />}
        color="secondary"
        label={t('common:actions.download')}
        onClick={handleDownloadClick}
        sx={{
          boxShadow: (theme) => theme.customShadows.medium,
          '&:hover': { transform: 'scale(1.03)' },
          transition: 'all 0.2s ease-in-out',
        }}
      />
    );
  }

  return (
    <PDFDownloadLinkAny
      document={<CVDoc resume={resume} user={currentUser} themeColor={selectedColor} />}
      fileName={`${APP_NAME}_CV_${currentUser?.fullName || ''}-${toSlug(resume?.title || 'title')}.pdf`}
      style={{ textDecoration: 'none' }}
    >
      {({ loading, blob }: { loading: boolean; blob: Blob | null }) => {
        if (blob) {
          blobRef.current = blob;
        }
        return loading || isGeneratingPDF ? (
          <Chip
            size="small"
            icon={<CircularProgress size={16} />}
            color="secondary"
            label={t('common:loading')}
            sx={{ boxShadow: (theme) => theme.customShadows.medium }}
          />
        ) : (
          <Chip
            size="small"
            icon={<DownloadIcon />}
            color="secondary"
            label={t('common:actions.download')}
            onClick={handleDownloadClick}
            sx={{
              boxShadow: (theme) => theme.customShadows.medium,
              '&:hover': { transform: 'scale(1.03)' },
              transition: 'all 0.2s ease-in-out',
            }}
          />
        );
      }}
    </PDFDownloadLinkAny>
  );
};

export default CVDocDownloadButton;
