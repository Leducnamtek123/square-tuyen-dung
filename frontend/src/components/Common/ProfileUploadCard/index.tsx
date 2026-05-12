'use client';
import * as React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { Box, IconButton, Typography, Stack, Chip, Skeleton, Tooltip, Theme } from "@mui/material";
import HelpIcon from '@mui/icons-material/Help';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import StarIcon from '@mui/icons-material/Star';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteForever from '@mui/icons-material/DeleteForever';
import downloadPdf, { formatRoute } from '@/utils/funcUtils';
import { IMAGES, ROUTES } from '@/configs/constants';
import defaultTheme from '@/themeConfigs/defaultTheme';

interface ProfileUploadCardProps {
  resumeImage: string;
  fileUrl: string;
  title: string;
  updateAt: string | number | Date;
  slug: string;
  id: string | number;
  isActive: boolean;
  handleDelete: (slug: string) => void;
  handleActive: (slug: string) => void;
}

interface ProfileUploadImageProps {
  resumeImage: string;
}

const ProfileUploadImage = ({ resumeImage }: ProfileUploadImageProps) => {
  const [hasImageError, setHasImageError] = React.useState(false);
  const cardImageSrc = !hasImageError && resumeImage ? resumeImage : IMAGES.coverImageDefault;

  return (
    <Image
      src={cardImageSrc}
      onError={() => setHasImageError(true)}
      fill
      sizes="100vw"
      style={{ objectFit: 'cover', position: 'absolute', inset: 0, zIndex: 1 }}
      alt="BG"
    />
  );
};

const ProfileUploadCard = ({
  resumeImage,
  fileUrl,
  title,
  updateAt,
  slug,
  id,
  isActive,
  handleDelete,
  handleActive,
}: ProfileUploadCardProps) => {

  const { push } = useRouter();

  return (

    <Box

      sx={{

        height: 310,

        bgcolor: 'background.paper',

        position: 'relative',

        overflow: 'hidden',

        borderRadius: 4,

        boxShadow: (theme: Theme) => theme.customShadows.card,
        border: '1px solid rgba(26, 64, 125, 0.1)',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme: Theme) => theme.customShadows.large,
        }

      }}

    >

      <ProfileUploadImage key={resumeImage} resumeImage={resumeImage} />

      <Box

        sx={{

          height: '100%',

          width: '100%',

          bottom: 0,

          left: 0,

          zIndex: 2,

          position: 'absolute',

          background: 'linear-gradient(180deg, rgba(15, 32, 64, 0.04) 0%, rgba(15, 32, 64, 0.72) 54%, rgba(10, 22, 40, 0.96) 100%)',

        }}

      >

        <Stack direction="row" justifyContent="flex-end" sx={{ margin: 2 }}>

          {isActive ? (

            <Chip

              sx={{

                backdropFilter: 'blur(12px)',

                backgroundColor: 'rgba(16, 185, 129, 0.92)',
                border: '1px solid rgba(255,255,255,0.22)',
                boxShadow: '0 10px 22px rgba(16,185,129,0.22)',

                '& .MuiChip-label': {

                  color: 'white',

                }

              }}

              size="small"

              icon={<StarIcon sx={{ color: 'warning.main' }} />}

              label="Cho phép tìm kiếm"

              onClick={() => handleActive(slug)}

            />

          ) : (

            <Chip

              sx={{

                backdropFilter: 'blur(12px)',

                backgroundColor: 'rgba(255, 255, 255, 0.16)',
                border: '1px solid rgba(255,255,255,0.22)',

                '& .MuiChip-label': {

                  color: 'white',

                }

              }}

              size="small"

              icon={<StarOutlineIcon sx={{ color: 'warning.main' }} />}

              label="Cho phép tìm kiếm"

              onClick={() => handleActive(slug)}

            />

          )}

          <Tooltip

            title={`Bật "Cho phép tìm kiếm" sẽ giúp nhà tuyển dụng tìm thấy hồ sơ của bạn và họ có thể liên hệ với bạn về công việc mới. Chỉ có duy nhất một hồ sơ được bật trạng thái "cho phép tìm kiếm" trong tất cả hồ sơ của bạn.`}

            arrow

          >

            <HelpIcon sx={{ ml: 1, color: 'rgba(255, 255, 255, 0.7)' }} />

          </Tooltip>

        </Stack>

        <Box

          sx={{

            position: 'absolute',

            zIndex: 3,

            bottom: 0,

            left: 0,

            right: 0,

            p: 2,

            color: 'white',

          }}

        >

          <Stack spacing={2}>

            <Stack

              direction="row"

              justifyContent="space-between"

              alignItems="center"

            >

              <Typography
                variant="h6"
                sx={{
                  minWidth: 0,
                  pr: 1,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                  fontWeight: 800,
                  lineHeight: 1.25,
                }}
              >
                {title}
              </Typography>

              <IconButton

                aria-label="edit resume"
                sx={{

                  width: 38,
                  height: 38,
                  bgcolor: 'rgba(255, 255, 255, 0.14)',

                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  boxShadow: '0 10px 24px rgba(0,0,0,0.18)',

                  '&:hover': {

                    bgcolor: 'rgba(255, 255, 255, 0.24)',

                  }

                }}

                size="small"

                onClick={() => push(`/${formatRoute(ROUTES.JOB_SEEKER.ATTACHED_PROFILE, slug)}`)}

              >

                <EditIcon sx={{ color: 'white' }} />

              </IconButton>

            </Stack>

            <Typography variant="caption" sx={{ opacity: 0.8 }}>

              Cập nhật lần cuối: {dayjs(updateAt).format('DD/MM/YYYY HH:mm:ss')}

            </Typography>

            <Stack direction="row" justifyContent="space-between" alignItems="center">

              <Chip

                sx={{

                  backdropFilter: 'blur(12px)',

                  backgroundColor: 'rgba(255, 255, 255, 0.16)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontWeight: 800,

                  '& .MuiChip-label': {

                    color: 'white',

                  }

                }}

                size="small"

                icon={<DownloadIcon sx={{ color: defaultTheme.palette.secondary.main }} />}

                label="Tải xuống"

                onClick={() => downloadPdf(fileUrl, title)}

              />

              <IconButton

                aria-label="delete resume"
                sx={{

                  width: 38,
                  height: 38,
                  bgcolor: 'rgba(220, 38, 38, 0.16)',

                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.16)',

                  '&:hover': {

                    bgcolor: 'rgba(220, 38, 38, 0.26)',

                  }

                }}

                size="small"

                onClick={() => handleDelete(slug)}

              >

                <DeleteForever sx={{ color: 'error.light' }} />

              </IconButton>

            </Stack>

          </Stack>

        </Box>

      </Box>

    </Box>

  );

};

const Loading = () => (

  <Box

    sx={{

      position: 'relative',

      overflow: 'hidden',

    }}

  >

    <Stack spacing={1}>

      <Skeleton variant="text" sx={{ fontSize: '1rem' }} />

      <Stack direction="row" spacing={2} alignItems="center">

        <Skeleton variant="circular" width={50} height={50} />

        <Typography flex={1}>

          <Skeleton />

        </Typography>

      </Stack>

      <Skeleton variant="rectangular" height={80} />

      <Skeleton variant="text" sx={{ fontSize: '1rem' }} />

      <Skeleton variant="text" sx={{ fontSize: '1rem' }} />

    </Stack>

  </Box>

);

ProfileUploadCard.Loading = Loading;

export default ProfileUploadCard;
