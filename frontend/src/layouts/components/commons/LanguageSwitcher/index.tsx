import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button, Menu, MenuItem, Stack, Typography, useTheme, Avatar } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { localizeRoutePath } from '../../../../configs/routeLocalization';
import { buildPortalPath, detectPortalFromPath, stripPortalPrefix } from '../../../../configs/portalRouting';

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

const toCanonicalChildPath = (portal: 'admin' | 'employer' | 'jobseeker', childPath: string): string => {
  if (!childPath) return '/';
  const normalized = childPath.startsWith('/') ? childPath : `/${childPath}`;

  if (portal === 'admin') {
    return normalized
      .replace(/^\/bang-dieu-khien$/, '/dashboard')
      .replace(/^\/quan-ly-nguoi-dung$/, '/users')
      .replace(/^\/quan-ly-tin-tuyen-dung$/, '/jobs')
      .replace(/^\/kho-cau-hoi$/, '/questions')
      .replace(/^\/quan-ly-bo-cau-hoi$/, '/question-groups')
      .replace(/^\/quan-ly-phong-van$/, '/interviews')
      .replace(/^\/cai-dat-he-thong$/, '/settings')
      .replace(/^\/quan-ly-nganh-nghe$/, '/careers')
      .replace(/^\/quan-ly-tinh-thanh$/, '/cities')
      .replace(/^\/quan-ly-quan-huyen$/, '/districts')
      .replace(/^\/quan-ly-phuong-xa$/, '/wards')
      .replace(/^\/quan-ly-cong-ty$/, '/companies')
      .replace(/^\/quan-ly-ho-so-ung-vien$/, '/profiles')
      .replace(/^\/quan-ly-cv-resume$/, '/resumes')
      .replace(/^\/nhat-ky-tin-tuyen-dung$/, '/job-activity')
      .replace(/^\/thong-bao-viec-lam$/, '/job-notifications')
      .replace(/^\/phong-van-cong-ty-truc-tiep$/, '/interviews/live');
  }

  if (portal === 'employer') {
    return normalized
      .replace(/^\/bang-dieu-khien$/, '/dashboard')
      .replace(/^\/gioi-thieu$/, '/introduce')
      .replace(/^\/dich-vu$/, '/service')
      .replace(/^\/bao-gia$/, '/pricing')
      .replace(/^\/ho-tro$/, '/support')
      .replace(/^\/blog-tuyen-dung$/, '/blog')
      .replace(/^\/tin-tuyen-dung$/, '/job-posts')
      .replace(/^\/ho-so-ung-tuyen$/, '/applied-profiles')
      .replace(/^\/ho-so-da-luu$/, '/saved-profiles')
      .replace(/^\/danh-sach-ung-vien$/, '/candidates')
      .replace(/^\/chi-tiet-ung-vien\/(.+)$/, '/candidates/$1')
      .replace(/^\/cong-ty$/, '/company')
      .replace(/^\/nhan-su-va-vai-tro$/, '/employees')
      .replace(/^\/thong-bao$/, '/notifications')
      .replace(/^\/tai-khoan$/, '/account')
      .replace(/^\/cai-dat$/, '/settings')
      .replace(/^\/ket-noi-voi-ung-vien$/, '/chat')
      .replace(/^\/danh-sach-phong-van$/, '/interviews')
      .replace(/^\/phong-van-ung-vien-truc-tiep$/, '/interviews/live')
      .replace(/^\/len-lich-phong-van$/, '/interviews/create')
      .replace(/^\/chi-tiet-phong-van\/(.+)$/, '/interviews/$1')
      .replace(/^\/ngan-hang-cau-hoi$/, '/question-bank')
      .replace(/^\/bo-cau-hoi$/, '/question-groups')
      .replace(/^\/xac-thuc-nha-tuyen-dung$/, '/verification');
  }

  return normalized;
};

