export interface BannerTypeFormData {
  code: string;
  name: string;
  value: number;
  web_aspect_ratio: string;
  mobile_aspect_ratio: string;
  is_active: boolean;
}

export type BannerTypeFormValidationErrors = Partial<Record<
  'code' | 'name' | 'value' | 'web_aspect_ratio' | 'mobile_aspect_ratio',
  string
>>;

export const getBannerTypeFormValidationErrors = (
  formData: BannerTypeFormData,
): BannerTypeFormValidationErrors => {
  const errors: BannerTypeFormValidationErrors = {};
  const code = formData.code.trim();
  const name = formData.name.trim();
  const value = Number(formData.value);
  const webAspectRatio = formData.web_aspect_ratio.trim();
  const mobileAspectRatio = formData.mobile_aspect_ratio.trim();

  if (!code) {
    errors.code = 'codeRequired';
  } else if (code.length > 50) {
    errors.code = 'codeMax';
  }

  if (!name) {
    errors.name = 'nameRequired';
  } else if (name.length > 100) {
    errors.name = 'nameMax';
  }

  if (!Number.isInteger(value)) {
    errors.value = 'valueInteger';
  } else if (value <= 0) {
    errors.value = 'valuePositive';
  }

  if (webAspectRatio.length > 20) {
    errors.web_aspect_ratio = 'aspectRatioMax';
  }

  if (mobileAspectRatio.length > 20) {
    errors.mobile_aspect_ratio = 'aspectRatioMax';
  }

  return errors;
};
