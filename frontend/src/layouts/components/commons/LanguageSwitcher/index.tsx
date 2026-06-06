'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { Button, Menu, MenuItem, Stack, Typography, useTheme, Avatar } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LanguageIcon from '@mui/icons-material/Language';
import { localizeRoutePath } from '../../../../configs/routeLocalization';


interface LanguageSwitcherProps {
  color?: string;
}

const languages = [
  {
    code: 'en',
    label: 'English',
    shortLabel: 'EN',
    flagUrl: 'https://flagcdn.com/w40/us.png'
  },
  {
    code: 'vi',
    label: 'Tiếng Việt',
    shortLabel: 'VI',
    flagUrl: 'https://flagcdn.com/w40/vn.png'
  }
];

const LanguageSwitcher = ({ color = 'white' }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();
  const navigate = useRouter();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const openLanguageMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lng: string) => {
    window.localStorage?.setItem('i18nextLng', lng);
    // Sync to cookie so Server Components (generateMetadata) can read locale
    document.cookie = `i18nextLng=${lng}; path=/; max-age=31536000; SameSite=Lax`;
    const currentPath = window.location.pathname || '/';
    const currentSearch = window.location.search || '';
    const currentHash = window.location.hash || '';
    const localizedPath = localizeRoutePath(currentPath, lng);
    if (localizedPath === currentPath) {
      i18n.changeLanguage(lng);
      handleClose();
      return;
    }
    window.location.assign(`${localizedPath}${currentSearch}${currentHash}`);
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
        onClick={openLanguageMenu}
        color="inherit"
        sx={{
          textTransform: 'none',
          color: color,
          '&:hover': {
            backgroundColor: color === 'white' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          }
        }}
        startIcon={<LanguageIcon sx={{ fontSize: 18 }} />}
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
                backgroundColor: (theme.palette.primary as { light?: string }).light + '20',
              }
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={lang.flagUrl}
                alt={lang.label}
                sx={{ width: 20, height: 15, borderRadius: 0.5, '& img': { objectFit: 'cover' } }}
                variant="rounded"
              />
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
