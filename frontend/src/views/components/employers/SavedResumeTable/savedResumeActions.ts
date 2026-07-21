type SavedResumeActionInput = {
  resumeSlug?: string | null;
  resume?: {
    slug?: string | null;
  } | null;
};

const normalizeSlug = (value: string | null | undefined): string => String(value || '').trim();

export const getSavedResumeActionState = (row: SavedResumeActionInput) => {
  const slug = normalizeSlug(row.resume?.slug) || normalizeSlug(row.resumeSlug);

  return {
    slug,
    canView: Boolean(slug),
    canUnsave: Boolean(slug),
  };
};
