import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  parseIncompletePhoneNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js';

export const DEFAULT_PHONE_COUNTRY: CountryCode = 'VN';

export type PhoneCountryOption = {
  code: CountryCode;
  name: string;
  callingCode: string;
};

export const getPhoneCountryOptions = (language?: string): PhoneCountryOption[] => {
  let regionNames: Intl.DisplayNames | null = null;

  try {
    regionNames = new Intl.DisplayNames([language || 'vi'], { type: 'region' });
  } catch {
    regionNames = null;
  }

  return getCountries()
    .map((code) => ({
      code,
      name: regionNames?.of(code) || code,
      callingCode: getCountryCallingCode(code),
    }))
    .sort((a, b) => {
      if (a.code === DEFAULT_PHONE_COUNTRY) return -1;
      if (b.code === DEFAULT_PHONE_COUNTRY) return 1;
      return a.name.localeCompare(b.name, language || 'vi', { sensitivity: 'base' });
    });
};

export const formatNationalPhoneInput = (value: string, countryCode: CountryCode): string => {
  if (!value || typeof value !== 'string') return '';
  const safeCountryCode = countryCode || DEFAULT_PHONE_COUNTRY;
  const parsedInput = parseIncompletePhoneNumber(value);

  if (!parsedInput || parsedInput === '+') {
    return parsedInput || '';
  }

  if (parsedInput.startsWith('+')) {
    const parsedNumber = parsePhoneNumberFromString(parsedInput);

    if (parsedNumber?.country) {
      return new AsYouType(parsedNumber.country).input(parsedNumber.nationalNumber);
    }

    return parsedInput;
  }

  return new AsYouType(safeCountryCode).input(parsedInput);
};

export const getPhoneInputStateFromValue = (
  value: string,
  currentCountryCode: CountryCode
): { countryCode: CountryCode; phoneNumber: string } => {
  const safeCountryCode = currentCountryCode || DEFAULT_PHONE_COUNTRY;
  if (!value || typeof value !== 'string') {
    return { countryCode: safeCountryCode, phoneNumber: '' };
  }
  const parsedInput = parseIncompletePhoneNumber(value);

  if (parsedInput.startsWith('+')) {
    const parsedNumber = parsePhoneNumberFromString(parsedInput);
    const nextCountryCode = parsedNumber?.country || safeCountryCode;

    return {
      countryCode: nextCountryCode,
      phoneNumber: parsedNumber?.country
        ? formatNationalPhoneInput(parsedNumber.nationalNumber, nextCountryCode)
        : parsedInput,
    };
  }

  return {
    countryCode: safeCountryCode,
    phoneNumber: formatNationalPhoneInput(parsedInput, safeCountryCode),
  };
};

export const toE164PhoneNumber = (value: string, countryCode: CountryCode): string | null => {
  if (!value || typeof value !== 'string') return null;
  const safeCountryCode = countryCode || DEFAULT_PHONE_COUNTRY;
  const parsedInput = parseIncompletePhoneNumber(value);

  if (!parsedInput || parsedInput === '+') {
    return null;
  }

  const parsedNumber = parsePhoneNumberFromString(parsedInput, safeCountryCode);

  if (!parsedNumber?.isPossible()) {
    return null;
  }

  return parsedNumber.number;
};
