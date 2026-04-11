import * as React from 'react';
import type { AppDispatch } from '../../../redux/store';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import {
  Alert,
  AlertTitle,
  Box,
  Link,
  Stack,
  Typography,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TabTitle } from '../../../utils/generalFunction';
import { ROLES_NAME, ROUTES } from '../../../configs/constants';
import toastMessages from '../../../utils/toastMessages';
import BackdropLoading from '../../../components/Common/Loading/BackdropLoading';
import { updateVerifyEmail } from '../../../redux/authSlice';
import { getUserInfo } from '../../../redux/userSlice';
import AdminLoginForm from '../../components/auths/JobSeekerLoginForm';
import authService from '../../../services/authService';
import tokenService from '../../../services/tokenService';
import type { RoleName } from '../../../types/auth';
import { getPreferredLanguage, buildPortalPath } from '../../../configs/portalRouting';

const INTERVAL_MS = 5000;

/* ────────────── styled components ────────────── */
const Card = styled(Box)(() => ({
  display: 'flex',
  width: '100%',
  maxWidth: 1080,
  minHeight: 560,
  borderRadius: 20,
  overflow: 'hidden',
  boxShadow: '0 24px 64px rgba(0,0,0,.35)',
}));

const LeftPanel = styled(Box)(({ theme }) => ({
  flex: '0 0 46%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(5, 5),
  background: '#fff',
  [theme.breakpoints.down('md')]: {
    flex: '1 1 100%',
    padding: theme.spacing(4, 3),
  },
}));

const RightPanel = styled(Box)(({ theme }) => ({
  flex: '1 1 54%',
  position: 'relative',
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const SlideImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute',
  inset: 0,
});

const SlideOverlay = styled(Box)({
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,.65) 100%)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  padding: '40px 36px',
  zIndex: 2,
});

const Dot = styled('button')<{ active: boolean }>(({ active }) => ({
  width: active ? 28 : 8,
  height: 8,
  border: 'none',
  borderRadius: 4,
  background: active ? '#fff' : 'rgba(255,255,255,.45)',
  cursor: 'pointer',
  padding: 0,
}));

