'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography, Box } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import errorHandling from '@/utils/errorHandling';
import toastMessages from '@/utils/toastMessages';
import RatingCustom from '@/components/Common/Controls/RatingCustom';
import MultilineTextFieldCustom from '@/components/Common/Controls/MultilineTextFieldCustom';
import contentService from '@/services/contentService';
import { FEEDBACK_IMAGES } from '@/configs/constants';

interface FeedbackProps {
  trigger?: 'floating' | 'menuItem' | 'none';
  onBeforeOpen?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface FeedbackData {
  rating: number;
  content: string;
}

const MAX_EVIDENCE_IMAGE_SIZE = 5 * 1024 * 1024;

const Feedback = ({ trigger = 'floating', onBeforeOpen, open: controlledOpen, onOpenChange }: FeedbackProps) => {
  const { t } = useTranslation('common');

  const [internalOpen, setInternalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [evidenceImageFile, setEvidenceImageFile] = React.useState<File | null>(null);
  const [evidencePreviewUrl, setEvidencePreviewUrl] = React.useState<string | null>(null);
  const [hover, setHover] = React.useState(-1);
  const evidenceInputRef = React.useRef<HTMLInputElement | null>(null);
  const open = controlledOpen ?? internalOpen;

  const setFeedbackOpen = React.useCallback((nextOpen: boolean) => {
    if (controlledOpen === undefined) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  }, [controlledOpen, onOpenChange]);

  const schema = yup.object().shape({
    rating: yup.number().required(t('feedback.ratingRequired')),
    content: yup
      .string()
      .required(t('feedback.contentRequired'))
      .max(500, t('feedback.contentMax')),
  });

  const { control, handleSubmit, watch, reset } = useForm<FeedbackData>({
    defaultValues: {
      rating: 5,
      content: '',
    },
    resolver: yupResolver(schema),
  });

  const currentRating = watch('rating');

  React.useEffect(() => {
    return () => {
      if (evidencePreviewUrl) {
        URL.revokeObjectURL(evidencePreviewUrl);
      }
    };
  }, [evidencePreviewUrl]);

  const handleClearEvidenceImage = React.useCallback(() => {
    setEvidenceImageFile(null);
    setEvidencePreviewUrl(null);
    if (evidenceInputRef.current) {
      evidenceInputRef.current.value = '';
    }
  }, []);

  const handleEvidenceImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toastMessages.error(t('feedback.evidenceImageInvalid', { defaultValue: 'Please choose an image file.' }));
      event.target.value = '';
      return;
    }

    if (file.size > MAX_EVIDENCE_IMAGE_SIZE) {
      toastMessages.error(t('feedback.evidenceImageTooLarge', { defaultValue: 'Image must be 5MB or smaller.' }));
      event.target.value = '';
      return;
    }

    setEvidenceImageFile(file);
    setEvidencePreviewUrl(URL.createObjectURL(file));
  };

  const handleOpen = () => {
    onBeforeOpen?.();
    setFeedbackOpen(true);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setFeedbackOpen(false);
  };

  const handleSendFeedback = async (data: FeedbackData) => {
    setIsSubmitting(true);
    try {
      await contentService.createFeedback({ ...data, evidenceImageFile });
      setFeedbackOpen(false);
      setHover(-1);
      handleClearEvidenceImage();
      reset({ rating: 5, content: '' });
      toastMessages.success(t('feedback.success'));
    } catch (error) {
      // We use an explicit cast here because errorHandling expects AxiosError but catching produces unknown.
      errorHandling(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerButton = trigger === 'none' ? null : trigger === 'menuItem' ? (
    <Button
      startIcon={<FeedbackOutlinedIcon style={{ marginLeft: 4 }} />}
      variant="text"
      color="primary"
      sx={{ textTransform: "inherit" }}
      fullWidth
      onClick={handleOpen}
    >
      <Typography marginRight="auto">{t('feedback.button')}</Typography>
    </Button>
  ) : (
    <Button
      variant="contained"
      onClick={handleOpen}
      sx={{
        position: 'fixed',
        right: { xs: 16, md: 96 },
        bottom: { xs: 88, md: 24 },
        padding: { xs: '9px 14px', md: '8px 16px' },
        textTransform: 'none',
        color: 'white',
        zIndex: 1250,
        boxShadow: (theme) => theme.customShadows.feedback,
        backdropFilter: 'blur(8px)',
        backgroundColor: (theme) => theme.palette.feedback.button.background,
        borderRadius: '999px',
        fontSize: '0.95rem',
        fontWeight: 600,
        '&:hover': {
          backgroundColor: (theme) => theme.palette.feedback.button.hover,
          transform: 'translateY(-2px)',
          boxShadow: (theme) => `0 12px 24px ${theme.palette.feedback.button.shadow}`,
        },
        transition: 'all 0.2s ease',
      }}
      startIcon={<SentimentVerySatisfiedIcon sx={{ fontSize: '1.4rem' }} />}
    >
      {t('feedback.button')}
    </Button>
  );

  return (
    <>
      {triggerButton}

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '18px',
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
                color: 'text.primary',
              }}
            >
              {t('feedback.title')}
            </Typography>

            <IconButton
              onClick={handleClose}
              disabled={isSubmitting}
              aria-label={t('actions.close')}
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
                  disabled={isSubmitting}
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
                disabled={isSubmitting}
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

            <Grid size={12}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  {t('feedback.evidenceImageLabel', { defaultValue: 'Evidence image' })}
                </Typography>

                <input
                  ref={evidenceInputRef}
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={handleEvidenceImageChange}
                />

                {!evidenceImageFile ? (
                  <Button
                    variant="outlined"
                    startIcon={<PhotoCameraIcon fontSize="small" />}
                    disabled={isSubmitting}
                    onClick={() => evidenceInputRef.current?.click()}
                    sx={{ textTransform: 'none', borderRadius: '10px' }}
                  >
                    {t('feedback.evidenceImageUpload', { defaultValue: 'Upload image proof' })}
                  </Button>
                ) : (
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '12px',
                      p: 1,
                      backgroundColor: 'background.paper',
                    }}
                  >
                    {evidencePreviewUrl && (
                      <Box
                        component="img"
                        src={evidencePreviewUrl}
                        alt={evidenceImageFile.name}
                        sx={{
                          width: 64,
                          height: 64,
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      />
                    )}
                    <Typography
                      variant="body2"
                      sx={{ flex: 1, minWidth: 0 }}
                      noWrap
                    >
                      {evidenceImageFile.name}
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      disabled={isSubmitting}
                      onClick={handleClearEvidenceImage}
                      aria-label={t('feedback.evidenceImageRemove', { defaultValue: 'Remove evidence image' })}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                )}

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                  {t('feedback.evidenceImageHint', { defaultValue: 'Optional. PNG, JPG, or WebP up to 5MB.' })}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            variant="contained"
            onClick={handleSubmit(handleSendFeedback)}
            fullWidth
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
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
            {isSubmitting ? t('saving') : t('feedback.submit')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Feedback;
