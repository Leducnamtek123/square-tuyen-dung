import hrmService from '../hrmService';
import httpRequest from '@/utils/httpRequest';

jest.mock('../../utils/httpRequest', () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

describe('hrmService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getDashboardStats calls native-hrm dashboard stats endpoint', async () => {
    const stats = {
      active_employees: 10,
      probation_employees: 2,
      pending_leaves: 1,
      expiring_contracts: 0,
      department_breakdown: [],
    };
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({ data: stats });
    const result = await hrmService.getDashboardStats();
    expect(httpRequest.get).toHaveBeenCalledWith('native-hrm/dashboard/stats/');
    expect(result).toEqual(stats);
  });

  it('getEmployees calls native-hrm employees endpoint', async () => {
    const employees = [{ id: 1, full_name: 'Nguyen Van A' }];
    (httpRequest.get as jest.Mock).mockResolvedValueOnce({ results: employees });
    const result = await hrmService.getEmployees();
    expect(httpRequest.get).toHaveBeenCalledWith('native-hrm/employees/', { params: undefined });
    expect(result).toEqual(employees);
  });

  it('onboardCandidate posts to native-hrm onboard-from-candidate endpoint', async () => {
    const payload = { first_name: 'Van A', last_name: 'Nguyen', email: 'vana@example.com' };
    const createdEmployee = { id: 1, ...payload };
    (httpRequest.post as jest.Mock).mockResolvedValueOnce({ data: createdEmployee });
    const result = await hrmService.onboardCandidate(payload);
    expect(httpRequest.post).toHaveBeenCalledWith('native-hrm/employees/onboard-from-candidate/', expect.objectContaining(payload));
    expect(result).toEqual(createdEmployee);
  });
});
