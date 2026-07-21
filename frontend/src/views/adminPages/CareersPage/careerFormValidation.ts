export interface CareerFormValidationData {
  name?: string | null;
}

export type CareerFormValidationErrors = Partial<Record<'name', string>>;

export const getCareerFormValidationErrors = (
  formData: CareerFormValidationData,
): CareerFormValidationErrors => {
  const errors: CareerFormValidationErrors = {};
  const name = String(formData.name ?? '').trim();

  if (!name) {
    errors.name = 'nameRequired';
  } else if (name.length > 150) {
    errors.name = 'nameMax';
  }

  return errors;
};
