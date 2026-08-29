import React from 'react';
import { Button, Stack, styled, Divider } from '@mui/material';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { GoogleColoredIcon } from '../../../../components/Common/SocialIcons';

const StyledButton = styled(Button)(({ theme }) => ({
  minHeight: '46px',
  padding: '10px 24px',
  borderRadius: '12px',
  fontSize: '15px',
  fontWeight: 600,
  textTransform: 'none',
  color: '#ffffff',
  background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
  boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)',
  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  '&:hover': {
    background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
    transform: 'translateY(-1px)',
    boxShadow: '0 12px 24px rgba(37, 99, 235, 0.32)',
  },
  '&:active': {
    transform: 'scale(0.98)',
  },
}));

const StyledSocialButton = styled(Button)(({ theme }) => ({
  minHeight: '44px',
  padding: '9px 20px',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: 500,
  textTransform: 'none',
  backgroundColor: '#FFFFFF',
  borderColor: '#E2E8F0',
  color: '#1E293B',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  '&:active': {
    transform: 'scale(0.98)',
  },
}));

const StyledDivider = styled(Divider)({
  margin: '24px 0',
  '&::before, &::after': {
    borderColor: '#E2E8F0',
  },
  '& .MuiDivider-wrapper': {
    padding: '0 16px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#64748B',
  },
});

type Props = {
  onSubmitLabel: string;
  socialLabel: string;
  googleLabel: string;
  onGoogleClick: () => void;
};

const JobSeekerSignUpSocialButtons = ({ onSubmitLabel, socialLabel, googleLabel, onGoogleClick }: Props) => (
  <>
    <StyledButton fullWidth variant="contained" type="submit" endIcon={<HowToRegIcon />}>
      {onSubmitLabel}
    </StyledButton>

    <StyledDivider>{socialLabel}</StyledDivider>

    <Stack direction="row" spacing={2} sx={{ width: '100%', '& > *': { flex: 1 } }}>
      <StyledSocialButton
        fullWidth
        variant="outlined"
        onClick={onGoogleClick}
        startIcon={<GoogleColoredIcon size={20} />}
      >
        {googleLabel}
      </StyledSocialButton>
    </Stack>
  </>
);

export default JobSeekerSignUpSocialButtons;
