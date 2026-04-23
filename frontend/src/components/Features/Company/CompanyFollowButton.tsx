import React from 'react';
import { useSelector } from 'react-redux';
import { LoadingButton } from '@mui/lab';
import { Stack } from '@mui/material';
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
        resData.isFollowed ? 'Followed successfully.' : 'Unfollowed successfully.'
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
    <Stack justifyContent="flex-end" sx={{ py: 1, px: 2, height: '100%' }}>
      <LoadingButton
        fullWidth
        onClick={handleFollow}
        startIcon={followed ? <BookmarkIcon sx={{ color: 'common.white' }} /> : <BookmarkBorderIcon />}
        loading={isLoadingFollow}
        loadingPosition="start"
        variant={followed ? 'contained' : 'outlined'}
        color="warning"
        sx={{ textTransform: 'inherit' }}
      >
        <span>
          {followed ? (
            <span style={{ color: 'white' }}>{t('company.following', 'Đang theo dõi')}</span>
          ) : (
            t('company.follow', 'Theo dõi')
          )}
        </span>
      </LoadingButton>
    </Stack>
  );
};

export default CompanyFollowButton;
