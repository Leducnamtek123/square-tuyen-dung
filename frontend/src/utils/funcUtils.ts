import toSlug from './customData';
import { APP_NAME } from '../configs/constants';
import { localizeRoutePath } from '../configs/routeLocalization';

const downloadPdf = async (url: string, fileName?: string): Promise<void> => {
  const fileDownloadName = `${APP_NAME}_CV-${toSlug(fileName || 'mytitle')}`;
  const response = await fetch(url);
  const blob = await response.blob();
  const urlBlob = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');
  link.href = urlBlob;
  link.setAttribute('download', `${fileDownloadName}.pdf`);
  document.body.appendChild(link);
  link.click();
  if (link.parentNode) {
    link.parentNode.removeChild(link);
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
