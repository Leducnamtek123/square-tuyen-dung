import { clsx } from 'clsx';
import { TokenSource } from 'livekit-client';
import { twMerge } from 'tailwind-merge';
import { APP_CONFIG_DEFAULTS } from '@/voice-ai/app-config';

export const CONFIG_ENDPOINT = import.meta.env.VITE_APP_CONFIG_ENDPOINT;
export const SANDBOX_ID = import.meta.env.VITE_SANDBOX_ID;

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Get the app configuration
 * @param headers - The headers of the request
 * @returns The app configuration
 *
 * @note React will invalidate the cache for all memoized functions for each server request.
 * https://react.dev/reference/react/cache#caveats
 */
export const getAppConfig = async (headers) => {
  if (CONFIG_ENDPOINT) {
    const sandboxId = SANDBOX_ID ?? headers.get('x-sandbox-id') ?? '';

    try {
      if (!sandboxId) {
        throw new Error('Sandbox ID is required');
      }

      const response = await fetch(CONFIG_ENDPOINT, {
        cache: 'no-store',
        headers: { 'X-Sandbox-ID': sandboxId },
      });

      if (response.ok) {
        const remoteConfig = await response.json();

        const config = { ...APP_CONFIG_DEFAULTS, sandboxId };

        for (const [key, entry] of Object.entries(remoteConfig)) {
          if (entry === null) continue;
          // Only include app config entries that are declared in defaults and, if set,
          // share the same primitive type as the default value.
          if (
            (key in APP_CONFIG_DEFAULTS && APP_CONFIG_DEFAULTS[key] === undefined) ||
            (typeof config[key] === entry.type && typeof config[key] === typeof entry.value)
          ) {
            config[key] = entry.value;
          }
        }

        return config;
      } else {
        console.error(
          `ERROR: querying config endpoint failed with status ${response.status}: ${response.statusText}`
        );
      }
    } catch (error) {
      console.error('ERROR: getAppConfig() - lib/utils.jsx', error);
    }
  }

  return APP_CONFIG_DEFAULTS;
};

/**
 * Get styles for the app
 * @param appConfig - The app configuration
 * @returns A string of styles
 */
export function getStyles(appConfig) {
  const { accent, accentDark } = appConfig;

  return [
    accent
      ? `:root { --primary: ${accent}; --primary-hover: color-mix(in srgb, ${accent} 80%, #000); }`
      : '',
    accentDark
      ? `.dark { --primary: ${accentDark}; --primary-hover: color-mix(in srgb, ${accentDark} 80%, #000); }`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Get a token source for a sandboxed LiveKit session
 * @param appConfig - The app configuration
 * @returns A token source for a sandboxed LiveKit session
 */
export function getSandboxTokenSource(appConfig) {
  return TokenSource.custom(async () => {
    const connDetailsEndpoint = import.meta.env.VITE_CONN_DETAILS_ENDPOINT;
    if (!connDetailsEndpoint) {
      throw new Error('Missing VITE_CONN_DETAILS_ENDPOINT');
    }
    const url = new URL(connDetailsEndpoint, window.location.origin);
    const sandboxId = appConfig.sandboxId ?? '';
    const roomConfig = appConfig.agentName
      ? {
        agents: [{ agent_name: appConfig.agentName }],
      }
      : undefined;

    try {
      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sandbox-Id': sandboxId,
        },
        body: JSON.stringify({
          room_config: roomConfig,
        }),
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(`Conn details failed (${res.status}): ${message}`);
      }
      return await res.json();
    } catch (error) {
      console.error('Error fetching connection details:', error);
      throw new Error('Error fetching connection details!');
    }
  });
}
