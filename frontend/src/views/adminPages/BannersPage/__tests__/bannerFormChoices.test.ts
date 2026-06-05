import {
  getBannerFormValidationErrors,
  normalizeBannerFormChoices,
  type BannerFormData,
} from '../bannerFormChoices';

const baseFormData: BannerFormData = {
  description: 'Hero banner',
  button_text: 'Apply',
  button_link: 'https://square.vn',
  is_show_button: true,
  is_active: true,
  platform: 'WEB',
  type: 10,
  description_location: 1,
};

describe('normalizeBannerFormChoices', () => {
  const choiceOptions = {
    platformOptions: [
      { value: 'WEB', label: 'Website' },
      { value: 'APP', label: 'Application' },
    ],
    typeOptions: [
      { value: 10, label: 'Home' },
      { value: 20, label: 'Job right' },
    ],
    descriptionLocations: [
      { value: 1, label: 'Top left' },
      { value: 3, label: 'Bottom left' },
    ],
  };

  it('preserves choices that still exist in the current options', () => {
    expect(normalizeBannerFormChoices(baseFormData, choiceOptions)).toEqual(baseFormData);
  });

  it('falls back to the first current option for stale choice values', () => {
    const staleFormData: BannerFormData = {
      ...baseFormData,
      platform: 'MOBILE',
      type: 999,
      description_location: 99,
    };

    expect(normalizeBannerFormChoices(staleFormData, choiceOptions)).toEqual({
      ...staleFormData,
      platform: 'WEB',
      type: 10,
      description_location: 1,
    });
  });
});

describe('getBannerFormValidationErrors', () => {
  it('allows an empty button link because the field is optional', () => {
    expect(
      getBannerFormValidationErrors({
        ...baseFormData,
        button_link: '',
      }),
    ).toEqual({});
  });

  it('rejects an invalid button link before submitting to the API', () => {
    expect(
      getBannerFormValidationErrors({
        ...baseFormData,
        button_link: 'not-a-url',
      }),
    ).toEqual({
      button_link: 'buttonLinkInvalid',
    });
  });

  it('accepts a valid http or https button link', () => {
    expect(
      getBannerFormValidationErrors({
        ...baseFormData,
        button_link: 'https://tuyendung.square.vn/jobs',
      }),
    ).toEqual({});
  });
});
