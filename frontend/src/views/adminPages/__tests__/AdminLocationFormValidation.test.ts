import fs from 'fs';
import path from 'path';

import {
  getLocationEntityFormValidationErrors,
  type LocationEntityFormData,
} from '../locationFormValidation';

const validFormData: LocationEntityFormData = {
  name: 'Ho Chi Minh City',
  code: 'HCM',
};

describe('getLocationEntityFormValidationErrors', () => {
  it('accepts values that match the backend location model contract', () => {
    expect(getLocationEntityFormValidationErrors(validFormData)).toEqual({});
    expect(
      getLocationEntityFormValidationErrors({
        ...validFormData,
        parentId: 1,
      }),
    ).toEqual({});
  });

  it('rejects missing or overlong location name and code before submitting', () => {
    expect(
      getLocationEntityFormValidationErrors({
        name: '   ',
        code: '   ',
      }),
    ).toEqual({
      name: 'nameRequired',
      code: 'codeRequired',
    });

    expect(
      getLocationEntityFormValidationErrors({
        name: 'A'.repeat(256),
        code: 'B'.repeat(21),
      }),
    ).toEqual({
      name: 'nameMax',
      code: 'codeMax',
    });
  });

  it('rejects missing or invalid parent IDs for district and ward forms', () => {
    expect(
      getLocationEntityFormValidationErrors(validFormData, {
        parentField: 'city',
      }),
    ).toEqual({
      city: 'parentRequired',
    });

    expect(
      getLocationEntityFormValidationErrors(
        {
          ...validFormData,
          parentId: 0,
        },
        {
          parentField: 'district',
        },
      ),
    ).toEqual({
      district: 'parentInvalid',
    });

    expect(
      getLocationEntityFormValidationErrors(
        {
          ...validFormData,
          parentId: 1.5,
        },
        {
          parentField: 'district',
        },
      ),
    ).toEqual({
      district: 'parentInvalid',
    });
  });

  it('wires validation into all admin location dialogs', () => {
    const pages = [
      '../CitiesPage/index.tsx',
      '../DistrictsPage/index.tsx',
      '../WardsPage/index.tsx',
    ].map((relativePath) => fs.readFileSync(path.join(__dirname, relativePath), 'utf8'));

    for (const pageSource of pages) {
      expect(pageSource).toContain('getLocationEntityFormValidationErrors');
      expect(pageSource).toContain('hasValidationErrors');
      expect(pageSource).toContain("getLocationValidationText('name')");
      expect(pageSource).toContain("getLocationValidationText('code')");
      expect(pageSource).toContain('disabled={isMutating || hasValidationErrors}');
    }

    expect(pages[1]).toContain("getLocationValidationText('city')");
    expect(pages[2]).toContain("getLocationValidationText('district')");
  });
});
