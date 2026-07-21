type LocationId = string | number | null | undefined;

const isEmptyLocationId = (value: LocationId): boolean =>
  value === undefined || value === null || value === '';

export const shouldResetChildLocationValue = (
  previousParentId: LocationId,
  nextParentId: LocationId,
): boolean => {
  if (isEmptyLocationId(previousParentId)) {
    return false;
  }

  if (isEmptyLocationId(nextParentId)) {
    return true;
  }

  return String(previousParentId) !== String(nextParentId);
};
