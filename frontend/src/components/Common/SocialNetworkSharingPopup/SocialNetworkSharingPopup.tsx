import { Dialog, DialogTitle, IconButton, List, ListItem, Stack, Typography } from "@mui/material";
import {
  FacebookShareButton,
  FacebookIcon,
  FacebookMessengerShareButton,
  FacebookMessengerIcon,
  EmailShareButton,
  EmailIcon,
  TwitterShareButton,
  TwitterIcon,
  LinkedinShareButton,
  LinkedinIcon,
} from 'react-share';
import CloseIcon from '@mui/icons-material/Close';

interface SocialNetworkSharingPopupProps {
  setOpenPopup: (open: boolean) => void;
  open: boolean;
  facebook?: { url?: string; quote?: string; hashtag?: string } | null;
  facebookMessenger?: { url?: string; to?: string } | null;
  linkedin?: { url?: string; title?: string; summary?: string; source?: string } | null;
  twitter?: { url?: string; title?: string; via?: string; hashtags?: string[]; related?: string[] } | null;
  email?: { url?: string; subject?: string; body?: string } | null;
}

const SocialNetworkSharingPopup = (props: SocialNetworkSharingPopupProps) => {

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

            width: '320px',

            borderRadius: '16px',

            boxShadow: (theme) => theme.customShadows.large,

          }

        }

      }}

    >

      <DialogTitle 

        sx={{ 

          p: 2.5,

          pb: 1.5,

          borderBottom: (theme) => `1px solid ${theme.palette.grey[100]}`

        }}

      >

        <Stack

          direction="row"

          justifyContent="space-between"

          alignItems="center"

        >

          <Typography variant="h5" sx={{ fontWeight: 600 }}>Chia sẻ qua</Typography>

          <IconButton

            onClick={() => setOpenPopup(false)}

            size="small"

            sx={{

              color: 'grey.500',

              '&:hover': {

                color: 'error.main',

                bgcolor: 'error.background',

              },

              transition: 'all 0.2s ease-in-out'

            }}

          >

            <CloseIcon fontSize="small" />

          </IconButton>

        </Stack>

      </DialogTitle>

      <List sx={{ pt: 1, pb: 2, px: 1 }}>

        <ListItem>

          <Stack 

            direction="row" 

            spacing={2} 

            justifyContent="center" 

            width="100%"

          >

            {facebook && (

              <FacebookShareButton

                url={facebook?.url || ''}

                quote={facebook?.quote || ''}

                hashtag={facebook?.hashtag || ''}

              >

                <FacebookIcon 

                  size={40} 

                  round 

                  bgStyle={{

                    fill: '#1877F2'

                  }}

                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                  }}

                />

              </FacebookShareButton>

            )}

            {facebookMessenger && (

              <FacebookMessengerShareButton

                url={facebookMessenger?.url || ''}

                appId=""

                redirectUri={facebookMessenger?.url || ''}

              >

                <FacebookMessengerIcon 

                  size={40} 

                  round 

                  bgStyle={{

                    fill: '#0099FF'

                  }}

                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                  }}

                />

              </FacebookMessengerShareButton>

            )}

            {linkedin && (

              <LinkedinShareButton

                url={linkedin?.url || ''}

                title={linkedin?.title || ''}

                summary={linkedin?.summary || ''}

                source={linkedin?.source || ''}

              >

                <LinkedinIcon 

                  size={40} 

                  round 

                  bgStyle={{

                    fill: '#0A66C2'

                  }}

                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                  }}

                />

              </LinkedinShareButton>

            )}

            {twitter && (

              <TwitterShareButton

                url={twitter?.url || ''}

                title={twitter?.title || ''}

                via={twitter?.via || ''}

                hashtags={twitter?.hashtags || []}

                related={twitter?.related || []}

              >

                <TwitterIcon 

                  size={40} 

                  round 

                  bgStyle={{

                    fill: '#1DA1F2'

                  }}

                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                  }}

                />

              </TwitterShareButton>

            )}

            {email && (

              <EmailShareButton

                url={email?.url || ""}

                subject={email?.subject || ""}

                body={email?.body || ""}

              >

                <EmailIcon 

                  size={40} 

                  round 

                  bgStyle={{

                    fill: '#EA4335'

                  }}

                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                  }}

                />

              </EmailShareButton>

            )}

          </Stack>

        </ListItem>

      </List>

    </Dialog>
  );
};

export default SocialNetworkSharingPopup;
