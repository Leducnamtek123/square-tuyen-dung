import httpRequest from '../utils/httpRequest';

export type FPTGpuServiceStatus = 'online' | 'offline' | 'not_configured';

export type FPTGpuHealthCheck = {
  status: FPTGpuServiceStatus;
  latencyMs?: number | null;
  statusCode?: number;
  workers?: number;
  error?: string;
};

export type FPTGpuControlStatus = {
  container: {
    name?: string;
    containerId?: string;
    tenantId?: string;
    region?: string;
    consoleUrl?: string;
    status?: string;
    statusSource?: string;
    billing?: {
      runningHourlyVnd?: number;
      stoppedHourlyVnd?: number;
    };
  };
  control: {
    available: boolean;
    configured: boolean;
    error?: string;
  };
  bootstrap?: {
    configured: boolean;
  };
  ai: {
    status: 'ready' | 'degraded';
    checks: Record<string, FPTGpuHealthCheck>;
  };
};

export type FPTGpuActionResponse = {
  action: 'START' | 'STOP' | 'RESTART' | 'BOOTSTRAP' | 'START_BOOTSTRAP';
  result?: unknown;
};

const fptGpuService = {
  getStatus: (): Promise<FPTGpuControlStatus> => {
    return httpRequest.get<FPTGpuControlStatus>('ai/gpu-control/');
  },

  start: (): Promise<FPTGpuActionResponse> => {
    return httpRequest.post<FPTGpuActionResponse>('ai/gpu-control/start/');
  },

  stop: (): Promise<FPTGpuActionResponse> => {
    return httpRequest.post<FPTGpuActionResponse>('ai/gpu-control/stop/');
  },

  bootstrap: (): Promise<FPTGpuActionResponse> => {
    return httpRequest.post<FPTGpuActionResponse>('ai/gpu-control/bootstrap/');
  },

  startAndBootstrap: (): Promise<FPTGpuActionResponse> => {
    return httpRequest.post<FPTGpuActionResponse>('ai/gpu-control/start-bootstrap/');
  },
};

export default fptGpuService;
