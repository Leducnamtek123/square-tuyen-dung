import React from 'react';
import {
  Box,
  Divider,
  InputBase,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import * as CountryFlags from 'country-flag-icons/react/3x2';
import { getExampleNumber, type CountryCode } from 'libphonenumber-js';
import mobileExamples from 'libphonenumber-js/mobile/examples';
import { useTranslation } from 'react-i18next';
import {
  formatNationalPhoneInput,
  getPhoneCountryOptions,
  getPhoneInputStateFromValue,
  type PhoneCountryOption,
} from './phoneNumberUtils';

type CountryFlagCode = keyof typeof CountryFlags;

type CountryPhoneInputProps = {
  countryCode: CountryCode;
  value: string;
  label: string;
  disabled?: boolean;
  onCountryCodeChange: (countryCode: CountryCode) => void;
  onValueChange: (value: string) => void;
};

const CountryFlag = ({ option }: { option: PhoneCountryOption }) => {
  const Flag = CountryFlags[option.code as CountryFlagCode];

  if (!Flag) {
    return (
      <Typography component="span" sx={{ width: 28, color: 'text.secondary', fontWeight: 700 }}>
        {option.code}
      </Typography>
    );
  }

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 20,
        overflow: 'hidden',
        borderRadius: '3px',
        boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.08)',
      }}
    >
      <Flag aria-hidden focusable="false" style={{ display: 'block', width: '100%', height: '100%' }} />
    </Box>
  );
};

const CountryPhoneInput = ({
  countryCode,
  value,
  label,
  disabled,
  onCountryCodeChange,
  onValueChange,
}: CountryPhoneInputProps) => {
  const { i18n } = useTranslation();
  const inputId = React.useId();
  const [focused, setFocused] = React.useState(false);

  const countryOptions = React.useMemo(
    () => getPhoneCountryOptions(i18n.language),
    [i18n.language]
  );

  const countryOptionMap = React.useMemo(
    () => new Map(countryOptions.map((option) => [option.code, option])),
    [countryOptions]
  );

  const selectedCountry = countryOptionMap.get(countryCode) || countryOptions[0];

  const placeholder = React.useMemo(() => {
    const exampleNumber = getExampleNumber(countryCode, mobileExamples);
    return exampleNumber?.formatNational() || '';
  }, [countryCode]);

  const handleCountryChange = (event: SelectChangeEvent<CountryCode>) => {
    const nextCountryCode = event.target.value as CountryCode;
    onCountryCodeChange(nextCountryCode);
    onValueChange(formatNationalPhoneInput(value, nextCountryCode));
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextState = getPhoneInputStateFromValue(event.target.value, countryCode);
    onCountryCodeChange(nextState.countryCode);
    onValueChange(nextState.phoneNumber);
  };

  const renderCountryValue = (selected: unknown) => {
    const option = countryOptionMap.get(selected as CountryCode) || selectedCountry;

    return (
      <Stack component="span" direction="row" spacing={0.75} alignItems="center">
        {option && <CountryFlag option={option} />}
        <Typography component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
          +{option?.callingCode}
        </Typography>
      </Stack>
    );
  };

  return (
    <Box sx={{ position: 'relative', pt: '8px' }}>
      <Typography
        component="label"
        htmlFor={inputId}
        sx={{
          position: 'absolute',
          top: 0,
          left: 12,
          zIndex: 1,
          px: 0.5,
          backgroundColor: 'background.paper',
          color: focused ? 'primary.main' : 'text.secondary',
          fontSize: 12,
          lineHeight: 1,
        }}
      >
        {label}
      </Typography>

      <Box
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(event) => {
          const relatedTarget = event.relatedTarget as Node | null;
          if (!relatedTarget || !event.currentTarget.contains(relatedTarget)) {
            setFocused(false);
          }
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          minHeight: 40,
          border: '1px solid',
          borderColor: focused ? 'primary.main' : 'primary.main',
          borderRadius: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          boxShadow: focused ? '0 0 0 1px currentColor' : 'none',
          color: focused ? 'primary.main' : 'transparent',
          opacity: disabled ? 0.62 : 1,
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
          },
        }}
      >
        <Select<CountryCode>
          value={countryCode}
          onChange={handleCountryChange}
          disabled={disabled}
          variant="standard"
          disableUnderline
          renderValue={renderCountryValue}
          inputProps={{ 'aria-label': 'Country calling code' }}
          MenuProps={{
            PaperProps: {
              sx: {
                mt: 1,
                maxHeight: 360,
                borderRadius: '10px',
              },
            },
          }}
          sx={{
            flexShrink: 0,
            width: { xs: 104, sm: 124 },
            pl: 1.5,
            color: 'text.primary',
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              py: 0,
              pr: '28px !important',
              minHeight: 38,
            },
            '& .MuiSelect-icon': {
              right: 2,
            },
          }}
        >
          {countryOptions.map((option: PhoneCountryOption) => (
            <MenuItem key={option.code} value={option.code} sx={{ gap: 1.5, minHeight: 44 }}>
              <CountryFlag option={option} />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" noWrap>
                  {option.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.code}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                +{option.callingCode}
              </Typography>
            </MenuItem>
          ))}
        </Select>

        <Divider orientation="vertical" flexItem sx={{ my: 0.75 }} />

        <InputBase
          id={inputId}
          type="tel"
          inputMode="tel"
          value={value}
          onChange={handlePhoneChange}
          disabled={disabled}
          placeholder={placeholder}
          sx={{
            flex: 1,
            minWidth: 0,
            px: 1.5,
            color: 'text.primary',
            '& input': {
              py: 1,
              fontSize: 16,
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default CountryPhoneInput;
