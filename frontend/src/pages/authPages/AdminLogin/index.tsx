import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
import { ROLES_NAME } from '../../../configs/constants';
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
const DRAG_THRESHOLD = 50; // px to trigger slide change

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
  cursor: 'grab',
  userSelect: 'none',
  '&:active': {
    cursor: 'grabbing',
  },
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const SlideTrack = styled(Box)({
  display: 'flex',
  height: '100%',
  transition: 'transform .45s cubic-bezier(.4,0,.2,1)',
  willChange: 'transform',
});

const SlideItem = styled(Box)({
  flex: '0 0 100%',
  position: 'relative',
  overflow: 'hidden',
});

const SlideImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
  pointerEvents: 'none',
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
  pointerEvents: 'none',
});

const DotsContainer = styled(Stack)({
  position: 'absolute',
  bottom: 24,
  left: 36,
  zIndex: 3,
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
  const nav = useNavigate();

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  /* ── slider state ── */
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Drag state
  const isDragging = React.useRef(false);
  const dragStartX = React.useRef(0);
  const dragDelta = React.useRef(0);
  const trackRef = React.useRef<HTMLDivElement>(null);

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

  /* ── drag handlers ── */
  const handleDragStart = (clientX: number) => {
    isDragging.current = true;
    dragStartX.current = clientX;
    dragDelta.current = 0;
    if (timerRef.current) clearInterval(timerRef.current);
    // Remove smooth transition during drag
    if (trackRef.current) {
      trackRef.current.style.transition = 'none';
    }
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging.current) return;
    dragDelta.current = clientX - dragStartX.current;
    if (trackRef.current) {
      const baseOffset = -(currentSlide * 100);
      const containerWidth = trackRef.current.parentElement?.offsetWidth || 1;
      const dragPercent = (dragDelta.current / containerWidth) * 100;
      trackRef.current.style.transform = `translateX(${baseOffset + dragPercent}%)`;
    }
  };

  const handleDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    // Restore smooth transition
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform .45s cubic-bezier(.4,0,.2,1)';
    }

    const delta = dragDelta.current;
    if (Math.abs(delta) > DRAG_THRESHOLD) {
      if (delta < 0 && currentSlide < SLIDES.length - 1) {
        // Dragged left → next slide
        goToSlide(currentSlide + 1);
      } else if (delta > 0 && currentSlide > 0) {
        // Dragged right → prev slide
        goToSlide(currentSlide - 1);
      } else {
        // Snap back
        goToSlide(currentSlide);
      }
    } else {
      // Snap back
      goToSlide(currentSlide);
    }
    dragDelta.current = 0;
  };

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };
  const onMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX);
  const onMouseUp = () => handleDragEnd();
  const onMouseLeave = () => {
    if (isDragging.current) handleDragEnd();
  };

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX);
  const onTouchEnd = () => handleDragEnd();

  /* ── auth logic (reuse same form handler) ── */
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
            .then(() => nav('/'))
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
          nav('/dang-nhap');
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
          {/* Logo */}
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

        {/* ─── RIGHT: Draggable Image slider ─── */}
        <RightPanel
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <SlideTrack
            ref={trackRef}
            sx={{
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >
            {SLIDES.map((slide, idx) => (
              <SlideItem key={idx}>
                <SlideImage
                  src={slide.image}
                  alt={slide.title}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  draggable={false}
                />
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
                    {slide.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255,255,255,.85)',
                      mb: 1,
                      lineHeight: 1.6,
                      textShadow: '0 1px 4px rgba(0,0,0,.3)',
                    }}
                  >
                    {slide.subtitle}
                  </Typography>
                </SlideOverlay>
              </SlideItem>
            ))}
          </SlideTrack>

          {/* Dots */}
          <DotsContainer direction="row" spacing={1} alignItems="center">
            {SLIDES.map((_, idx) => (
              <Dot
                key={idx}
                active={idx === currentSlide}
                onClick={() => goToSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </DotsContainer>
        </RightPanel>
      </Card>

      {isLoading && <BackdropLoading />}
    </>
  );
};

export default AdminLogin;