const localizeCanonicalChildPath = (
  portal: 'admin' | 'employer' | 'jobseeker',
  canonicalChildPath: string,
  lng: string
): string => {
  if (portal === 'admin') {
    if (lng === 'vi') {
      return canonicalChildPath
        .replace(/^\/dashboard$/, '/bang-dieu-khien')
        .replace(/^\/users$/, '/quan-ly-nguoi-dung')
        .replace(/^\/jobs$/, '/quan-ly-tin-tuyen-dung')
        .replace(/^\/questions$/, '/kho-cau-hoi')
        .replace(/^\/question-groups$/, '/quan-ly-bo-cau-hoi')
        .replace(/^\/interviews$/, '/quan-ly-phong-van')
        .replace(/^\/settings$/, '/cai-dat-he-thong')
        .replace(/^\/careers$/, '/quan-ly-nganh-nghe')
        .replace(/^\/cities$/, '/quan-ly-tinh-thanh')
        .replace(/^\/districts$/, '/quan-ly-quan-huyen')
        .replace(/^\/wards$/, '/quan-ly-phuong-xa')
        .replace(/^\/companies$/, '/quan-ly-cong-ty')
        .replace(/^\/profiles$/, '/quan-ly-ho-so-ung-vien')
        .replace(/^\/resumes$/, '/quan-ly-cv-resume')
        .replace(/^\/job-activity$/, '/nhat-ky-tin-tuyen-dung')
        .replace(/^\/job-notifications$/, '/thong-bao-viec-lam')
        .replace(/^\/interviews\/live$/, '/phong-van-cong-ty-truc-tiep');
    }
    return canonicalChildPath;
  }

  if (portal === 'employer') {
    if (lng === 'vi') {
      return canonicalChildPath
        .replace(/^\/dashboard$/, '/bang-dieu-khien')
        .replace(/^\/introduce$/, '/gioi-thieu')
        .replace(/^\/service$/, '/dich-vu')
        .replace(/^\/pricing$/, '/bao-gia')
        .replace(/^\/support$/, '/ho-tro')
        .replace(/^\/blog$/, '/blog-tuyen-dung')
        .replace(/^\/job-posts$/, '/tin-tuyen-dung')
        .replace(/^\/applied-profiles$/, '/ho-so-ung-tuyen')
        .replace(/^\/saved-profiles$/, '/ho-so-da-luu')
        .replace(/^\/candidates$/, '/danh-sach-ung-vien')
        .replace(/^\/candidates\/(.+)$/, '/chi-tiet-ung-vien/$1')
        .replace(/^\/company$/, '/cong-ty')
        .replace(/^\/employees$/, '/nhan-su-va-vai-tro')
        .replace(/^\/notifications$/, '/thong-bao')
        .replace(/^\/account$/, '/tai-khoan')
        .replace(/^\/settings$/, '/cai-dat')
        .replace(/^\/chat$/, '/ket-noi-voi-ung-vien')
        .replace(/^\/interviews$/, '/danh-sach-phong-van')
        .replace(/^\/interviews\/live$/, '/phong-van-ung-vien-truc-tiep')
        .replace(/^\/interviews\/create$/, '/len-lich-phong-van')
        .replace(/^\/interviews\/(.+)$/, '/chi-tiet-phong-van/$1')
        .replace(/^\/question-bank$/, '/ngan-hang-cau-hoi')
        .replace(/^\/question-groups$/, '/bo-cau-hoi')
        .replace(/^\/verification$/, '/xac-thuc-nha-tuyen-dung');
    }
    return canonicalChildPath;
  }

  return localizeRoutePath(canonicalChildPath, lng);
};

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
    const currentPath = window.location.pathname || '/';
    const portal = detectPortalFromPath(currentPath);
    if (portal !== 'jobseeker') {
      const childPath = stripPortalPrefix(currentPath);
      const canonicalChildPath = toCanonicalChildPath(portal, childPath);
      const localizedChildPath = localizeCanonicalChildPath(portal, canonicalChildPath, lng);
      const nextFullPath = buildPortalPath(portal, localizedChildPath, lng);
      if (nextFullPath !== currentPath) {
        window.location.assign(`${nextFullPath}${location.search}${location.hash}`);
      }
    } else {
      const localizedPath = localizeRoutePath(location.pathname, lng);
      if (localizedPath === location.pathname) {
        i18n.changeLanguage(lng);
        handleClose();
        return;
      }
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
