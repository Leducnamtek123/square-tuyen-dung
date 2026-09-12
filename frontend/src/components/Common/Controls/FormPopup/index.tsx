import React from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { LoadingButton } from '@mui/lab';

interface Props {
  title: React.ReactNode;
  openPopup: boolean;
  setOpenPopup: (open: boolean) => void;
  showDialogAction?: boolean;
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  isSubmitting?: boolean;
  formId?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidthButton?: boolean;
  children: any;
}

const Popup = ({
  title,
  openPopup,
  setOpenPopup,
  showDialogAction = true,
  buttonText = 'Lưu',
  buttonIcon = <SaveIcon />,
  isSubmitting = false,
  formId = 'modal-form',
  maxWidth = 'sm',
  fullWidthButton = true,
  children,
}: Props) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <div>
      <Dialog
        fullScreen={fullScreen}
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        aria-labelledby="responsive-dialog-title"
        maxWidth={maxWidth}
        fullWidth
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              borderRadius: fullScreen ? 0 : '20px',
              boxShadow: '0 24px 60px rgba(15, 23, 42, 0.16)',
              border: fullScreen ? 'none' : '1px solid rgba(226, 232, 240, 0.9)',
              overflow: 'hidden',
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            p: { xs: 2, sm: 2.5 },
            pt: fullScreen ? 'max(16px, env(safe-area-inset-top, 16px))' : 2.5,
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ flex: 1, minWidth: 0, pr: 1.5 }}>
              {typeof title === 'string' ? (
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    color: '#0F172A',
                    fontWeight: 700,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    lineHeight: 1.3,
                  }}
                >
                  {title}
                </Typography>
              ) : (
                title
              )}
            </Box>

            <IconButton
              aria-label="Đóng"
              onClick={() => setOpenPopup(false)}
              sx={{
                color: '#64748B',
                p: 0.75,
                borderRadius: '10px',
                '&:hover': {
                  backgroundColor: '#F1F5F9',
                  color: '#0F172A',
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2, sm: 2.5 }, pt: { xs: '20px !important', sm: '24px !important' } }}>{children}</DialogContent>

        {showDialogAction && (
          <DialogActions
            sx={{
              py: 2,
              px: { xs: 2, sm: 2.5 },
              pb: fullScreen ? 'max(16px, env(safe-area-inset-bottom, 16px))' : 2.5,
              background: '#ffffff',
              borderTop: '1px solid #F1F5F9',
            }}
          >
            <LoadingButton
              loading={isSubmitting}
              loadingPosition="start"
              startIcon={buttonIcon}
              variant="contained"
              sx={{
                width: fullWidthButton ? '100%' : 'auto',
                minWidth: 140,
                minHeight: 46,
                px: 3,
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.9375rem',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(37, 99, 235, 0.38)',
                },
              }}
              type="submit"
              form={formId}
              disabled={isSubmitting}
            >
              {buttonText}
            </LoadingButton>
          </DialogActions>
        )}
      </Dialog>
    </div>
  );
};

export default React.memo(Popup);
