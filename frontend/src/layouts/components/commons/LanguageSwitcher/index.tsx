import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button, Menu, MenuItem, Stack, Typography, useTheme, Avatar } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { localizeRoutePath } from '../../../../configs/routeLocalization';
import { detectPortalFromPath } from '../../../../configs/portalRouting';

interface LanguageSwitcherProps {
  color?: string;
}

const languages = [
  {
    code: 'en',
    label: 'English',
    shortLabel: 'EN',
    flag: 'https://cdn-icons-png.flaticon.com/512/197/197374.png'
  },
  {
    code: 'vi',
    label: 'Tiếng Việt',
    shortLabel: 'VI',
    flag: 'https://cdn-icons-png.flaticon.com/512/197/197473.png'
  }
];

const LanguageSwitcher = ({ color = 'white' }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const location = { pathname, search: searchParams.toString() ? `?${searchParams.toString()}` : '', hash: typeof window !== 'undefined' ? window.location.hash : '' };
  const navigate = useRouter();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lng: string) => {
    window.localStorage?.setItem('i18nextLng', lng);
    const localizedPath = localizeRoutePath(location.pathname, lng);
    const portal = detectPortalFromPath(window.location.pathname || '/');
    if (portal !== 'jobseeker') {
      const currentFullPath = window.location.pathname || '/';
      if (localizedPath !== currentFullPath) {
        window.location.assign(`${localizedPath}${location.search}${location.hash}`);
      }
    } else if (localizedPath !== location.pathname) {
      navigate.replace(`${localizedPath}${location.search}${location.hash}`);
    }
    i18n.changeLanguage(lng);
    handleClose();
  };

  const getLangCode = (lang: string) => {
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
                backgroundColor: (theme.palette.primary as any).light + '20',
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
