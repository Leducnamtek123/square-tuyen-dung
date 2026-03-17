import axios from 'axios';
import tokenService from '../services/tokenService';

const isPresigned = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('X-Amz-Signature=') || url.includes('X-Amz-Algorithm=');
};

const isMinioPublicUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('/minio/');
};

const getBaseUrl = () => {
  return import.meta.env.VITE_API_BASE || '/api/';
};

const unwrapResponse = (response) => response?.data?.data ?? response?.data;

const requestPresign = async (url) => {
  const accessToken = tokenService.getAccessTokenFromCookie();
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  const response = await axios.get(`${getBaseUrl()}common/presign/`, {
    params: { url },
    headers,
    withCredentials: true,
  });
  const data = unwrapResponse(response);
  return data?.url || null;
};

export const ensurePresignedUrl = async (url) => {
  if (!url || !isMinioPublicUrl(url) || isPresigned(url)) {
    return url;
  }

  try {
    const presigned = await requestPresign(url);
    return presigned || url;
  } catch {
    return url;
  }
};

export const presignInObject = async (value, maxItems = 200) => {
  let count = 0;

  const walk = async (node) => {
    if (!node || count >= maxItems) return;
    if (typeof node === 'string') {
      if (isMinioPublicUrl(node) && !isPresigned(node)) {
        count += 1;
        return ensurePresignedUrl(node);
      }
      return node;
    }
    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i += 1) {
        if (count >= maxItems) break;
        const updated = await walk(node[i]);
        if (typeof updated === 'string') node[i] = updated;
      }
      return node;
    }
    if (typeof node === 'object') {
      const keys = Object.keys(node);
      for (let i = 0; i < keys.length; i += 1) {
        if (count >= maxItems) break;
        const key = keys[i];
        const updated = await walk(node[key]);
        if (typeof updated === 'string') node[key] = updated;
      }
      return node;
    }
    return node;
  };

  await walk(value);
  return value;
};
