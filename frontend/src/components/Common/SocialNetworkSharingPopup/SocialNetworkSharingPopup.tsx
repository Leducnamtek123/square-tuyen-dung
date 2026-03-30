import { Dialog, DialogTitle, IconButton, List, ListItem, Stack, Typography, Box } from "@mui/material";
import {
  FacebookShareButton,
  FacebookMessengerShareButton,
  EmailShareButton,
  TwitterShareButton,
  LinkedinShareButton,
} from 'react-share';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

// ============================================================
// Modern Custom SVG Icons (2024-2026 latest brand guidelines)
// ============================================================

const ModernFacebookIcon = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fb-gradient" x1="22" y1="43" x2="22" y2="1" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0062E0" />
        <stop offset="1" stopColor="#19AFFF" />
      </linearGradient>
    </defs>
    <circle cx="22" cy="22" r="21" fill="url(#fb-gradient)" />
    <path
      d="M30.17 28.19L31.07 22.56H25.65V18.91C25.65 17.39 26.39 15.91 28.74 15.91H31.29V11.07C31.29 11.07 28.96 10.67 26.73 10.67C22.08 10.67 19 13.54 19 18.52V22.56H14.04V28.19H19V42.54C20.01 42.7 21.04 42.79 22.09 42.79C23.14 42.79 24.17 42.7 25.18 42.54V28.19H30.17Z"
      fill="white"
    />
  </svg>
);

const ModernMessengerIcon = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="msg-gradient" x1="22" y1="42" x2="22" y2="2" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0099FF" />
        <stop offset="0.4" stopColor="#A033FF" />
        <stop offset="0.7" stopColor="#FF5280" />
        <stop offset="1" stopColor="#FF7061" />
      </linearGradient>
    </defs>
    <circle cx="22" cy="22" r="21" fill="url(#msg-gradient)" />
    <path
      d="M22 9C14.82 9 9 14.36 9 21.16C9 25.08 10.97 28.56 14.09 30.84V35L18.06 32.8C19.29 33.14 20.61 33.33 22 33.33C29.18 33.33 35 27.97 35 21.16C35 14.36 29.18 9 22 9ZM23.19 24.7L19.73 21.08L13.07 24.7L20.38 16.96L23.92 20.58L30.5 16.96L23.19 24.7Z"
      fill="white"
    />
  </svg>
);

const ModernLinkedinIcon = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="22" cy="22" r="21" fill="#0A66C2" />
    <path
      d="M15.47 18.5H11.42V32.5H15.47V18.5Z"
      fill="white"
    />
    <path
      d="M13.44 16.61C14.78 16.61 15.87 15.52 15.87 14.17C15.87 12.83 14.78 11.73 13.44 11.73C12.09 11.73 11 12.83 11 14.17C11 15.52 12.09 16.61 13.44 16.61Z"
      fill="white"
    />
    <path
      d="M23.67 18.5H19.77V32.5H23.82V25.18C23.82 22.13 27.67 21.87 27.67 25.18V32.5H31.73V23.85C31.73 18.18 25.32 18.38 23.67 21.15V18.5Z"
      fill="white"
    />
  </svg>
);

// X (formerly Twitter) - New X logo 2023+
const ModernXIcon = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="22" cy="22" r="21" fill="#000000" />
    <path
      d="M24.89 20.36L32.33 12H30.56L24.1 19.21L18.92 12H12.5L20.31 22.96L12.5 31.68H14.27L21.09 24.11L26.58 31.68H33L24.89 20.36ZM21.99 23.06L21.19 21.92L14.9 13.33H18.06L22.69 20.29L23.49 21.43L30.56 30.42H27.4L21.99 23.06Z"
      fill="white"
    />
  </svg>
);

const ModernEmailIcon = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="email-gradient" x1="22" y1="2" x2="22" y2="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="#EA4335" />
        <stop offset="0.25" stopColor="#EA4335" />
        <stop offset="0.5" stopColor="#FBBC05" />
        <stop offset="0.75" stopColor="#34A853" />
        <stop offset="1" stopColor="#4285F4" />
      </linearGradient>
    </defs>
    <circle cx="22" cy="22" r="21" fill="#EA4335" />
    <path
      d="M13 15.5C13 14.67 13.67 14 14.5 14H29.5C30.33 14 31 14.67 31 15.5V28.5C31 29.33 30.33 30 29.5 30H14.5C13.67 30 13 29.33 13 28.5V15.5Z"
      fill="white"
    />
    <path
      d="M13.5 15L22 22.5L30.5 15"
      stroke="#EA4335"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ============================================================

interface SocialNetworkSharingPopupProps {
  setOpenPopup: (open: boolean) => void;
  open: boolean;
  facebook?: { url?: string; quote?: string; hashtag?: string } | null;
  facebookMessenger?: { url?: string; to?: string } | null;
  linkedin?: { url?: string; title?: string; summary?: string; source?: string } | null;
  twitter?: { url?: string; title?: string; via?: string; hashtags?: string[]; related?: string[] } | null;
  email?: { url?: string; subject?: string; body?: string } | null;
}

