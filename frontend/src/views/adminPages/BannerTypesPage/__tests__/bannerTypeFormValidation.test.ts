import fs from 'fs';
import path from 'path';

import {
  getBannerTypeFormValidationErrors,
  type BannerTypeFormData,
} from '../bannerTypeFormValidation';

const validFormData: BannerTypeFormData = {
  code: 'HOME_MAIN',
  name: 'Home main banner',
  value: 10,
  web_aspect_ratio: '16:5',
  mobile_aspect_ratio: '1:1',
  is_active: true,
};

describe('getBannerTypeFormValidationErrors', () => {
  it('accepts values that match the backend BannerType model contract', () => {
    expect(getBannerTypeFormValidationErrors(validFormData)).toEqual({});
  });

  it('rejects missing or overlong code and name before submitting', () => {
    expect(
      getBannerTypeFormValidationErrors({
        ...validFormData,
        code: '   ',
        name: '   ',
      }),
    ).toEqual({
      code: 'codeRequired',
      name: 'nameRequired',
    });

    expect(
      getBannerTypeFormValidationErrors({
        ...validFormData,
        code: 'A'.repeat(51),
        name: 'B'.repeat(101),
      }),
    ).toEqual({
      code: 'codeMax',
      name: 'nameMax',
    });
  });

  it('rejects non-positive or non-integer values and overlong aspect ratios', () => {
    expect(
      getBannerTypeFormValidationErrors({
        ...validFormData,
        value: 1.5,
        web_aspect_ratio: '1'.repeat(21),
        mobile_aspect_ratio: '2'.repeat(21),
      }),
    ).toEqual({
      value: 'valueInteger',
      web_aspect_ratio: 'aspectRatioMax',
      mobile_aspect_ratio: 'aspectRatioMax',
    });

    expect(
      getBannerTypeFormValidationErrors({
        ...validFormData,
        value: 0,
      }),
    ).toEqual({
      value: 'valuePositive',
    });
  });

  it('wires validation errors into the Banner Types dialog fields', () => {
    const pageSource = fs.readFileSync(
      path.join(__dirname, '../index.tsx'),
      'utf8',
    );

    expect(pageSource).toContain('getBannerTypeFormValidationErrors');
    expect(pageSource).toContain('hasValidationErrors');
    expect(pageSource).toContain("getValidationText('code')");
    expect(pageSource).toContain("getValidationText('value')");
    expect(pageSource).toContain("getValidationText('web_aspect_ratio')");
    expect(pageSource).toContain("getValidationText('mobile_aspect_ratio')");
  });
});
