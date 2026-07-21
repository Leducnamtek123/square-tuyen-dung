export type BannerFormData = {
  description: string;
  button_text: string;
  button_link: string;
  is_show_button: boolean;
  is_active: boolean;
  platform: string;
  type: number;
  description_location: number;
};

export type BannerChoiceOption = {
  value: string | number;
  label: string;
  webAspectRatio?: string;
};

type BannerChoiceOptions = {
  platformOptions: BannerChoiceOption[];
  typeOptions: BannerChoiceOption[];
  descriptionLocations: BannerChoiceOption[];
};

export type BannerFormValidationErrors = Partial<Record<
  'description' | 'button_text' | 'button_link' | 'platform' | 'type' | 'description_location',
  string
>>;

const hasOptionValue = (options: BannerChoiceOption[], value: string | number) =>
  options.some((option) => String(option.value) === String(value));

const firstStringValue = (options: BannerChoiceOption[], fallback: string) => {
  if (!options.length) return fallback;
  return String(options[0].value);
};

const firstNumberValue = (options: BannerChoiceOption[], fallback: number) => {
  if (!options.length) return fallback;
  const firstValue = Number(options[0].value);
  return Number.isFinite(firstValue) ? firstValue : fallback;
};

export const normalizeBannerFormChoices = (
  formData: BannerFormData,
  options: BannerChoiceOptions,
): BannerFormData => ({
  ...formData,
  platform: hasOptionValue(options.platformOptions, formData.platform)
    ? formData.platform
    : firstStringValue(options.platformOptions, formData.platform),
  type: hasOptionValue(options.typeOptions, formData.type)
    ? formData.type
    : firstNumberValue(options.typeOptions, formData.type),
  description_location: hasOptionValue(
    options.descriptionLocations,
    formData.description_location,
  )
    ? formData.description_location
    : firstNumberValue(
      options.descriptionLocations,
      formData.description_location,
    ),
});

const isValidHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const getBannerFormValidationErrors = (
  formData: BannerFormData,
  options?: BannerChoiceOptions,
): BannerFormValidationErrors => {
  const errors: BannerFormValidationErrors = {};
  const description = formData.description.trim();
  const buttonText = formData.button_text.trim();
  const buttonLink = formData.button_link.trim();

  if (description.length > 100) {
    errors.description = 'descriptionMax';
  }

  if (buttonText.length > 20) {
    errors.button_text = 'buttonTextMax';
  }

  if (buttonLink && !isValidHttpUrl(buttonLink)) {
    errors.button_link = 'buttonLinkInvalid';
  }

  if (options) {
    if (!hasOptionValue(options.platformOptions, formData.platform)) {
      errors.platform = 'platformInvalid';
    }

    if (!hasOptionValue(options.typeOptions, formData.type)) {
      errors.type = 'typeInvalid';
    }

    if (!hasOptionValue(options.descriptionLocations, formData.description_location)) {
      errors.description_location = 'descriptionLocationInvalid';
    }
  }

  return errors;
};
