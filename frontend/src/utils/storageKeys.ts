const STORAGE_KEY_VERSION = 'v1';

export const ACTIVE_WORKSPACE_STORAGE_KEY = `active_workspace:${STORAGE_KEY_VERSION}`;
export const LEGACY_ACTIVE_WORKSPACE_STORAGE_KEY = 'active_workspace';

export const VERIFY_EMAIL_STORAGE_KEY = `verifyEmail:${STORAGE_KEY_VERSION}`;
export const LEGACY_VERIFY_EMAIL_STORAGE_KEY = 'verifyEmail';

export const PROJECT_SEARCH_HISTORY_STORAGE_KEY = `project_search_history:${STORAGE_KEY_VERSION}`;
export const LEGACY_PROJECT_SEARCH_HISTORY_STORAGE_KEY = 'project_search_history';

export const RECENT_SEARCH_STORAGE_KEY = `recentSearch:${STORAGE_KEY_VERSION}`;
export const LEGACY_RECENT_SEARCH_STORAGE_KEY = 'recentSearch';

const readStorageValue = (key: string): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorageValue = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors in privacy-restricted environments.
  }
};

export const readVersionedJson = <T>(
  key: string,
  legacyKeys: string[] = [],
): T | null => {
  const raw = readStorageValue(key) ?? legacyKeys.map((legacyKey) => readStorageValue(legacyKey)).find(Boolean) ?? null;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const writeVersionedJson = (key: string, value: unknown): void => {
  writeStorageValue(key, JSON.stringify(value));
};
