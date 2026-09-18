import toSlug from './customData';
import { APP_NAME } from '../configs/constants';
import { localizeRoutePath } from '../configs/routeLocalization';

export const downloadPdf = async (url: string, fileName?: string): Promise<void> => {
  if (!url || typeof window === 'undefined') return;
  const rawBaseName = fileName || 'Square_CV';
  const cleanBaseName = toSlug(rawBaseName.replace(/\.pdf$/i, ''));
  const fileDownloadName = `${APP_NAME}_CV-${cleanBaseName || 'document'}.pdf`;

  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    const urlBlob = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = urlBlob;
    link.download = fileDownloadName;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      window.URL.revokeObjectURL(urlBlob);
    }, 250);
  } catch (err) {
    console.warn('[downloadPdf] Direct blob fetch failed (likely CORS), falling back to download anchor:', err);
    // Fallback: create temporary direct download anchor
    const link = document.createElement('a');
    link.href = url;
    link.download = fileDownloadName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    }, 250);
  }
};

export const formatRoute = (
  route: string,
  value: string,
  paramKey = ':slug'
): string => {
  const regex = new RegExp(`${paramKey}`, 'g');
  const builtRoute = route.replace(regex, value);

  if (typeof window === 'undefined') {
    return builtRoute;
  }

  const language = window.localStorage?.getItem('i18nextLng') || 'vi';
  return localizeRoutePath(builtRoute, language);
};

const buildURL = (hostname: string): string => {
  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : '';
  return `${protocol}//${hostname}${port}`;
};

export default downloadPdf;
