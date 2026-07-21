const SAFE_EXTERNAL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const SAFE_RESOURCE_PROTOCOLS = new Set(['http:', 'https:', 'blob:']);

const getSafeUrl = (
  value: string | null | undefined,
  allowedProtocols: Set<string>,
  options: { allowHashOnly?: boolean } = {}
): string | undefined => {
  const trimmedValue = value?.trim();
  if (!trimmedValue) return undefined;
  if (!options.allowHashOnly && trimmedValue.startsWith('#')) return undefined;

  const compactValue = trimmedValue.replace(/[\u0000-\u001F\u007F\s]+/g, '').toLowerCase();
  const protocolMatch = compactValue.match(/^([a-z][a-z0-9+.-]*:)/);
  if (protocolMatch && !allowedProtocols.has(protocolMatch[1])) {
    return undefined;
  }

  return trimmedValue;
};

export const getSafeExternalOpenUrl = (value: string | null | undefined): string | undefined =>
  getSafeUrl(value, SAFE_EXTERNAL_PROTOCOLS, { allowHashOnly: true });

export const getSafeResourceUrl = (value: string | null | undefined): string | undefined =>
  getSafeUrl(value, SAFE_RESOURCE_PROTOCOLS);

export const openExternalUrlSafely = (
  value: string | null | undefined,
  target = '_blank'
): boolean => {
  const safeUrl = getSafeExternalOpenUrl(value);
  if (!safeUrl || typeof window === 'undefined') return false;

  window.open(safeUrl, target, 'noopener,noreferrer');
  return true;
};

export const openResourceUrlSafely = (
  value: string | null | undefined,
  target = '_blank'
): boolean => {
  const safeUrl = getSafeResourceUrl(value);
  if (!safeUrl || typeof window === 'undefined') return false;

  window.open(safeUrl, target, 'noopener,noreferrer');
  return true;
};