const iconButtonStyles = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  gap: 0.75,
  cursor: 'pointer',
  '& svg': {
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.12))',
  },
  '&:hover svg': {
    transform: 'translateY(-3px) scale(1.08)',
    filter: 'drop-shadow(0px 6px 12px rgba(0,0,0,0.2))',
  },
  '&:active svg': {
    transform: 'translateY(0px) scale(0.95)',
    filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.1))',
  },
};

const SocialNetworkSharingPopup = (props: SocialNetworkSharingPopupProps) => {
  const { t } = useTranslation('common');

  const {
    setOpenPopup,
    open,
    facebook,
    facebookMessenger = null,
    linkedin = null,
    twitter = null,
    email = null,
  } = props;

  return (
    <Dialog
      onClose={() => setOpenPopup(false)}
      open={open}
      slotProps={{
        paper: {
          sx: {
            width: '380px',
            borderRadius: '20px',
            boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}`,
          }
        },
        backdrop: {
          sx: {
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
          }
        }
      }}
      TransitionProps={{
        timeout: 300,
      }}
    >
      <DialogTitle
        sx={{
          p: 2.5,
          pb: 2,
          background: (theme) => 
            theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, rgba(30,30,45,1) 0%, rgba(20,20,35,1) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)',
          borderBottom: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: '1.15rem',
              letterSpacing: '-0.01em',
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('shareVia')}
          </Typography>

          <IconButton
            onClick={() => setOpenPopup(false)}
            size="small"
            sx={{
              color: 'grey.400',
              width: 32,
              height: 32,
              '&:hover': {
                color: 'error.main',
                bgcolor: 'rgba(239, 68, 68, 0.08)',
                transform: 'rotate(90deg)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <List sx={{ pt: 2.5, pb: 3, px: 2 }}>
        <ListItem sx={{ px: 0 }}>
          <Stack
            direction="row"
            spacing={1.5}
            justifyContent="center"
            width="100%"
          >
            {facebook && (
              <FacebookShareButton
                url={facebook?.url || ''}
                quote={facebook?.quote || ''}
                hashtag={facebook?.hashtag || ''}
                style={{ outline: 'none' }}
              >
                <Box sx={iconButtonStyles}>
                  <ModernFacebookIcon />
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: 'text.secondary',
                      letterSpacing: '0.02em',
                      opacity: 0.7,
                    }}
                  >
                    Facebook
                  </Typography>
                </Box>
              </FacebookShareButton>
            )}

            {facebookMessenger && (
              <FacebookMessengerShareButton
                url={facebookMessenger?.url || ''}
                appId=""
                redirectUri={facebookMessenger?.url || ''}
                style={{ outline: 'none' }}
              >
                <Box sx={iconButtonStyles}>
                  <ModernMessengerIcon />
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: 'text.secondary',
                      letterSpacing: '0.02em',
                      opacity: 0.7,
                    }}
                  >
                    Messenger
                  </Typography>
                </Box>
              </FacebookMessengerShareButton>
            )}

            {linkedin && (
              <LinkedinShareButton
                url={linkedin?.url || ''}
                title={linkedin?.title || ''}
                summary={linkedin?.summary || ''}
                source={linkedin?.source || ''}
                style={{ outline: 'none' }}
              >
                <Box sx={iconButtonStyles}>
                  <ModernLinkedinIcon />
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: 'text.secondary',
                      letterSpacing: '0.02em',
                      opacity: 0.7,
                    }}
                  >
                    LinkedIn
                  </Typography>
                </Box>
              </LinkedinShareButton>
            )}

            {twitter && (
              <TwitterShareButton
                url={twitter?.url || ''}
                title={twitter?.title || ''}
                via={twitter?.via || ''}
                hashtags={twitter?.hashtags || []}
                related={twitter?.related || []}
                style={{ outline: 'none' }}
              >
                <Box sx={iconButtonStyles}>
                  <ModernXIcon />
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: 'text.secondary',
                      letterSpacing: '0.02em',
                      opacity: 0.7,
                    }}
                  >
                    X
                  </Typography>
                </Box>
              </TwitterShareButton>
            )}

            {email && (
              <EmailShareButton
                url={email?.url || ""}
                subject={email?.subject || ""}
                body={email?.body || ""}
                style={{ outline: 'none' }}
              >
                <Box sx={iconButtonStyles}>
                  <ModernEmailIcon />
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: 'text.secondary',
                      letterSpacing: '0.02em',
                      opacity: 0.7,
                    }}
                  >
                    Email
                  </Typography>
                </Box>
              </EmailShareButton>
            )}
          </Stack>
        </ListItem>
      </List>
    </Dialog>
  );
};

export default SocialNetworkSharingPopup;
