'use client';

import React from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
} from '@mui/material';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CVDocDownloadButton from '../BoxProfile/CVDocDownloadButton';
import type { ExtendedResume } from '@/components/Features/CVDoc';
import type { User } from '@/types/models';

interface CandidateCVCardProps {
  resume: ExtendedResume | null;
  user: User | null;
}

const CandidateCVCard = ({ resume, user }: CandidateCVCardProps) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = React.useState<string | null>(null);

  const defaultFileName = `CV_${user?.fullName || 'Nam'}_2024.pdf`;
  const displayFileName = selectedFileName || defaultFileName;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx"
        style={{ display: 'none' }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <InsertDriveFileOutlinedIcon sx={{ color: '#2563eb' }} />
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
          CV của tôi
        </Typography>
      </Box>

      {/* PDF Attachment Item */}
      <Box
        sx={{
          p: 2,
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2.5,
          flexGrow: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
            }}
          >
            <PictureAsPdfIcon />
          </Box>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
              {displayFileName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.775rem' }}>
              Cập nhật: 20/05/2024 • 1.2 MB
            </Typography>
          </Box>
        </Box>

        {/* Download Action Button */}
        {resume && (
          <CVDocDownloadButton
            resume={resume}
            currentUser={user}
            selectedColor="#140861"
            isGeneratingPDF={false}
            t={(key: string) => (key.includes('loading') ? 'Đang tải' : 'Tải xuống')}
          />
        )}
      </Box>

      {/* Update new CV Button */}
      <Button
        variant="outlined"
        onClick={handleUploadClick}
        fullWidth
        sx={{
          borderRadius: '10px',
          borderColor: '#2563eb',
          color: '#2563eb',
          fontWeight: 700,
          py: 1.2,
          textTransform: 'none',
          '&:hover': {
            borderColor: '#1d4ed8',
            backgroundColor: '#eff6ff',
          },
        }}
      >
        Cập nhật CV mới
      </Button>
    </Card>
  );
};

export default CandidateCVCard;
