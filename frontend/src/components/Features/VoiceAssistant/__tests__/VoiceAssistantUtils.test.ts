import { getSandboxTokenSource, getStyles, cn } from '../utils';
import type { AppConfig } from '../app-config';
import { APP_CONFIG_DEFAULTS } from '../app-config';

describe('VoiceAssistant utils', () => {
  const originalEnv = process.env;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    originalFetch = global.fetch;
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  describe('cn and getStyles', () => {
    it('merges class names properly', () => {
      expect(cn('px-2 py-1', 'bg-blue-500', undefined, false && 'hidden')).toContain('px-2');
    });

    it('generates css variables from app config', () => {
      const config: AppConfig = {
        ...APP_CONFIG_DEFAULTS,
        accent: '#123456',
        accentDark: '#654321',
      };
      const styles = getStyles(config);
      expect(styles).toContain('--primary: #123456');
      expect(styles).toContain('--primary: #654321');
    });

    it('returns empty string when no accents defined', () => {
      const config: AppConfig = {
        ...APP_CONFIG_DEFAULTS,
        accent: undefined,
        accentDark: undefined,
      };
      expect(getStyles(config)).toBe('');
    });
  });

  describe('getSandboxTokenSource', () => {
    it('uses custom NEXT_PUBLIC_CONN_DETAILS_ENDPOINT when env is provided', async () => {
      process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT = '/api/custom-livekit-token/';
      const mockConnectionDetails = {
        server_url: 'wss://livekit.example.com',
        participant_token: 'custom-participant-jwt',
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockConnectionDetails,
      } as Response);

      const tokenSource = getSandboxTokenSource({
        ...APP_CONFIG_DEFAULTS,
        sandboxId: 'sb-12345',
        agentName: 'recruiter-bot',
      });

      // TokenSource.custom returns an object with fetcher function
      const fetcher = (tokenSource as any).fetcher || (tokenSource as any).options?.fetcher || tokenSource;
      const result = typeof fetcher === 'function' ? await fetcher() : await (tokenSource as any).fetch();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/custom-livekit-token/'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Sandbox-Id': 'sb-12345',
          }),
          body: JSON.stringify({
            room_config: { agents: [{ agent_name: 'recruiter-bot' }] },
          }),
        })
      );
      expect(result).toEqual({
        serverUrl: 'wss://livekit.example.com',
        participantToken: 'custom-participant-jwt',
      });
    });

    it('falls back safely to default backend sandbox-token endpoint when env is missing', async () => {
      delete process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT;
      const mockConnectionDetails = {
        server_url: 'wss://livekit.example.com',
        participant_token: 'default-fallback-jwt',
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockConnectionDetails,
      } as Response);

      const tokenSource = getSandboxTokenSource({
        ...APP_CONFIG_DEFAULTS,
        sandboxId: '',
      });

      const fetcher = (tokenSource as any).fetcher || (tokenSource as any).options?.fetcher || tokenSource;
      const result = typeof fetcher === 'function' ? await fetcher() : await (tokenSource as any).fetch();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/interview/web/sessions/sandbox-token/'),
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result).toEqual({
        serverUrl: 'wss://livekit.example.com',
        participantToken: 'default-fallback-jwt',
      });
    });

    it('throws error when connection details request returns HTTP error (401/500)', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response);

      const tokenSource = getSandboxTokenSource(APP_CONFIG_DEFAULTS);
      const fetcher = (tokenSource as any).fetcher || (tokenSource as any).options?.fetcher || tokenSource;

      await expect(typeof fetcher === 'function' ? fetcher() : (tokenSource as any).fetch()).rejects.toThrow(
        'Error fetching connection details!'
      );
    });

    it('handles network failure without unhandled rejection or TypeError', async () => {
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network disconnected'));

      const tokenSource = getSandboxTokenSource(APP_CONFIG_DEFAULTS);
      const fetcher = (tokenSource as any).fetcher || (tokenSource as any).options?.fetcher || tokenSource;

      await expect(typeof fetcher === 'function' ? fetcher() : (tokenSource as any).fetch()).rejects.toThrow(
        'Error fetching connection details!'
      );
    });
  });
});
