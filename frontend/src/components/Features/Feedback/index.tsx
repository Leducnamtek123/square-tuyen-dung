import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography, Box } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import errorHandling from '@/utils/errorHandling';
import toastMessages from '@/utils/toastMessages';
import BackdropLoading from '@/components/Common/Loading/BackdropLoading';
import RatingCustom from '@/components/Common/Controls/RatingCustom';
import MultilineTextFieldCustom from '@/components/Common/Controls/MultilineTextFieldCustom';
import contentService from '@/services/contentService';
import { FEEDBACK_IMAGES } from '@/configs/constants';

interface FeedbackProps {}

const Feedback = (_props: FeedbackProps) => {
  const { t } = useTranslation('common');

  const [open, setOpen] = React.useState(false);
  const [isFullScreenLoading, setIsFullScreenLoading] = React.useState(false);
  const [hover, setHover] = React.useState(-1);

  const schema = yup.object().shape({
    rating: yup.number().required(t('feedback.ratingRequired')),
    content: yup
      .string()
      .required(t('feedback.contentRequired'))
      .max(500, t('feedback.contentMax')),
  });

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      rating: 5,
      content: '',
    },
    resolver: yupResolver(schema),
  });

  const currentRating = watch('rating');

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  interface FeedbackData {
    rating: number;
    content: string;
  }

  const handleSendFeedback = (data: FeedbackData) => {
    const sendFeedback = async (payload: FeedbackData) => {
      setIsFullScreenLoading(true);
      try {
        await contentService.createFeedback(payload);
        handleClose();
        toastMessages.success(t('feedback.success'));
      } catch (error) {
        // We use an explicit cast here because errorHandling expects AxiosError but catching produces unknown.
        errorHandling(error);
      } finally {
        setIsFullScreenLoading(false);
      }
    };

    sendFeedback(data);
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={handleOpen}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, md: 24 },
          left: { xs: 16, md: 24 },
          padding: '8px 16px',
          textTransform: 'none',
          color: 'white',
          zIndex: 1250,
          boxShadow: (theme) => theme.customShadows.feedback,
          backdropFilter: 'blur(8px)',
          backgroundColor: (theme) => theme.palette.feedback.button.background,
          borderRadius: '20px 20px 20px 4px',
          fontSize: '0.95rem',
          fontWeight: 600,
          letterSpacing: '0.2px',
          '&:hover': {
            backgroundColor: (theme) => theme.palette.feedback.button.hover,
            transform: 'translateY(-2px)',
            boxShadow: (theme) => `0 12px 24px ${theme.palette.feedback.button.shadow}`,
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          animation: 'feedbackIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          '@keyframes feedbackIn': {
            '0%': {
              transform: 'translateX(-100%)',
              opacity: 0,
            },
            '100%': {
              transform: 'translateX(0)',
              opacity: 1,
            }
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            bottom: -8,
            left: 0,
            width: 16,
            height: 16,
            backgroundColor: 'inherit',
            clipPath: 'polygon(0 0, 100% 0, 0 100%)',
          },
        }}
        startIcon={
          <SentimentVerySatisfiedIcon
            sx={{
              fontSize: '1.4rem',
              animation: 'smile 3s ease-in-out infinite',
              '@keyframes smile': {
                '0%, 100%': {
                  transform: 'scale(1) rotate(0)',
                },
                '50%': {
                  transform: 'scale(1.2) rotate(10deg)',
                }
              },
            }}
          />
        }
      >
        {t('feedback.button')}
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '24px',
              boxShadow: (theme) => theme.customShadows.large,
              border: (theme) => `1px solid ${theme.palette.feedback.dialog.border}`,
            }
          }
        }}
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ pb: 1 }}
          >
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 700,
                background: (theme) => theme.palette.secondary.main,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('feedback.title')}
            </Typography>

            <IconButton
              onClick={handleClose}
              sx={{
                color: 'grey.500',
                '&:hover': {
                  color: 'error.main',
                  transform: 'rotate(90deg)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}>
                <Box
                  component="img"
                  src={FEEDBACK_IMAGES[`${(hover !== -1 ? hover : currentRating)}star` as keyof typeof FEEDBACK_IMAGES]}
                  alt={`${hover !== -1 ? hover : currentRating} star feedback`}
                  sx={{
                    width: 50,
                    height: 50,
                    objectFit: 'contain',
                    animation: 'fadeIn 0.3s ease-in-out',
                    '@keyframes fadeIn': {
                      '0%': {
                        opacity: 0,
                        transform: 'scale(0.8)',
                      },
                      '100%': {
                        opacity: 1,
                        transform: 'scale(1)',
                      },
                    },
                  }}
                />

                <RatingCustom
                  name="rating"
                  control={control}
                  sx={{
                    '& .MuiRating-icon': {
                      transition: 'transform 0.2s ease-in-out',
                    },
                    '& .MuiRating-iconHover': {
                      transform: 'scale(1.2)',
                    }
                  }}
                  onChangeActive={(_event: React.SyntheticEvent, newHover: number | null) => {
                    setHover(newHover !== null ? newHover : -1);
                  }}
                />
              </Box>
            </Grid>

            <Grid size={12}>
              <MultilineTextFieldCustom
                name="content"
                placeholder={t('feedback.placeholder')}
                control={control}
                minRows={5}
                maxRows={8}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                    backgroundColor: (theme) => theme.palette.grey[50],
                    transition: 'all 0.2s ease-in-out',
                    '&:hover, &.Mui-focused': {
                      backgroundColor: '#fff',
                      boxShadow: (theme) => theme.customShadows.small,
                    }
                  }
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            variant="contained"
            onClick={handleSubmit(handleSendFeedback)}
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: '12px',
              background: (theme) => theme.palette.feedback.button.background,
              boxShadow: (theme) => theme.customShadows.feedback,
              '&:hover': {
                background: (theme) => theme.palette.feedback.button.background,
                transform: 'translateY(-1px)',
                boxShadow: (theme) => `0 8px 24px ${theme.palette.feedback.button.shadow}`,
              }
            }}
          >
            {t('feedback.submit')}
          </Button>
        </DialogActions>
      </Dialog>

      {isFullScreenLoading && <BackdropLoading />}
    </>
  );
};

export default Feedback;
