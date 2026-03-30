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
import {
  FacebookIcon,
  MessengerIcon,
  LinkedinIcon,
  XIcon,
  EmailIcon,
} from '../SocialIcons';

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
                  <FacebookIcon />
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
                  <MessengerIcon />
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
                  <LinkedinIcon />
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
                  <XIcon />
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
                  <EmailIcon />
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
