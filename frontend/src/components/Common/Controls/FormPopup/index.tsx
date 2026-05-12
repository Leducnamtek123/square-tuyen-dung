import React from 'react';
import { useTheme } from '@mui/material/styles';
import {
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
  children: React.ReactNode;
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
  children,
}: Props) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <div>
      <Dialog
        fullScreen={fullScreen}
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        aria-labelledby="responsive-dialog-title"
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              borderRadius: '24px',
              boxShadow: '0 28px 70px rgba(15, 57, 127, 0.18)',
              border: '1px solid rgba(26, 64, 125, 0.1)',
              overflow: 'hidden',
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            p: 2.5,
            backgroundColor: theme.palette.grey[50],
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography
              variant="h5"
              component="div"
              sx={{
                color: theme.palette.grey[900],
                fontWeight: 600,
              }}
            >
              {title}
            </Typography>

            <IconButton
              onClick={() => setOpenPopup(false)}
              sx={{
                color: theme.palette.grey[500],
                '&:hover': {
                  backgroundColor: theme.palette.grey[100],
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 3 }}>{children}</DialogContent>

        {showDialogAction && (
          <DialogActions
            sx={{
              py: 2.5,
              px: 3,
              background: theme.palette.grey[50],
            }}
          >
            <LoadingButton
              loading={isSubmitting}
              loadingPosition="start"
              startIcon={buttonIcon}
              variant="contained"
              sx={{
                margin: '0 auto',
                minWidth: 120,
                minHeight: 44,
                px: 3,
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
