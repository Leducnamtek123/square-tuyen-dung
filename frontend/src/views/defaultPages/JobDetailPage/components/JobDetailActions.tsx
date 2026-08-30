import React from 'react';
import { Button, CircularProgress, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import { ROLES_NAME } from '../../../../configs/constants';
import type { User } from '@/types/models';

interface JobDetailActionsProps {
  applicationState: 'applied' | 'available';
  saveState: 'idle' | 'saved' | 'saving';
  handleSave: () => void;
  handleShowApplyForm: () => void;
  setOpenSharePopup: (open: boolean) => void;
  onOpenReport: () => void;
  viewer: {
    isAuthenticated: boolean;
    currentUser: User | null;
  };
}

const JobDetailActions: React.FC<JobDetailActionsProps> = ({
  applicationState,
  saveState,
  handleSave,
  handleShowApplyForm,
  setOpenSharePopup,
  onOpenReport,
  viewer,
}) => {
  const { t } = useTranslation(['public']);
  const isApplied = applicationState === 'applied';
  const isSaved = saveState === 'saved';
  const isLoadingSave = saveState === 'saving';
  const canApply =
    !viewer.isAuthenticated ||
    viewer.currentUser?.roleName === ROLES_NAME.JOB_SEEKER;

  const handleApplyClick = () => {
    handleShowApplyForm();
  };

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      alignItems="center"
      flexWrap="wrap"
      sx={{ '& > *': { m: '0 !important', mr: { sm: '12px !important' }, mb: { xs: '8px !important', sm: '0 !important' } } }}
    >
      {canApply && (
        <>
          {isApplied ? (
            <Button
              variant="outlined"
              size="large"
              disabled
              startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#16a34a' }} />}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                bgcolor: '#f0fdf4 !important',
                color: '#16a34a !important',
                borderColor: '#bbf7d0 !important',
                fontWeight: 700,
                fontSize: '0.925rem',
                borderRadius: '10px',
                px: 3.25,
                py: 1.15,
                textTransform: 'none',
              }}
            >
              {t("jobDetail.actions.applied")}
            </Button>
          ) : (
            <Button
              variant="contained"
              size="large"
              onClick={handleApplyClick}
              startIcon={<SendIcon sx={{ fontSize: 18 }} />}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                bgcolor: '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.925rem',
                borderRadius: '10px',
                px: 3.25,
                py: 1.15,
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#1d4ed8',
                  boxShadow: '0 6px 20px rgba(37, 99, 235, 0.38)',
                  transform: 'translateY(-1px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              {t("jobDetail.actions.apply")}
            </Button>
          )}

          <Button
            onClick={handleSave}
            variant="outlined"
            size="large"
            disabled={isLoadingSave}
            startIcon={
              isLoadingSave ? (
                <CircularProgress size={16} color="inherit" />
              ) : isSaved ? (
                <FavoriteIcon sx={{ color: '#ef4444', fontSize: 20 }} />
              ) : (
                <FavoriteBorderIcon sx={{ color: '#64748b', fontSize: 20 }} />
              )
            }
            sx={{
              width: { xs: '100%', sm: 'auto' },
              fontWeight: isSaved ? 700 : 600,
              fontSize: '0.925rem',
              borderRadius: '10px',
              px: 2.75,
              py: 1.15,
              textTransform: 'none',
              transition: 'all 0.2s ease',
              ...(isSaved
                ? {
                    bgcolor: '#fef2f2',
                    color: '#ef4444',
                    border: '1px solid #fecaca',
                    '&:hover': {
                      bgcolor: '#fee2e2',
                      borderColor: '#fca5a5',
                    },
                  }
                : {
                    bgcolor: '#ffffff',
                    color: '#334155',
                    border: '1px solid #e2e8f0',
                    '&:hover': {
                      bgcolor: '#fef2f2',
                      color: '#ef4444',
                      borderColor: '#fca5a5',
                      '& .MuiButton-startIcon svg': { color: '#ef4444' },
                    },
                  }),
            }}
          >
            <span>{isSaved ? t("jobDetail.actions.saved") : t("jobDetail.actions.save")}</span>
          </Button>
        </>
      )}

      <Button
        variant="outlined"
        size="large"
        onClick={() => setOpenSharePopup(true)}
        startIcon={<ShareIcon sx={{ fontSize: 18, color: '#64748b' }} />}
        sx={{
          width: { xs: '100%', sm: 'auto' },
          bgcolor: '#ffffff',
          color: '#334155',
          border: '1px solid #e2e8f0',
          fontWeight: 600,
          fontSize: '0.925rem',
          borderRadius: '10px',
          px: 2.75,
          py: 1.15,
          textTransform: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: '#f8fafc',
            borderColor: '#cbd5e1',
            color: '#0f172a',
          },
        }}
      >
        {t("jobDetail.actions.share")}
      </Button>

      <Button
        variant="outlined"
        size="large"
        onClick={onOpenReport}
        startIcon={<FlagOutlinedIcon sx={{ fontSize: 18, color: '#64748b' }} />}
        sx={{
          width: { xs: '100%', sm: 'auto' },
          bgcolor: '#ffffff',
          color: '#64748b',
          border: '1px solid #e2e8f0',
          fontWeight: 600,
          fontSize: '0.925rem',
          borderRadius: '10px',
          px: 2.75,
          py: 1.15,
          textTransform: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: '#fef2f2',
            color: '#ef4444',
            borderColor: '#fca5a5',
            '& .MuiButton-startIcon svg': { color: '#ef4444' },
          },
        }}
      >
        {t("jobDetail.actions.report")}
      </Button>
    </Stack>
  );
};

export default JobDetailActions;
