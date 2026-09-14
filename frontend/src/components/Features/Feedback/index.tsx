'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography, Box } from "@mui/material";
import { Grid2 as Grid } from "@mui/material";
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SentimentVeryDissatisfiedRoundedIcon from '@mui/icons-material/SentimentVeryDissatisfiedRounded';
import SentimentDissatisfiedRoundedIcon from '@mui/icons-material/SentimentDissatisfiedRounded';
import SentimentNeutralRoundedIcon from '@mui/icons-material/SentimentNeutralRounded';
import SentimentSatisfiedAltRoundedIcon from '@mui/icons-material/SentimentSatisfiedAltRounded';
import SentimentVerySatisfiedRoundedIcon from '@mui/icons-material/SentimentVerySatisfiedRounded';
import errorHandling from '@/utils/errorHandling';
import toastMessages from '@/utils/toastMessages';
import RatingCustom from '@/components/Common/Controls/RatingCustom';
import MultilineTextFieldCustom from '@/components/Common/Controls/MultilineTextFieldCustom';
import contentService from '@/services/contentService';

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

export const createFeedbackSchema = (t: TFunction<'common', undefined>) =>
  yup.object().shape({
    rating: yup
      .number()
      .required(t('feedback.ratingRequired'))
      .min(1, t('feedback.ratingRequired'))
      .max(5, t('feedback.ratingInvalid')),
    content: yup
      .string()
      .required(t('feedback.contentRequired'))
      .max(500, t('feedback.contentMax')),
  });

const getSentimentDetails = (ratingVal: number) => {
  switch (ratingVal) {
    case 1:
      return {
        icon: <SentimentVeryDissatisfiedRoundedIcon sx={{ fontSize: 34, color: '#ef4444' }} />,
        label: 'Rất không hài lòng',
        labelEn: 'Very Dissatisfied',
        color: '#ef4444',
        bg: '#fef2f2',
        border: '#fecaca',
      };
    case 2:
      return {
        icon: <SentimentDissatisfiedRoundedIcon sx={{ fontSize: 34, color: '#f97316' }} />,
        label: 'Chưa hài lòng',
        labelEn: 'Dissatisfied',
        color: '#f97316',
        bg: '#fff7ed',
        border: '#fed7aa',
      };
    case 3:
      return {
        icon: <SentimentNeutralRoundedIcon sx={{ fontSize: 34, color: '#64748b' }} />,
        label: 'Bình thường',
        labelEn: 'Neutral',
        color: '#64748b',
        bg: '#f8fafc',
        border: '#e2e8f0',
      };
    case 4:
      return {
        icon: <SentimentSatisfiedAltRoundedIcon sx={{ fontSize: 34, color: '#10b981' }} />,
        label: 'Hài lòng',
        labelEn: 'Satisfied',
        color: '#10b981',
        bg: '#ecfdf5',
        border: '#a7f3d0',
      };
    case 5:
    default:
      return {
        icon: <SentimentVerySatisfiedRoundedIcon sx={{ fontSize: 34, color: '#2563eb' }} />,
        label: 'Rất hài lòng',
        labelEn: 'Very Satisfied',
        color: '#2563eb',
        bg: '#eff6ff',
        border: '#bfdbfe',
      };
  }
};

const Feedback = ({ trigger = 'floating', onBeforeOpen, open: controlledOpen, onOpenChange }: FeedbackProps) => {
  const { t, i18n } = useTranslation('common');

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

  const schema = React.useMemo(() => createFeedbackSchema(t), [t]);

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
      toastMessages.error(t('feedback.evidenceImageInvalid'));
      event.target.value = '';
      return;
    }

    if (file.size > MAX_EVIDENCE_IMAGE_SIZE) {
      toastMessages.error(t('feedback.evidenceImageTooLarge'));
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

  const activeRating = hover !== -1 ? hover : currentRating;
  const sentiment = getSentimentDetails(activeRating);

  const triggerButton = trigger === 'none' ? null : trigger === 'menuItem' ? (
    <Button
      startIcon={<RateReviewOutlinedIcon style={{ marginLeft: 4 }} />}
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
        padding: { xs: '9px 16px', md: '8px 18px' },
        textTransform: 'none',
        color: '#ffffff',
        zIndex: 1250,
        boxShadow: (theme) => theme.customShadows.feedback,
        backdropFilter: 'blur(8px)',
        backgroundColor: (theme) => theme.palette.feedback.button.background,
        borderRadius: '999px',
        fontSize: '0.925rem',
        fontWeight: 600,
        letterSpacing: '-0.01em',
        '&:hover': {
          backgroundColor: (theme) => theme.palette.feedback.button.hover,
          transform: 'translateY(-2px)',
          boxShadow: (theme) => `0 12px 24px ${theme.palette.feedback.button.shadow}`,
        },
        transition: 'all 0.2s ease',
      }}
      startIcon={<RateReviewOutlinedIcon sx={{ fontSize: '1.25rem' }} />}
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
              borderRadius: '20px',
              boxShadow: (theme) => theme.customShadows.large,
              border: (theme) => `1px solid ${theme.palette.feedback.dialog.border}`,
            }
          }
        }}
      >
        <DialogTitle sx={{ p: 2.5, pb: 1.5 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: '12px',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RateReviewOutlinedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    fontWeight: 800,
                    color: 'text.primary',
                    fontSize: '1.15rem',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {t('feedback.title')}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontWeight: 500, display: 'block' }}
                >
                  {t('feedback.subtitle', { defaultValue: 'Chia sẻ trải nghiệm để nâng cao chất lượng dịch vụ' })}
                </Typography>
              </Box>
            </Stack>

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

        <DialogContent sx={{ px: 3, pt: 2 }}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.25,
                pt: 0.5,
                pb: 1,
              }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: sentiment.bg,
                    border: `1.5px solid ${sentiment.border}`,
                    boxShadow: `0 4px 14px ${alpha(sentiment.color, 0.16)}`,
                    transition: 'all 0.25s ease',
                    transform: hover !== -1 ? 'scale(1.08)' : 'scale(1)',
                  }}
                >
                  {sentiment.icon}
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: sentiment.color,
                    letterSpacing: '0.01em',
                    fontSize: '0.9rem',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {i18n.language.startsWith('en') ? sentiment.labelEn : sentiment.label}
                </Typography>

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
                  {t('feedback.evidenceImageLabel')}
                </Typography>

                <input
                  ref={evidenceInputRef}
                  hidden
                  type="file"
                  aria-label={t('feedback.evidenceImageLabel')}
                  accept="image/*"
                  onChange={handleEvidenceImageChange}
                />

                {!evidenceImageFile ? (
                  <Button
                    variant="outlined"
                    startIcon={<AddPhotoAlternateOutlinedIcon fontSize="small" />}
                    disabled={isSubmitting}
                    onClick={() => evidenceInputRef.current?.click()}
                    sx={{ textTransform: 'none', borderRadius: '10px', fontWeight: 600 }}
                  >
                    {t('feedback.evidenceImageUpload')}
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
                      aria-label={t('feedback.evidenceImageRemove')}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                )}

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                  {t('feedback.evidenceImageHint')}
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
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <SendRoundedIcon sx={{ fontSize: '1.15rem' }} />}
            sx={{
              py: 1.35,
              borderRadius: '12px',
              background: (theme) => theme.palette.feedback.button.background,
              boxShadow: (theme) => theme.customShadows.feedback,
              fontWeight: 700,
              fontSize: '0.95rem',
              letterSpacing: '-0.01em',
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
