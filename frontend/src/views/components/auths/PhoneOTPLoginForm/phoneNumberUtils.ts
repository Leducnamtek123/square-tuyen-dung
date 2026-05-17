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
  const parsedInput = parseIncompletePhoneNumber(value);

  if (!parsedInput || parsedInput === '+') {
    return parsedInput;
  }

  if (parsedInput.startsWith('+')) {
    const parsedNumber = parsePhoneNumberFromString(parsedInput);

    if (parsedNumber?.country) {
      return new AsYouType(parsedNumber.country).input(parsedNumber.nationalNumber);
    }

    return parsedInput;
  }

  return new AsYouType(countryCode).input(parsedInput);
};

export const getPhoneInputStateFromValue = (
  value: string,
  currentCountryCode: CountryCode
): { countryCode: CountryCode; phoneNumber: string } => {
  const parsedInput = parseIncompletePhoneNumber(value);

  if (parsedInput.startsWith('+')) {
    const parsedNumber = parsePhoneNumberFromString(parsedInput);
    const nextCountryCode = parsedNumber?.country || currentCountryCode;

    return {
      countryCode: nextCountryCode,
      phoneNumber: parsedNumber?.country
        ? formatNationalPhoneInput(parsedNumber.nationalNumber, nextCountryCode)
        : parsedInput,
    };
  }

  return {
    countryCode: currentCountryCode,
    phoneNumber: formatNationalPhoneInput(parsedInput, currentCountryCode),
  };
};

export const toE164PhoneNumber = (value: string, countryCode: CountryCode): string | null => {
  const parsedInput = parseIncompletePhoneNumber(value);

  if (!parsedInput || parsedInput === '+') {
    return null;
  }

  const parsedNumber = parsePhoneNumberFromString(parsedInput, countryCode);

  if (!parsedNumber?.isPossible()) {
    return null;
  }

  return parsedNumber.number;
};
