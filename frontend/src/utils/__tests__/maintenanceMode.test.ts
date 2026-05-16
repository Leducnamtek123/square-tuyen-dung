import {
  getMaintenanceModeDetail,
  isMaintenanceModeError,
} from '../maintenanceMode';

const axiosError = (status: number, data: unknown) => ({
  isAxiosError: true,
  response: {
    status,
    data,
    headers: {},
  },
});

describe('maintenanceMode utilities', () => {
  it('detects maintenance mode from error payload', () => {
    const error = axiosError(503, {
      error: {
        code: 'MAINTENANCE_MODE',
        message: 'System is under maintenance.',
      },
    });

    expect(isMaintenanceModeError(error)).toBe(true);
    expect(getMaintenanceModeDetail(error)).toEqual({
      code: 'MAINTENANCE_MODE',
      message: 'System is under maintenance.',
      status: 503,
      retryAfter: null,
    });
  });

  it('ignores generic 503 responses', () => {
    const error = axiosError(503, {
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Service unavailable.',
      },
    });

    expect(isMaintenanceModeError(error)).toBe(false);
  });
});
