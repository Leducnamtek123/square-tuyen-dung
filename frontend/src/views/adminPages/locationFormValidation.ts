export type LocationParentField = 'city' | 'district';

export type LocationEntityFormValidationErrors = Partial<Record<
  'name' | 'code' | LocationParentField,
  string
>>;

export interface LocationEntityFormData {
  name?: string | null;
  code?: string | null;
  parentId?: string | number | null;
}

const isPositiveIntegerId = (value: string | number | null | undefined): boolean => {
  if (value === undefined || value === null || value === '') {
    return false;
  }

  const numericValue = Number(value);
  return Number.isInteger(numericValue) && numericValue > 0;
};

export const getLocationEntityFormValidationErrors = (
  formData: LocationEntityFormData,
  options?: { parentField?: LocationParentField },
): LocationEntityFormValidationErrors => {
  const errors: LocationEntityFormValidationErrors = {};
  const name = String(formData.name ?? '').trim();
  const code = String(formData.code ?? '').trim();

  if (!name) {
    errors.name = 'nameRequired';
  } else if (name.length > 255) {
    errors.name = 'nameMax';
  }

  if (!code) {
    errors.code = 'codeRequired';
  } else if (code.length > 20) {
    errors.code = 'codeMax';
  }

  if (options?.parentField) {
    if (formData.parentId === undefined || formData.parentId === null || formData.parentId === '') {
      errors[options.parentField] = 'parentRequired';
    } else if (!isPositiveIntegerId(formData.parentId)) {
      errors[options.parentField] = 'parentInvalid';
    }
  }

  return errors;
};
