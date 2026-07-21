import React from 'react';
import { Button, Stack, styled, Divider } from '@mui/material';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import GoogleIcon from '@mui/icons-material/Google';

const StyledButton = styled(Button)({
  padding: '8px 16px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 500,
  textTransform: 'none',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
});

const StyledSocialButton = styled(Button)({
  padding: '8px 16px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 500,
  textTransform: 'none',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
});

const StyledDivider = styled(Divider)({
  margin: '20px 0',
  '&::before, &::after': {
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  '& .MuiDivider-wrapper': {
    padding: '0 16px',
    fontSize: '13px',
    color: 'rgba(0, 0, 0, 0.6)',
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
        startIcon={<GoogleIcon />}
        sx={{
          borderColor: '#DB4437',
          color: '#DB4437',
          '&:hover': {
            borderColor: '#DB4437',
            backgroundColor: 'rgba(219, 68, 55, 0.04)',
          },
        }}
      >
        {googleLabel}
      </StyledSocialButton>
    </Stack>
  </>
);

export default JobSeekerSignUpSocialButtons;
