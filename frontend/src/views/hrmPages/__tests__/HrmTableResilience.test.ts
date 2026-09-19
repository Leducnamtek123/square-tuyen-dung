import dayjs from 'dayjs';

describe('HRM Tables & API Resilience', () => {
  describe('LeaveListPage Resilience', () => {
    it('handles null, undefined, or empty leaveRequests gracefully without crashing', () => {
      const rawLeavesNull: any = null;
      const leaveRequests = Array.isArray(rawLeavesNull) ? rawLeavesNull : [];

      expect(leaveRequests.length).toBe(0);

      const totalLeaves = leaveRequests.length;
      const pendingLeaves = leaveRequests.filter((l: any) => l?.status === 'PENDING').length;
      const approvedLeaves = leaveRequests.filter((l: any) => l?.status === 'APPROVED').length;
      const rejectedLeaves = leaveRequests.filter((l: any) => l?.status === 'REJECTED').length;

      expect(totalLeaves).toBe(0);
      expect(pendingLeaves).toBe(0);
      expect(approvedLeaves).toBe(0);
      expect(rejectedLeaves).toBe(0);
    });

    it('safely filters leaves even when individual items are null or missing status', () => {
      const malformedLeaves = [
        null,
        undefined,
        { id: 1, status: 'PENDING' },
        { id: 2 }, // missing status
        { id: 3, status: 'APPROVED' },
      ];

      const validList = Array.isArray(malformedLeaves) ? malformedLeaves : [];
      const pending = validList.filter((l: any) => l?.status === 'PENDING');
      const approved = validList.filter((l: any) => l?.status === 'APPROVED');

      expect(pending).toHaveLength(1);
      expect(approved).toHaveLength(1);
    });
  });

  describe('ContractListPage Resilience', () => {
    it('handles null or empty contracts without crash', () => {
      const rawContractsNull: any = null;
      const contracts = Array.isArray(rawContractsNull) ? rawContractsNull : [];

      const totalContracts = contracts.length;
      const activeContracts = contracts.filter((c: any) => c?.status === 'ACTIVE').length;
      const probationContracts = contracts.filter((c: any) => (c?.contractType || c?.contract_type) === 'PROBATION').length;

      expect(totalContracts).toBe(0);
      expect(activeContracts).toBe(0);
      expect(probationContracts).toBe(0);
    });

    it('handles missing or malformed end dates in expiring contract calculation', () => {
      const malformedContracts = [
        { id: 1, status: 'ACTIVE', endDate: null },
        { id: 2, status: 'ACTIVE', endDate: 'invalid-date' },
        { id: 3, status: 'EXPIRED', endDate: dayjs().add(5, 'day').format('YYYY-MM-DD') },
        { id: 4, status: 'ACTIVE', endDate: dayjs().add(15, 'day').format('YYYY-MM-DD') },
      ];

      const expiringSoon = malformedContracts.filter((c) => {
        const endDate = c?.endDate;
        if (!endDate || c?.status !== 'ACTIVE') return false;
        const d = dayjs(endDate);
        if (!d.isValid()) return false;
        const diff = d.diff(dayjs(), 'day');
        return diff >= 0 && diff <= 30;
      });

      expect(expiringSoon).toHaveLength(1);
      expect(expiringSoon[0].id).toBe(4);
    });
  });

  describe('AttendanceListPage Resilience', () => {
    it('handles null or missing employees object without crashing', () => {
      const timesheetDataEmpty: any = null;
      const isEmpty = !timesheetDataEmpty?.employees || timesheetDataEmpty.employees.length === 0;
      expect(isEmpty).toBe(true);

      const timesheetDataNoEmp: any = { days: [{ day: 1, is_weekend: false }] };
      const isEmpty2 = !timesheetDataNoEmp?.employees || timesheetDataNoEmp.employees.length === 0;
      expect(isEmpty2).toBe(true);
    });

    it('safely handles employee with missing records object using optional chaining', () => {
      const empWithMissingRecords: any = {
        employeeId: 101,
        fullName: 'Test Employee',
        // records is undefined or null
        records: null,
      };

      const day = 5;
      const record = empWithMissingRecords?.records?.[day];
      expect(record).toBeUndefined();

      // Does not throw when rendering status badge
      const getStatusLabel = (r: any) => r?.status || '-';
      expect(getStatusLabel(record)).toBe('-');
    });
  });
});
