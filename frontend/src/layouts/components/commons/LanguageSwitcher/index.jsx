import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Menu, MenuItem, Stack, Typography, useTheme, Avatar } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { localizeRoutePath } from '../../../../configs/routeLocalization';
import { buildPortalPath, detectPortalFromPath } from '../../../../configs/portalRouting';

// You can use external flag icons or just text
const languages = [
  {
    code: 'en',
    label: 'English',
    shortLabel: 'EN',
    flag: 'https://cdn-icons-png.flaticon.com/512/197/197374.png' // UK Flag
  },
  {
    code: 'vi',
    label: 'Tiếng Việt',
    shortLabel: 'VI',
    flag: 'https://cdn-icons-png.flaticon.com/512/197/197473.png' // Vietnam Flag
  }
];

const LanguageSwitcher = ({ color = 'white' }) => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lng) => {
    const localizedPath = localizeRoutePath(location.pathname, lng);
    const portal = detectPortalFromPath(window.location.pathname || '/');
    if (portal !== 'jobseeker') {
      const nextFullPath = buildPortalPath(portal, localizedPath, lng);
      const currentFullPath = window.location.pathname || '/';
      if (nextFullPath !== currentFullPath) {
        window.location.assign(`${nextFullPath}${location.search}${location.hash}`);
      }
    } else if (localizedPath !== location.pathname) {
      navigate(`${localizedPath}${location.search}${location.hash}`, { replace: true });
    }
    i18n.changeLanguage(lng);
    handleClose();
  };

  const getLangCode = (lang) => {
    if (!lang) return 'vi';
    return lang.split('-')[0].split('_')[0];
  };

  const currentLangCode = getLangCode(i18n.language);
  const currentLanguage = languages.find(lang => lang.code === currentLangCode) || languages[1];

  return (
    <div>
      <Button
        id="language-button"
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        color="inherit"
        sx={{
          textTransform: 'none',
          color: color,
          '&:hover': {
            backgroundColor: color === 'white' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          }
        }}
        startIcon={
          <Avatar 
            src={currentLanguage.flag} 
            sx={{ width: 20, height: 20, border: `1px solid ${color === 'white' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)'}` }} 
          />
        }
        endIcon={<KeyboardArrowDownIcon />}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
          {currentLanguage.shortLabel}
        </Typography>
      </Button>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            'aria-labelledby': 'language-button',
          }
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: 2,
            marginTop: 1,
            minWidth: 150,
            boxShadow: '0px 5px 15px rgba(0,0,0,0.1)',
          }
        }}
      >
        {languages.map((lang) => (
          <MenuItem 
            key={lang.code} 
            onClick={() => changeLanguage(lang.code)}
            selected={currentLangCode === lang.code}
            sx={{
              py: 1,
              px: 2,
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.light + '20',
              }
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={lang.flag} sx={{ width: 20, height: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: currentLangCode === lang.code ? 600 : 400 }}>
                {lang.label}
              </Typography>
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default LanguageSwitcher;
