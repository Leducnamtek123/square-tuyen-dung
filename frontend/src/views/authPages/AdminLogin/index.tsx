import * as React from 'react';
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
  keyframes,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TabTitle } from '../../../utils/generalFunction';
import { ROLES_NAME, ROUTES } from '../../../configs/constants';
import toastMessages from '../../../utils/toastMessages';
import BackdropLoading from '../../../components/loading/BackdropLoading';
import { updateVerifyEmail } from '../../../redux/authSlice';
import { getUserInfo } from '../../../redux/userSlice';
import AdminLoginForm from '../../components/auths/JobSeekerLoginForm';
import authService from '../../../services/authService';
import tokenService from '../../../services/tokenService';
import type { RoleName } from '../../../types/auth';

/* ────────────── animations ────────────── */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const slideProgress = keyframes`
  from { width: 0%; }
  to   { width: 100%; }
`;

/* ────────────── slide data ────────────── */
const SLIDES = [
  {
    image: '/images/admin-login/slide-1.png',
    title: 'TÌM KIẾM NHÂN TÀI SÁNG GIÁ NHẤT CHO DOANH NGHIỆP CỦA BẠN',
    subtitle: 'Tìm kiếm ứng viên tài năng từ hàng ngàn hồ sơ xin việc trong cơ sở dữ liệu trực tuyến.',
  },
  {
    image: '/images/admin-login/slide-2.png',
    title: 'QUẢN LÝ TUYỂN DỤNG THÔNG MINH VÀ HIỆU QUẢ',
    subtitle: 'Tối ưu quy trình tuyển dụng với hệ thống quản lý hiện đại và trực quan.',
  },
  {
    image: '/images/admin-login/slide-3.png',
    title: 'HỆ THỐNG QUẢN TRỊ TUYỂN DỤNG TIÊN TIẾN',
    subtitle: 'Ứng dụng AI để phân tích, đánh giá và kết nối ứng viên phù hợp nhất.',
  },
];

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
  animation: `${fadeIn} .6s ease-out`,
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
  transition: 'opacity .8s ease-in-out',
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
  transition: 'all .35s ease',
  padding: 0,
  position: 'relative',
  overflow: 'hidden',
  '&::after': active
    ? {
        content: '""',
        position: 'absolute' as const,
        left: 0,
        top: 0,
        height: '100%',
        background: 'rgba(255,255,255,.7)',
        borderRadius: 4,
        animation: `${slideProgress} ${INTERVAL_MS}ms linear`,
      }
    : {},
}));

/* ────────────── component ────────────── */
const AdminLogin: React.FC = () => {
  const { t } = useTranslation('auth');
  TabTitle(t('login.adminTitle'));
  const dispatch = useDispatch() as any;
  const nav = useRouter();

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  /* ── slider state ── */
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = React.useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, INTERVAL_MS);
  }, []);

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
  const handleLogin = (data: any) => {
    const getAccessToken = async (email: string, password: any, roleName: string) => {
      setIsLoading(true);
      try {
        const resData = await authService.getToken(email, password, roleName as RoleName);
        const { access_token: accessToken, refresh_token: refreshToken, backend } = resData;

        const saved = tokenService.saveAccessTokenAndRefreshTokenToCookie(
          accessToken,
          refreshToken,
          backend as any,
        );

        if (saved) {
          dispatch(getUserInfo())
            .unwrap()
            .then(() => nav.push('/'))
            .catch(() => toastMessages.error(t('messages.loginError')));
        } else {
          toastMessages.error(t('messages.loginError'));
        }
      } catch (error: any) {
        const res = error?.response;
        if (res?.status === 400) {
          const errors = res?.data?.errors;
          if (errors && 'errorMessage' in errors) {
            setErrorMessage(errors.errorMessage.join(' '));
          } else {
            toastMessages.error(t('messages.tryAgain'));
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    const checkCreds = async (email: string, password: any, roleName: string) => {
      setIsLoading(true);
      try {
        const resData = await authService.checkCreds(email, roleName as RoleName);
        const { exists, email: resEmail, email_verified } = resData as any;

        if (exists === true && email_verified === false) {
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
          setErrorMessage(t('messages.noAdminAccount'));
          return;
        }
        getAccessToken(resEmail, password, roleName);
      } catch (error) {
        toastMessages.error(t('messages.loginError'));
      } finally {
        setIsLoading(false);
      }
    };

    checkCreds(data.email, data.password, ROLES_NAME.ADMIN);
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
            Đăng Nhập Quản Trị
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}
          >
            Chào mừng bạn trở lại hệ thống quản trị tuyển dụng
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              <AlertTitle sx={{ fontWeight: 600 }}>Lỗi đăng nhập</AlertTitle>
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
            Vào trang&nbsp;
            <Link href="https://square.vn" target="_blank" sx={{ color: '#1a73e8' }}>
              www.square.vn
            </Link>
          </Typography>
        </LeftPanel>

        {/* ─── RIGHT: Auto-slide images ─── */}
        <RightPanel>
          {SLIDES.map((slide, idx) => (
            <SlideImage
              key={idx}
              src={slide.image}
              alt={slide.title}
              sx={{ opacity: idx === currentSlide ? 1 : 0 }}
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
                transition: 'opacity .5s',
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
