import operationService from '@/services/operationService';
import httpRequest from '@/utils/httpRequest';

jest.mock('@/utils/httpRequest', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('operationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOperation', () => {
    it('calls GET operations/${id}/ and unwraps response', async () => {
      const mockOp = {
        id: 'op_123',
        type: 'candidate.ai_scan',
        title: 'Scan CV',
        status: 'completed',
        progress: 100,
        steps: [],
      };
      (httpRequest.get as jest.Mock).mockResolvedValueOnce(mockOp);

      const result = await operationService.getOperation('op_123');

      expect(httpRequest.get).toHaveBeenCalledWith('operations/op_123/');
      expect(result).toEqual(mockOp);
    });

    it('unwraps response when wrapped in data property', async () => {
      const mockOp = {
        id: 'op_123',
        type: 'candidate.ai_scan',
        title: 'Scan CV',
        status: 'running',
        progress: 40,
        steps: [],
      };
      (httpRequest.get as jest.Mock).mockResolvedValueOnce({ data: mockOp });

      const result = await operationService.getOperation('op_123');

      expect(httpRequest.get).toHaveBeenCalledWith('operations/op_123/');
      expect(result).toEqual(mockOp);
    });
  });

  describe('getActiveOperations', () => {
    it('calls GET operations/active/ with params and unwraps response', async () => {
      const mockResponse = {
        results: [
          {
            id: 'op_1',
            type: 'exchange.import',
            title: 'Import',
            status: 'running',
            progress: 25,
            steps: [],
          },
        ],
      };
      (httpRequest.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await operationService.getActiveOperations({ type: 'exchange.import' });

      expect(httpRequest.get).toHaveBeenCalledWith('operations/active/', {
        params: { type: 'exchange.import' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('unwraps active operations wrapped in data property', async () => {
      const mockResponse = {
        results: [],
      };
      (httpRequest.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      const result = await operationService.getActiveOperations();

      expect(httpRequest.get).toHaveBeenCalledWith('operations/active/', {
        params: undefined,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('cancelOperation', () => {
    it('calls POST operations/${id}/cancel/ and unwraps response', async () => {
      const mockResponse = {
        success: true,
        operation: {
          id: 'op_123',
          type: 'candidate.ai_scan',
          title: 'Scan CV',
          status: 'cancelled',
          progress: 50,
          steps: [],
        },
      };
      (httpRequest.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await operationService.cancelOperation('op_123');

      expect(httpRequest.post).toHaveBeenCalledWith('operations/op_123/cancel/');
      expect(result).toEqual(mockResponse);
    });

    it('unwraps cancel response when wrapped in data property', async () => {
      const mockResponse = {
        success: true,
        operation: {
          id: 'op_123',
          type: 'candidate.ai_scan',
          title: 'Scan CV',
          status: 'cancelled',
          progress: 50,
          steps: [],
        },
      };
      (httpRequest.post as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      const result = await operationService.cancelOperation('op_123');

      expect(httpRequest.post).toHaveBeenCalledWith('operations/op_123/cancel/');
      expect(result).toEqual(mockResponse);
    });
  });
});
