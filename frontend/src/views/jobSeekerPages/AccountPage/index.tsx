'use client';

import React from 'react';
import {
  Box,
  Card,
  Typography,
  Chip,
  Switch,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  InputAdornment,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import LogoutIcon from '@mui/icons-material/Logout';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';

import { useTranslation } from 'react-i18next';
import { TabTitle } from '../../../utils/generalFunction';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { removeUserInfo, getUserInfo } from '@/redux/userSlice';
import tokenService from '@/services/tokenService';
import authService from '@/services/authService';
import jobSeekerProfileService from '@/services/jobSeekerProfileService';
import toastMessages from '@/utils/toastMessages';

const AccountPage = () => {
  const { t, i18n } = useTranslation(['jobSeeker', 'common']);
  TabTitle(t('account.pageTitle', { defaultValue: 'Cài đặt tài khoản' }));

  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);

  // Dynamic user security info states from real currentUser data
  const [email, setEmail] = React.useState<string>(currentUser?.email || '');

  const [phone, setPhone] = React.useState<string>(() => {
    return (
      (currentUser as unknown as { phone?: string })?.phone ||
      (currentUser as unknown as { phoneNumber?: string })?.phoneNumber ||
      ''
    );
  });

  // Notification preferences states (persisted in localStorage)
  const [emailNotify, setEmailNotify] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sq_notify_email') !== 'false';
    }
    return true;
  });

  const [smsNotify, setSmsNotify] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sq_notify_sms') !== 'false';
    }
    return true;
  });

  const [jobAlertNotify, setJobAlertNotify] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sq_notify_jobs') !== 'false';
    }
    return true;
  });

  // Dialog States
  const [emailDialogOpen, setEmailDialogOpen] = React.useState(false);
  const [newEmailInput, setNewEmailInput] = React.useState('');

  const [phoneDialogOpen, setPhoneDialogOpen] = React.useState(false);
  const [newPhoneInput, setNewPhoneInput] = React.useState('');

  const [passwordDialogOpen, setPasswordDialogOpen] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showCurrentPass, setShowCurrentPass] = React.useState(false);
  const [showNewPass, setShowNewPass] = React.useState(false);
  const [showConfirmPass, setShowConfirmPass] = React.useState(false);

  const [langDialogOpen, setLangDialogOpen] = React.useState(false);
  const [selectedLang, setSelectedLang] = React.useState(i18n.language || 'vi');

  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

  // Sync Redux currentUser changes if available
  React.useEffect(() => {
    if (currentUser?.email) setEmail(currentUser.email);
    const userPhone = (currentUser as unknown as { phoneNumber?: string })?.phoneNumber;
    if (userPhone) setPhone(userPhone);
  }, [currentUser]);

  // Handlers for Notifications
  const handleToggleEmailNotify = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setEmailNotify(val);
    if (typeof window !== 'undefined') localStorage.setItem('sq_notify_email', String(val));
    toastMessages.success(val ? 'Đã bật nhận thông báo qua Email' : 'Đã tắt nhận thông báo qua Email');
  };

  const handleToggleSmsNotify = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setSmsNotify(val);
    if (typeof window !== 'undefined') localStorage.setItem('sq_notify_sms', String(val));
    toastMessages.success(val ? 'Đã bật nhận thông báo qua SMS' : 'Đã tắt nhận thông báo qua SMS');
  };

  const handleToggleJobAlertNotify = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setJobAlertNotify(val);
    if (typeof window !== 'undefined') localStorage.setItem('sq_notify_jobs', String(val));
    toastMessages.success(val ? 'Đã bật nhận thông báo việc làm phù hợp' : 'Đã tắt nhận thông báo việc làm');
  };

  // Handlers for Security Modals
  const handleOpenEmailDialog = () => {
    setNewEmailInput(email);
    setEmailDialogOpen(true);
  };

  const handleSaveEmail = async () => {
    if (!newEmailInput.trim() || !newEmailInput.includes('@')) {
      toastMessages.error('Vui lòng nhập địa chỉ email hợp lệ!');
      return;
    }
    try {
      await authService.updateUser({ email: newEmailInput.trim() });
      setEmail(newEmailInput.trim());
      void dispatch(getUserInfo());
      setEmailDialogOpen(false);
      toastMessages.success('Cập nhật địa chỉ email thành công!');
    } catch (err) {
      console.error('Failed to update email:', err);
      toastMessages.error('Không thể cập nhật email. Vui lòng thử lại!');
    }
  };

  const handleOpenPhoneDialog = () => {
    setNewPhoneInput(phone);
    setPhoneDialogOpen(true);
  };

  const handleSavePhone = async () => {
    if (!newPhoneInput.trim() || newPhoneInput.trim().length < 8) {
      toastMessages.error('Vui lòng nhập số điện thoại hợp lệ!');
      return;
    }
    try {
      await jobSeekerProfileService.updateProfile({ phone: newPhoneInput.trim() });
      setPhone(newPhoneInput.trim());
      void dispatch(getUserInfo());
      setPhoneDialogOpen(false);
      toastMessages.success('Cập nhật số điện thoại thành công!');
    } catch (err) {
      console.error('Failed to update phone number:', err);
      toastMessages.error('Không thể cập nhật số điện thoại. Vui lòng thử lại!');
    }
  };

  const handleOpenPasswordDialog = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordDialogOpen(true);
  };

  const handleSavePassword = async () => {
    if (!currentPassword) {
      toastMessages.error('Vui lòng nhập mật khẩu hiện tại!');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toastMessages.error('Mật khẩu mới phải chứa ít nhất 6 ký tự!');
      return;
    }
    if (newPassword !== confirmPassword) {
      toastMessages.error('Xác nhận mật khẩu mới không khớp!');
      return;
    }
    try {
      await authService.changePassword({ oldPassword: currentPassword, newPassword: newPassword, confirmPassword });
      setPasswordDialogOpen(false);
      toastMessages.success('Đổi mật khẩu tài khoản thành công!');
    } catch (err) {
      console.error('Failed to change password:', err);
      toastMessages.error('Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại!');
    }
  };

  const handleSaveLanguage = () => {
    i18n.changeLanguage(selectedLang);
    setLangDialogOpen(false);
    toastMessages.success(
      selectedLang === 'vi' ? 'Đã chuyển ngôn ngữ sang Tiếng Việt' : 'Language changed to English'
    );
  };

  const handleConfirmLogout = async () => {
    setLogoutDialogOpen(false);
    const token = tokenService.getAccessTokenFromCookie() || '';
    tokenService.removeAccessTokenAndRefreshTokenFromCookie();
    await dispatch(removeUserInfo({ accessToken: token }));
    toastMessages.info('Đã đăng xuất tài khoản thành công.');
    window.location.replace('/login');
  };

  return (
    <Stack spacing={3}>
      {/* Card 1: Account Security */}
      <Card
        elevation={0}
        sx={{
          p: 3,
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2.5 }}>
          Bảo mật tài khoản
        </Typography>

        <Stack spacing={0.5}>
          {/* Email Row */}
          <Box
            onClick={handleOpenEmailDialog}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 1.75,
              px: 1,
              borderRadius: '12px',
              borderBottom: '1px solid #f1f5f9',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { backgroundColor: '#f8fafc' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#64748b', minWidth: 110 }}>
                Email
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: email ? '#0f172a' : '#94a3b8' }}>
                {email || 'Chưa cập nhật'}
              </Typography>
              {email && (
                <Chip
                  size="small"
                  label="Đã xác thực"
                  sx={{
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    height: 20,
                  }}
                />
              )}
            </Box>
            <ArrowForwardIosIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
          </Box>

          {/* Password Row */}
          <Box
            onClick={handleOpenPasswordDialog}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 1.75,
              px: 1,
              borderRadius: '12px',
              borderBottom: '1px solid #f1f5f9',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { backgroundColor: '#f8fafc' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#64748b', minWidth: 110 }}>
                Mật khẩu
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: 2 }}>
                ••••••••••••
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 700 }}>
                Đổi mật khẩu
              </Typography>
              <ArrowForwardIosIcon sx={{ fontSize: 14, color: '#2563eb' }} />
            </Box>
          </Box>

          {/* Phone Row */}
          <Box
            onClick={handleOpenPhoneDialog}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 1.75,
              px: 1,
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { backgroundColor: '#f8fafc' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#64748b', minWidth: 110 }}>
                Số điện thoại
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: phone ? '#0f172a' : '#94a3b8' }}>
                {phone || 'Chưa cập nhật'}
              </Typography>
              {phone && (
                <Chip
                  size="small"
                  label="Đã xác thực"
                  sx={{
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    height: 20,
                  }}
                />
              )}
            </Box>
            <ArrowForwardIosIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
          </Box>
        </Stack>
      </Card>

      {/* Card 2: Notifications Settings */}
      <Card
        elevation={0}
        sx={{
          p: 3,
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
          Thông báo
        </Typography>

        <Stack spacing={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, px: 1 }}>
            <Typography variant="subtitle2" sx={{ color: '#334155', fontWeight: 600 }}>
              Nhận thông báo qua email
            </Typography>
            <Switch checked={emailNotify} onChange={handleToggleEmailNotify} color="primary" />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, px: 1 }}>
            <Typography variant="subtitle2" sx={{ color: '#334155', fontWeight: 600 }}>
              Nhận thông báo qua SMS
            </Typography>
            <Switch checked={smsNotify} onChange={handleToggleSmsNotify} color="primary" />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, px: 1 }}>
            <Typography variant="subtitle2" sx={{ color: '#334155', fontWeight: 600 }}>
              Thông báo việc làm phù hợp
            </Typography>
            <Switch checked={jobAlertNotify} onChange={handleToggleJobAlertNotify} color="primary" />
          </Box>
        </Stack>
      </Card>

      {/* Card 3: Other Settings & Logout */}
      <Card
        elevation={0}
        sx={{
          p: 3,
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
          Khác
        </Typography>

        <Stack spacing={2}>
          {/* Language Row */}
          <Box
            onClick={() => setLangDialogOpen(true)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 1.5,
              px: 1,
              borderRadius: '12px',
              borderBottom: '1px solid #f1f5f9',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { backgroundColor: '#f8fafc' },
            }}
          >
            <Typography variant="subtitle2" sx={{ color: '#334155', fontWeight: 600 }}>
              Ngôn ngữ
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                {i18n.language === 'en' ? 'English' : 'Tiếng Việt'}
              </Typography>
              <ArrowForwardIosIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
            </Box>
          </Box>

          {/* Logout Button Row */}
          <Box sx={{ pt: 1, px: 1 }}>
            <Button
              variant="text"
              startIcon={<LogoutIcon sx={{ color: '#ef4444' }} />}
              onClick={() => setLogoutDialogOpen(true)}
              sx={{
                color: '#ef4444',
                fontWeight: 800,
                fontSize: '0.9rem',
                textTransform: 'none',
                p: 0,
                '&:hover': { backgroundColor: 'transparent', color: '#dc2626' },
              }}
            >
              Đăng xuất khỏi tài khoản
            </Button>
          </Box>
        </Stack>
      </Card>

      {/* Edit Email Dialog */}
      <Dialog
        open={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailOutlinedIcon sx={{ color: '#2563eb' }} />
          Cập nhật Email tài khoản
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#f1f5f9' }}>
          <Box sx={{ pt: 1 }}>
            <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700, mb: 0.5, display: 'block' }}>
              Địa chỉ Email mới *
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="email"
              value={newEmailInput}
              onChange={(e) => setNewEmailInput(e.target.value)}
              placeholder="VD: name@example.com"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEmailDialogOpen(false)} sx={{ color: '#64748b', fontWeight: 700, borderRadius: '10px' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEmail}
            sx={{ borderRadius: '10px', backgroundColor: '#2563eb', fontWeight: 700, px: 3 }}
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Phone Dialog */}
      <Dialog
        open={phoneDialogOpen}
        onClose={() => setPhoneDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhoneOutlinedIcon sx={{ color: '#2563eb' }} />
          Cập nhật Số điện thoại
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#f1f5f9' }}>
          <Box sx={{ pt: 1 }}>
            <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700, mb: 0.5, display: 'block' }}>
              Số điện thoại mới *
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="tel"
              value={newPhoneInput}
              onChange={(e) => setNewPhoneInput(e.target.value)}
              placeholder="VD: 0901 234 567"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPhoneDialogOpen(false)} sx={{ color: '#64748b', fontWeight: 700, borderRadius: '10px' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSavePhone}
            sx={{ borderRadius: '10px', backgroundColor: '#2563eb', fontWeight: 700, px: 3 }}
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockOutlinedIcon sx={{ color: '#2563eb' }} />
          Đổi mật khẩu tài khoản
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#f1f5f9' }}>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700, mb: 0.5, display: 'block' }}>
                Mật khẩu hiện tại *
              </Typography>
              <TextField
                fullWidth
                size="small"
                type={showCurrentPass ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowCurrentPass(!showCurrentPass)} edge="end">
                        {showCurrentPass ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700, mb: 0.5, display: 'block' }}>
                Mật khẩu mới *
              </Typography>
              <TextField
                fullWidth
                size="small"
                type={showNewPass ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowNewPass(!showNewPass)} edge="end">
                        {showNewPass ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700, mb: 0.5, display: 'block' }}>
                Xác nhận mật khẩu mới *
              </Typography>
              <TextField
                fullWidth
                size="small"
                type={showConfirmPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirmPass(!showConfirmPass)} edge="end">
                        {showConfirmPass ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPasswordDialogOpen(false)} sx={{ color: '#64748b', fontWeight: 700, borderRadius: '10px' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSavePassword}
            sx={{ borderRadius: '10px', backgroundColor: '#2563eb', fontWeight: 700, px: 3 }}
          >
            Lưu mật khẩu mới
          </Button>
        </DialogActions>
      </Dialog>

      {/* Select Language Dialog */}
      <Dialog
        open={langDialogOpen}
        onClose={() => setLangDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
          <LanguageOutlinedIcon sx={{ color: '#2563eb' }} />
          Chọn Ngôn ngữ giao diện
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#f1f5f9' }}>
          <RadioGroup value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)}>
            <FormControlLabel
              value="vi"
              control={<Radio color="primary" />}
              label={
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Tiếng Việt (Việt Nam)
                </Typography>
              }
              sx={{ py: 1, borderBottom: '1px solid #f1f5f9' }}
            />
            <FormControlLabel
              value="en"
              control={<Radio color="primary" />}
              label={
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  English (United States)
                </Typography>
              }
              sx={{ py: 1 }}
            />
          </RadioGroup>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setLangDialogOpen(false)} sx={{ color: '#64748b', fontWeight: 700, borderRadius: '10px' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveLanguage}
            sx={{ borderRadius: '10px', backgroundColor: '#2563eb', fontWeight: 700, px: 3 }}
          >
            Áp dụng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Logout Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#ef4444' }}>Đăng xuất tài khoản</DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#f1f5f9' }}>
          <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>
            Bạn có chắc chắn muốn đăng xuất khỏi tài khoản InfoHR không?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setLogoutDialogOpen(false)} sx={{ color: '#64748b', fontWeight: 700, borderRadius: '10px' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmLogout}
            sx={{ borderRadius: '10px', backgroundColor: '#ef4444', fontWeight: 700, px: 3 }}
          >
            Đăng xuất
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default AccountPage;