/* ────────────── component ────────────── */
const AdminLogin: React.FC = () => {
  const { t } = useTranslation(['auth', 'admin']);
  TabTitle(t('auth:login.adminTitle'));
  const dispatch = useDispatch<AppDispatch>();
  const nav = useRouter();

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  /* ── slider data ── */
  const SLIDES = [
    {
      image: '/images/admin-login/slide-1.png',
      title: t('admin:login.slide1Title'),
      subtitle: t('admin:login.slide1Subtitle'),
    },
    {
      image: '/images/admin-login/slide-2.png',
      title: t('admin:login.slide2Title'),
      subtitle: t('admin:login.slide2Subtitle'),
    },
    {
      image: '/images/admin-login/slide-3.png',
      title: t('admin:login.slide3Title'),
      subtitle: t('admin:login.slide3Subtitle'),
    },
  ];

  /* ── slider state ── */
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = React.useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, INTERVAL_MS);
  }, [SLIDES.length]);

  React.useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const goToSlide = (idx: number) => {
    setCurrentSlide(idx);
    resetTimer();
  };

  /* ── auth logic ── */
  const handleLogin: React.ComponentProps<typeof AdminLoginForm>['onLogin'] = (data) => {
    const getAccessToken = async (email: string, password: string, roleName: string) => {
      setIsLoading(true);
      try {
        const resData = await authService.getToken(email, password, roleName as RoleName);
        const { accessToken, refreshToken, backend } = resData as any;

        const saved = tokenService.saveAccessTokenAndRefreshTokenToCookie(
          accessToken,
          refreshToken,
          backend,
        );

        if (saved) {
          dispatch(getUserInfo())
            .unwrap()
            .then(() => {
              const lang = getPreferredLanguage();
              const dashboardPath = buildPortalPath('admin', '/dashboard', lang);
              nav.push(dashboardPath);
            })
            .catch(() => toastMessages.error(t('auth:messages.loginError')));
        } else {
          toastMessages.error(t('auth:messages.loginError'));
        }
      } catch (error: unknown) {
        const res = (error as { response?: { status?: number; data?: { errors?: Record<string, string[]> } } })?.response;
        if (res?.status === 400) {
          const errors = res?.data?.errors;
          if (errors && 'errorMessage' in errors) {
            const errMsg = errors.errorMessage;
            setErrorMessage(Array.isArray(errMsg) ? errMsg.join(' ') : String(errMsg));
          } else {
            toastMessages.error(t('auth:messages.tryAgain'));
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    const checkCreds = async (email: string, password: string, roleName: string) => {
      setIsLoading(true);
      try {
        const resData = await authService.checkCreds(email, roleName as RoleName);
        const { exists, email: resEmail, emailVerified } = resData as { exists: boolean; email: string; emailVerified: boolean };

        if (exists === true && emailVerified === false) {
          dispatch(
            updateVerifyEmail({
              isAllowVerifyEmail: true,
              email: email,
              roleName: roleName as RoleName,
            }),
          );
          nav.push(`/${ROUTES.AUTH.LOGIN}`);
          return;
        } else if (exists === false) {
          setErrorMessage(t('auth:messages.noAdminAccount'));
          return;
        }
        getAccessToken(resEmail, password, roleName);
      } catch (error) {
        toastMessages.error(t('auth:messages.loginError'));
      } finally {
        setIsLoading(false);
      }
    };

    checkCreds(data.email, data.password || '', ROLES_NAME.ADMIN);
  };

  return (
    <>
      <Card>
        {/* ─── LEFT: Form ─── */}
        <LeftPanel>
          <Box sx={{ mb: 1 }}>
            <img
              src="/square-icons/logo square svg-black.svg"
              alt="Square Logo"
              style={{ height: 42 }}
            />
          </Box>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#1a73e8',
              mb: 0.5,
              letterSpacing: '-.3px',
            }}
          >
            {t('auth:login.headingAdmin')}
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}
          >
            {t('auth:login.welcomeBack')}
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              <AlertTitle sx={{ fontWeight: 600 }}>{t('auth:login.errorTitle')}</AlertTitle>
              {errorMessage}
            </Alert>
          )}

          <Box sx={{ mt: 1 }}>
            <AdminLoginForm onLogin={handleLogin} onGoogleLogin={() => {}} />
          </Box>

          <Typography
            variant="caption"
            sx={{ mt: 4, textAlign: 'center', color: 'text.disabled' }}
          >
            {t('auth:login.visitPage')}&nbsp;
            <Link href="https://square.vn" target="_blank" sx={{ color: '#1a73e8' }}>{t('common:auto.index_wwwsquarevn_9a21', `www.square.vn`)}</Link>
          </Typography>
        </LeftPanel>

        {/* ─── RIGHT: Image slides (no animation) ─── */}
        <RightPanel>
          {SLIDES.map((slide, idx) => (
            <SlideImage
              key={idx}
              src={slide.image}
              alt={slide.title}
              sx={{
                opacity: idx === currentSlide ? 1 : 0,
                zIndex: idx === currentSlide ? 1 : 0,
              }}
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          ))}

          <SlideOverlay>
            <Typography
              variant="h6"
              sx={{
                color: '#fff',
                fontWeight: 700,
                mb: 1,
                lineHeight: 1.35,
                textShadow: '0 2px 8px rgba(0,0,0,.4)',
              }}
            >
              {SLIDES[currentSlide].title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,.85)',
                mb: 3,
                lineHeight: 1.6,
                textShadow: '0 1px 4px rgba(0,0,0,.3)',
              }}
            >
              {SLIDES[currentSlide].subtitle}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              {SLIDES.map((_, idx) => (
                <Dot
                  key={idx}
                  active={idx === currentSlide}
                  onClick={() => goToSlide(idx)}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </Stack>
          </SlideOverlay>
        </RightPanel>
      </Card>

      {isLoading && <BackdropLoading />}
    </>
  );
};

export default AdminLogin;
