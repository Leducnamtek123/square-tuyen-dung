import exchangeService from '../exchangeService';
import httpRequest from '@/utils/httpRequest';

jest.mock('@/utils/httpRequest');

describe('exchangeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDefinitions', () => {
    it('should fetch exchange definitions from API', async () => {
      const mockDefinitions = [
        {
          entityType: 'candidate',
          label: 'Hồ sơ ứng viên',
          supportsExport: true,
          supportsImport: true,
          matchingKeys: ['email', 'phone'],
        },
      ];

      (httpRequest.get as jest.Mock).mockResolvedValueOnce({
        data: mockDefinitions,
      });

      const result = await exchangeService.getDefinitions();

      expect(httpRequest.get).toHaveBeenCalledWith('exchange/definitions/');
      expect(result).toEqual(mockDefinitions);
    });
  });

  describe('getDefinition', () => {
    it('should fetch single entity definition', async () => {
      const mockDef = {
        entityType: 'employee',
        label: 'Nhân viên',
        supportsExport: true,
        supportsImport: true,
      };

      (httpRequest.get as jest.Mock).mockResolvedValueOnce({
        data: mockDef,
      });

      const result = await exchangeService.getDefinition('employee');

      expect(httpRequest.get).toHaveBeenCalledWith('exchange/definitions/employee/');
      expect(result).toEqual(mockDef);
    });
  });

  describe('createExport', () => {
    it('should initiate export job with entity, format and columns', async () => {
      const mockResponse = {
        data: {
          exportId: 'EXP-20260917-1234',
          status: 'completed',
          totalRows: 25,
          downloadUrl: '/api/v1/exchange/exports/EXP-20260917-1234/download/',
        },
      };

      (httpRequest.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await exchangeService.createExport(
        'candidate',
        'xlsx',
        ['fullName', 'email', 'phone'],
        { status: 'active' }
      );

      expect(httpRequest.post).toHaveBeenCalledWith('exchange/exports/', {
        entity: 'candidate',
        format: 'xlsx',
        fields: ['fullName', 'email', 'phone'],
        filters: { status: 'active' },
        async_job: true,
      });
      expect(result.exportId).toBe('EXP-20260917-1234');
      expect(result.status).toBe('completed');
    });
  });

  describe('getExportJob', () => {
    it('should fetch export job status and progress', async () => {
      const mockJob = {
        exportId: 'EXP-20260917-1234',
        status: 'processing',
        progress: 45,
        currentStep: 'Exporting 450 rows...',
      };

      (httpRequest.get as jest.Mock).mockResolvedValueOnce({
        data: mockJob,
      });

      const result = await exchangeService.getExportJob('EXP-20260917-1234');

      expect(httpRequest.get).toHaveBeenCalledWith('exchange/exports/EXP-20260917-1234/');
      expect(result.progress).toBe(45);
    });
  });

  describe('validateImport', () => {
    it('should upload file and return validation preview data', async () => {
      const mockPreview = {
        importId: 'IMP-20260917-5678',
        status: 'awaiting_confirmation',
        totalRows: 10,
        validRows: 9,
        invalidRows: 1,
        preview: [],
        errorSummary: [
          { row: 3, field: 'email', code: 'IMPORT_INVALID_EMAIL', message: 'Email sai định dạng' },
        ],
      };

      (httpRequest.post as jest.Mock).mockResolvedValueOnce({
        data: mockPreview,
      });

      const fakeFile = new File(['header1,header2'], 'test.csv', { type: 'text/csv' });

      const result = await exchangeService.validateImport(
        'candidate',
        fakeFile,
        'create',
        'email'
      );

      expect(httpRequest.post).toHaveBeenCalledWith(
        'exchange/imports/validate/',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      );
      expect(result.importId).toBe('IMP-20260917-5678');
      expect(result.invalidRows).toBe(1);
    });
  });

  describe('confirmImport', () => {
    it('should trigger commit for validated import job', async () => {
      const mockResult = {
        importId: 'IMP-20260917-5678',
        status: 'completed',
        totalRows: 10,
        createdRows: 9,
        failedRows: 0,
      };

      (httpRequest.post as jest.Mock).mockResolvedValueOnce({
        data: mockResult,
      });

      const result = await exchangeService.confirmImport('IMP-20260917-5678');

      expect(httpRequest.post).toHaveBeenCalledWith(
        'exchange/imports/IMP-20260917-5678/confirm/'
      );
      expect(result.status).toBe('completed');
      expect(result.createdRows).toBe(9);
    });
  });

  describe('getImportJob', () => {
    it('should retrieve status of import job', async () => {
      const mockJob = {
        importId: 'IMP-20260917-5678',
        status: 'committing',
        progress: 60,
        currentStep: 'Writing records...',
      };

      (httpRequest.get as jest.Mock).mockResolvedValueOnce({
        data: mockJob,
      });

      const result = await exchangeService.getImportJob('IMP-20260917-5678');

      expect(httpRequest.get).toHaveBeenCalledWith(
        'exchange/imports/IMP-20260917-5678/'
      );
      expect(result.progress).toBe(60);
    });
  });
});
