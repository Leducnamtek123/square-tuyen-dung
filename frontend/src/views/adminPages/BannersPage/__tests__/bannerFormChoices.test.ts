import {
  getBannerFormValidationErrors,
  normalizeBannerFormChoices,
  type BannerFormData,
} from '../bannerFormChoices';
import fs from 'fs';
import path from 'path';

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
  const choiceOptions = {
    platformOptions: [
      { value: 'WEB', label: 'Website' },
      { value: 'APP', label: 'Application' },
    ],
    typeOptions: [
      { value: 10, label: 'Home' },
    ],
    descriptionLocations: [
      { value: 1, label: 'Top left' },
      { value: 3, label: 'Bottom left' },
    ],
  };

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

  it('rejects banner fields that backend model and serializer would reject', () => {
    expect(
      getBannerFormValidationErrors({
        ...baseFormData,
        description: 'D'.repeat(101),
        button_text: 'B'.repeat(21),
        button_link: 'not-a-url',
      }),
    ).toEqual({
      description: 'descriptionMax',
      button_text: 'buttonTextMax',
      button_link: 'buttonLinkInvalid',
    });
  });

  it('rejects stale choices before submitting banner payload', () => {
    expect(
      getBannerFormValidationErrors(
        {
          ...baseFormData,
          platform: 'MOBILE',
          type: 999,
          description_location: 99,
        },
        choiceOptions,
      ),
    ).toEqual({
      platform: 'platformInvalid',
      type: 'typeInvalid',
      description_location: 'descriptionLocationInvalid',
    });
  });

  it('wires validation into the banner form dialog', () => {
    const dialogSource = fs.readFileSync(path.join(__dirname, '../BannerFormDialog.tsx'), 'utf8');
    const pageSource = fs.readFileSync(path.join(__dirname, '../index.tsx'), 'utf8');

    expect(dialogSource).toContain('getBannerFormValidationErrors');
    expect(dialogSource).toContain("getBannerValidationText('description')");
    expect(dialogSource).toContain("getBannerValidationText('button_text')");
    expect(dialogSource).toContain("getBannerValidationText('button_link')");
    expect(dialogSource).toContain("getBannerValidationText('platform')");
    expect(dialogSource).toContain("getBannerValidationText('type')");
    expect(dialogSource).toContain("getBannerValidationText('description_location')");
    expect(dialogSource).toContain('disabled={isMutating || hasValidationErrors}');
    expect(pageSource).toContain('getBannerValidationMessage');
  });
});
