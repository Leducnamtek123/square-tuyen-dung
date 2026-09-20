'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { LoadingButton } from '@mui/lab';
import { Box } from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { useTranslation } from 'react-i18next';
import { ROLES_NAME } from '@/configs/constants';
import { RootState } from '@/redux/store';
import companyService from '@/services/companyService';
import errorHandling from '@/utils/errorHandling';
import toastMessages from '@/utils/toastMessages';

interface CompanyFollowButtonProps {
  slug: string;
  isFollowed: boolean;
}

const CompanyFollowButton = ({ slug, isFollowed }: CompanyFollowButtonProps) => {
  const { t } = useTranslation('public');
  const { isAuthenticated, currentUser } = useSelector((state: RootState) => state.user);
  const [isLoadingFollow, setIsLoadingFollow] = React.useState(false);
  const [followOverride, setFollowOverride] = React.useState<boolean | null>(null);
  const followed = followOverride ?? isFollowed;

  const handleFollow = async () => {
    setIsLoadingFollow(true);

    try {
      const resData = await companyService.followCompany(slug);

      setFollowOverride(resData.isFollowed);

      toastMessages.success(
        resData.isFollowed ? t('companyDetail.followedSuccessfully') : t('companyDetail.unfollowedSuccessfully')
      );
    } catch (error) {
      errorHandling(error);
    } finally {
      setIsLoadingFollow(false);
    }
  };

  if (!isAuthenticated || currentUser?.roleName !== ROLES_NAME.JOB_SEEKER) {
    return null;
  }

  return (
    <Box sx={{ px: 2.5, pb: 2.5, pt: 0.5, mt: 'auto', width: '100%' }}>
      <LoadingButton
        fullWidth
        onClick={handleFollow}
        startIcon={
          followed ? (
            <BookmarkIcon sx={{ fontSize: 18, color: '#2563eb' }} />
          ) : (
            <BookmarkBorderIcon sx={{ fontSize: 18, color: '#ffffff' }} />
          )
        }
        loading={isLoadingFollow}
        loadingPosition="start"
        variant={followed ? 'outlined' : 'contained'}
        sx={{
          height: 42,
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          letterSpacing: '-0.01em',
          transition: 'all 0.2s ease-in-out',
          ...(followed
            ? {
                bgcolor: '#eff6ff',
                color: '#1d4ed8',
                borderColor: '#bfdbfe',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#dbeafe',
                  borderColor: '#93c5fd',
                  color: '#1e40af',
                },
              }
            : {
                bgcolor: '#2563eb',
                color: '#ffffff',
                border: '1px solid #2563eb',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.18)',
                '&:hover': {
                  bgcolor: '#1d4ed8',
                  borderColor: '#1d4ed8',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)',
                },
              }),
        }}
      >
        <span>
          {followed ? t('company.following') : t('company.follow')}
        </span>
      </LoadingButton>
    </Box>
  );
};

export default CompanyFollowButton;
