import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import hrmService, {
  HrmDashboardStats,
  NativeEmployee,
  NativeDepartment,
  NativeDesignation,
  NativeContract,
  NativeLeaveRequest,
  NativeOrgTreeNode,
  OnboardCandidatePayload,
  NativeWorkShift,
  NativeShiftAssignment,
  BatchAssignShiftsPayload,
  NativeAttendanceRequest,
  NativeBiometricPunchLog,
  NativeMonthlyAttendanceSummary,
  NativeWorkLocation,
  NativeBiometricDevice,
  NativeEmployeeCareerHistory,
  NativeEmployeeDocument,
} from '@/services/hrmService';
import toastMessages from '@/utils/toastMessages';

// -- Query Keys -------------------------------------------------------------
export const HRM_QUERY_KEYS = {
  stats: ['hrm-stats'] as const,
  employees: ['hrm-employees'] as const,
  departments: ['hrm-departments'] as const,
  designations: ['hrm-designations'] as const,
  workLocations: ['hrm-work-locations'] as const,
  biometricDevices: ['hrm-biometric-devices'] as const,
  contracts: ['hrm-contracts'] as const,
  leaves: ['hrm-leaves'] as const,
  leaveTypes: ['hrm-leave-types'] as const,
  leaveBalances: ['hrm-leave-balances'] as const,
  timesheet: ['hrm-timesheet'] as const,
  workShifts: ['hrm-work-shifts'] as const,
  shiftAssignments: ['hrm-shift-assignments'] as const,
  attendanceRequests: ['hrm-attendance-requests'] as const,
  biometricPunchLogs: ['hrm-biometric-punch-logs'] as const,
  monthlyAttendanceSummaries: ['hrm-monthly-attendance-summaries'] as const,
  careerHistories: ['hrm-career-histories'] as const,
  documents: ['hrm-documents'] as const,
  payroll: ['hrm-payroll'] as const,
  payrollKPIs: ['hrm-payroll-kpis'] as const,
  myProfile: ['hrm-my-profile'] as const,
  orgChart: ['hrm-org-chart'] as const,
};

// -- Queries ----------------------------------------------------------------
export const useHrmDashboardStats = () => {
  return useQuery<HrmDashboardStats>({
    queryKey: HRM_QUERY_KEYS.stats,
    queryFn: () => hrmService.getDashboardStats(),
    staleTime: 60 * 1000,
  });
};

export const useHrmEmployees = (params?: { department?: number; status?: string; search?: string }) => {
  return useQuery<NativeEmployee[]>({
    queryKey: [...HRM_QUERY_KEYS.employees, params],
    queryFn: () => hrmService.getEmployees(params),
    staleTime: 60 * 1000,
  });
};

export const useHrmDepartments = () => {
  return useQuery<NativeDepartment[]>({
    queryKey: HRM_QUERY_KEYS.departments,
    queryFn: () => hrmService.getDepartments(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useHrmDesignations = () => {
  return useQuery<NativeDesignation[]>({
    queryKey: HRM_QUERY_KEYS.designations,
    queryFn: () => hrmService.getDesignations(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useHrmContracts = () => {
  return useQuery<NativeContract[]>({
    queryKey: HRM_QUERY_KEYS.contracts,
    queryFn: () => hrmService.getContracts(),
    staleTime: 60 * 1000,
  });
};

export const useHrmLeaveTypes = () => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.leaveTypes,
    queryFn: () => hrmService.getLeaveTypes(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useHrmLeaves = () => {
  return useQuery<NativeLeaveRequest[]>({
    queryKey: HRM_QUERY_KEYS.leaves,
    queryFn: () => hrmService.getLeaveRequests(),
    staleTime: 60 * 1000,
  });
};

export const useHrmLeaveBalances = (params?: { employee?: number; year?: number }) => {
  return useQuery({
    queryKey: [...HRM_QUERY_KEYS.leaveBalances, params],
    queryFn: () => hrmService.getLeaveBalances(params),
    staleTime: 60 * 1000,
  });
};

export const useHrmTimesheet = (params: { month: number; year: number; department?: number }) => {
  return useQuery({
    queryKey: [...HRM_QUERY_KEYS.timesheet, params],
    queryFn: () => hrmService.getMonthlyTimesheet(params),
    staleTime: 30 * 1000,
  });
};

export const useHrmPayrollList = (params?: { month?: number; year?: number; status?: string }) => {
  return useQuery({
    queryKey: [...HRM_QUERY_KEYS.payroll, params],
    queryFn: () => hrmService.getMonthlyPayrollList(params),
    staleTime: 30 * 1000,
  });
};

export const useHrmPayrollKPIs = (params: { month: number; year: number }) => {
  return useQuery({
    queryKey: [...HRM_QUERY_KEYS.payrollKPIs, params],
    queryFn: () => hrmService.getPayrollSummaryKPIs(params),
    staleTime: 30 * 1000,
  });
};

export const useHrmMyProfile = () => {
  return useQuery({
    queryKey: HRM_QUERY_KEYS.myProfile,
    queryFn: () => hrmService.getMyHrmProfile(),
    staleTime: 60 * 1000,
  });
};

export const useHrmOrgChart = () => {
  return useQuery<NativeOrgTreeNode[]>({
    queryKey: HRM_QUERY_KEYS.orgChart,
    queryFn: () => hrmService.getOrgChart(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useHrmWorkShifts = (params?: any) => {
  return useQuery<NativeWorkShift[]>({
    queryKey: [...HRM_QUERY_KEYS.workShifts, params],
    queryFn: () => hrmService.getWorkShifts(params),
    staleTime: 60 * 1000,
  });
};

export const useHrmShiftAssignments = (params?: {
  month?: number;
  year?: number;
  employee_id?: number;
  department_id?: number;
  start_date?: string;
  end_date?: string;
}) => {
  return useQuery<NativeShiftAssignment[]>({
    queryKey: [...HRM_QUERY_KEYS.shiftAssignments, params],
    queryFn: () => hrmService.getShiftAssignments(params),
    staleTime: 30 * 1000,
  });
};

export const useHrmAttendanceRequests = (params?: {
  status?: string;
  request_type?: string;
  employee_id?: number;
}) => {
  return useQuery<NativeAttendanceRequest[]>({
    queryKey: [...HRM_QUERY_KEYS.attendanceRequests, params],
    queryFn: () => hrmService.getAttendanceRequests(params),
    staleTime: 30 * 1000,
  });
};

export const useHrmBiometricPunchLogs = (params?: {
  date?: string;
  employee_id?: number;
  source?: string;
  device_id?: number;
  location_id?: number;
  is_duplicate?: boolean;
}) => {
  return useQuery<NativeBiometricPunchLog[]>({
    queryKey: [...HRM_QUERY_KEYS.biometricPunchLogs, params],
    queryFn: () => hrmService.getBiometricPunchLogs(params),
    staleTime: 15 * 1000,
  });
};

export const useHrmCareerHistories = (params?: {
  employee_id?: number;
  event_type?: string;
}) => {
  return useQuery<NativeEmployeeCareerHistory[]>({
    queryKey: [...HRM_QUERY_KEYS.careerHistories, params],
    queryFn: () => hrmService.getCareerHistories(params),
    staleTime: 30 * 1000,
  });
};

export const useHrmDocuments = (params?: {
  employee_id?: number;
  document_type?: string;
}) => {
  return useQuery<NativeEmployeeDocument[]>({
    queryKey: [...HRM_QUERY_KEYS.documents, params],
    queryFn: () => hrmService.getEmployeeDocuments(params),
    staleTime: 30 * 1000,
  });
};

export const useHrmMonthlyAttendanceSummaries = (params?: {
  month?: number;
  year?: number;
  employee_id?: number;
  department_id?: number;
}) => {
  return useQuery<NativeMonthlyAttendanceSummary[]>({
    queryKey: [...HRM_QUERY_KEYS.monthlyAttendanceSummaries, params],
    queryFn: () => hrmService.getMonthlyAttendanceSummaries(params),
    staleTime: 30 * 1000,
  });
};

export const useHrmWorkLocations = (params?: {
  is_active?: boolean;
  location_type?: string;
  search?: string;
}) => {
  return useQuery<NativeWorkLocation[]>({
    queryKey: [...HRM_QUERY_KEYS.workLocations, params],
    queryFn: () => hrmService.getWorkLocations(params),
    staleTime: 30 * 1000,
  });
};

export const useHrmBiometricDevices = (params?: {
  location_id?: number;
  status?: string;
  protocol?: string;
  search?: string;
}) => {
  return useQuery<NativeBiometricDevice[]>({
    queryKey: [...HRM_QUERY_KEYS.biometricDevices, params],
    queryFn: () => hrmService.getBiometricDevices(params),
    staleTime: 15 * 1000,
  });
};

// -- Mutations --------------------------------------------------------------
export const useHrmMutations = () => {
  const queryClient = useQueryClient();

  const createDepartment = useMutation({
    mutationFn: (data: { name: string; code?: string; description?: string }) =>
      hrmService.createDepartment(data),
    onSuccess: () => {
      toastMessages.success('Đã tạo phòng ban mới thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.departments });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.stats });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể tạo phòng ban.');
    },
  });

  const updateDepartment = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<NativeDepartment> }) =>
      hrmService.updateDepartment(id, data),
    onSuccess: () => {
      toastMessages.success('Đã cập nhật phòng ban thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.departments });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.stats });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.orgChart });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể cập nhật phòng ban.');
    },
  });

  const deleteDepartment = useMutation({
    mutationFn: (id: number) => hrmService.deleteDepartment(id),
    onSuccess: () => {
      toastMessages.success('Đã xóa phòng ban thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.departments });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.stats });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.orgChart });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể xóa phòng ban.');
    },
  });

  const createDesignation = useMutation({
    mutationFn: (data: { title: string; code?: string; description?: string }) =>
      hrmService.createDesignation(data),
    onSuccess: () => {
      toastMessages.success('Đã tạo chức danh mới thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.designations });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể tạo chức danh.');
    },
  });

  const updateDesignation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<NativeDesignation> }) =>
      hrmService.updateDesignation(id, data),
    onSuccess: () => {
      toastMessages.success('Đã cập nhật chức danh thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.designations });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể cập nhật chức danh.');
    },
  });

  const deleteDesignation = useMutation({
    mutationFn: (id: number) => hrmService.deleteDesignation(id),
    onSuccess: () => {
      toastMessages.success('Đã xóa chức danh thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.designations });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể xóa chức danh.');
    },
  });

  const createEmployee = useMutation({
    mutationFn: (data: Partial<NativeEmployee>) => hrmService.createEmployee(data),
    onSuccess: () => {
      toastMessages.success('Đã tạo hồ sơ nhân viên thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.employees });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.stats });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể tạo hồ sơ nhân viên.');
    },
  });

  const updateEmployee = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<NativeEmployee> }) =>
      hrmService.updateEmployee(id, data),
    onSuccess: () => {
      toastMessages.success('Đã cập nhật hồ sơ nhân viên thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.employees });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.stats });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể cập nhật hồ sơ nhân viên.');
    },
  });

  const deleteEmployee = useMutation({
    mutationFn: (id: number) => hrmService.deleteEmployee(id),
    onSuccess: () => {
      toastMessages.success('Đã xóa hồ sơ nhân viên thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.employees });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.stats });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể xóa hồ sơ nhân viên.');
    },
  });

  const onboardCandidate = useMutation({
    mutationFn: (data: OnboardCandidatePayload) => hrmService.onboardCandidate(data),
    onSuccess: () => {
      toastMessages.success('Tiếp nhận & Onboarding nhân viên thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.employees });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.stats });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.contracts });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể tiếp nhận nhân viên.');
    },
  });

  const createContract = useMutation({
    mutationFn: (data: Partial<NativeContract>) => hrmService.createContract(data),
    onSuccess: () => {
      toastMessages.success('Đã tạo hợp đồng mới thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.contracts });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.stats });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể tạo hợp đồng.');
    },
  });

  const updateContract = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<NativeContract> }) =>
      hrmService.updateContract(id, data),
    onSuccess: () => {
      toastMessages.success('Đã cập nhật hợp đồng thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.contracts });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.stats });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể cập nhật hợp đồng.');
    },
  });

  const deleteContract = useMutation({
    mutationFn: (id: number) => hrmService.deleteContract(id),
    onSuccess: () => {
      toastMessages.success('Đã xóa hợp đồng thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.contracts });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.stats });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể xóa hợp đồng.');
    },
  });

  const renewContract = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => hrmService.renewContract(id, data),
    onSuccess: () => {
      toastMessages.success('Đã tái ký / gia hạn hợp đồng thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.contracts });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.employees });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.stats });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể gia hạn hợp đồng.');
    },
  });

  const createLeaveRequest = useMutation({
    mutationFn: (data: Partial<NativeLeaveRequest>) => hrmService.createLeaveRequest(data),
    onSuccess: () => {
      toastMessages.success('Đã tạo đơn xin nghỉ phép thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.leaves });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.leaveBalances });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.stats });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể gửi đơn nghỉ phép.');
    },
  });

  const deleteLeaveRequest = useMutation({
    mutationFn: (id: number) => hrmService.deleteLeaveRequest(id),
    onSuccess: () => {
      toastMessages.success('Đã hủy đơn xin nghỉ phép thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.leaves });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.leaveBalances });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.stats });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể hủy đơn nghỉ phép.');
    },
  });

  const approveLeave = useMutation({
    mutationFn: (id: number) => hrmService.approveLeaveRequest(id),
    onSuccess: () => {
      toastMessages.success('Đã phê duyệt đơn xin nghỉ phép!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.leaves });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.leaveBalances });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.stats });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Lỗi khi phê duyệt đơn nghỉ phép.');
    },
  });

  const rejectLeave = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      hrmService.rejectLeaveRequest(id, reason),
    onSuccess: () => {
      toastMessages.success('Đã từ chối đơn xin nghỉ phép!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.leaves });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.leaveBalances });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.stats });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Lỗi khi từ chối đơn nghỉ phép.');
    },
  });

  const autoAllocateLeaveBalances = useMutation({
    mutationFn: (year: number) => hrmService.autoAllocateLeaveBalances(year),
    onSuccess: (res) => {
      toastMessages.success(res?.message || 'Đã cấp phát quỹ phép thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.leaveBalances });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Lỗi khi cấp phát quỹ phép.');
    },
  });

  const quickCheckin = useMutation({
    mutationFn: (data: any) => hrmService.quickCheckin(data),
    onSuccess: () => {
      toastMessages.success('Chấm công thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.timesheet });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Lỗi khi chấm công.');
    },
  });

  const calculateMonthlyPayroll = useMutation({
    mutationFn: (data: any) => hrmService.calculateMonthlyPayroll(data),
    onSuccess: (res) => {
      toastMessages.success(res?.message || 'Đã tính toán bảng lương thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.payroll });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.payrollKPIs });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Lỗi khi tính toán bảng lương.');
    },
  });

  const approveAllPayroll = useMutation({
    mutationFn: (data: any) => hrmService.approveAllPayroll(data),
    onSuccess: (res) => {
      toastMessages.success(res?.message || 'Đã phê duyệt bảng lương!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.payroll });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.payrollKPIs });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Lỗi khi duyệt bảng lương.');
    },
  });

  const markPaidAllPayroll = useMutation({
    mutationFn: (data: any) => hrmService.markPaidAllPayroll(data),
    onSuccess: (res) => {
      toastMessages.success(res?.message || 'Đã đánh dấu chi trả bảng lương!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.payroll });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.payrollKPIs });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Lỗi khi đánh dấu chi trả.');
    },
  });

  // -- Time & Attendance Mutations -------------------------------------------
  const createWorkShift = useMutation({
    mutationFn: (data: Partial<NativeWorkShift>) => hrmService.createWorkShift(data),
    onSuccess: () => {
      toastMessages.success('Đã thêm ca làm việc mới!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.workShifts });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể tạo ca làm việc.');
    },
  });

  const updateWorkShift = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<NativeWorkShift> }) =>
      hrmService.updateWorkShift(id, data),
    onSuccess: () => {
      toastMessages.success('Đã cập nhật ca làm việc!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.workShifts });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể cập nhật ca làm việc.');
    },
  });

  const deleteWorkShift = useMutation({
    mutationFn: (id: number) => hrmService.deleteWorkShift(id),
    onSuccess: () => {
      toastMessages.success('Đã xóa ca làm việc!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.workShifts });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể xóa ca làm việc.');
    },
  });

  const batchAssignShifts = useMutation({
    mutationFn: (data: BatchAssignShiftsPayload) => hrmService.batchAssignShifts(data),
    onSuccess: (res) => {
      toastMessages.success(res?.message || 'Phân ca thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.shiftAssignments });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Lỗi khi phân ca.');
    },
  });

  const deleteShiftAssignment = useMutation({
    mutationFn: (id: number) => hrmService.deleteShiftAssignment(id),
    onSuccess: () => {
      toastMessages.success('Đã xóa phân ca!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.shiftAssignments });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể xóa phân ca.');
    },
  });

  const createAttendanceRequest = useMutation({
    mutationFn: (data: Partial<NativeAttendanceRequest>) =>
      hrmService.createAttendanceRequest(data),
    onSuccess: () => {
      toastMessages.success('Gửi đơn từ thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.attendanceRequests });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Lỗi khi gửi đơn từ.');
    },
  });

  const approveAttendanceRequestStage1 = useMutation({
    mutationFn: (id: number) => hrmService.approveAttendanceRequestStage1(id),
    onSuccess: () => {
      toastMessages.success('Quản lý cấp 1 đã duyệt đơn!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.attendanceRequests });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.timesheet });
    },
    onError: (err: any) => {
      toastMessages.error(
        err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Lỗi khi duyệt cấp 1.'
      );
    },
  });

  const approveAttendanceRequestStage2 = useMutation({
    mutationFn: (id: number) => hrmService.approveAttendanceRequestStage2(id),
    onSuccess: () => {
      toastMessages.success('HR / Admin đã duyệt đơn & tự động bù công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.attendanceRequests });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.timesheet });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.monthlyAttendanceSummaries });
    },
    onError: (err: any) => {
      toastMessages.error(
        err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Lỗi khi duyệt cấp 2.'
      );
    },
  });

  const rejectAttendanceRequest = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      hrmService.rejectAttendanceRequest(id, reason),
    onSuccess: () => {
      toastMessages.success('Đã từ chối đơn!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.attendanceRequests });
    },
    onError: (err: any) => {
      toastMessages.error(
        err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Lỗi khi từ chối đơn.'
      );
    },
  });

  const cancelAttendanceRequest = useMutation({
    mutationFn: (id: number) => hrmService.cancelAttendanceRequest(id),
    onSuccess: () => {
      toastMessages.success('Đã hủy đơn!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.attendanceRequests });
    },
    onError: (err: any) => {
      toastMessages.error(
        err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Lỗi khi hủy đơn.'
      );
    },
  });

  const createBiometricPunchLog = useMutation({
    mutationFn: (data: Partial<NativeBiometricPunchLog>) =>
      hrmService.createBiometricPunchLog(data),
    onSuccess: () => {
      toastMessages.success('Đã ghi nhận dữ liệu quẹt thẻ!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.biometricPunchLogs });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Lỗi khi tạo log máy chấm công.');
    },
  });

  const processDailyPunchLogs = useMutation({
    mutationFn: (date?: string) => hrmService.processDailyPunchLogs(date),
    onSuccess: (res) => {
      toastMessages.success(res?.message || 'Đã tổng hợp dữ liệu quẹt thẻ!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.timesheet });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.biometricPunchLogs });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Lỗi khi tổng hợp quẹt thẻ.');
    },
  });

  const recalculateMonthlyAttendanceSummary = useMutation({
    mutationFn: (data: { month: number; year: number; employee_ids?: number[] }) =>
      hrmService.recalculateMonthlyAttendanceSummary(data),
    onSuccess: (res) => {
      toastMessages.success(res?.message || 'Đã tổng hợp bảng công tháng!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.monthlyAttendanceSummaries });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Lỗi khi tổng hợp công tháng.');
    },
  });

  const lockMonthlyAttendanceSummary = useMutation({
    mutationFn: (id: number) => hrmService.lockMonthlyAttendanceSummary(id),
    onSuccess: () => {
      toastMessages.success('Đã khóa bảng chấm công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.monthlyAttendanceSummaries });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.timesheet });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Lỗi khi khóa bảng công.');
    },
  });

  const unlockMonthlyAttendanceSummary = useMutation({
    mutationFn: (id: number) => hrmService.unlockMonthlyAttendanceSummary(id),
    onSuccess: () => {
      toastMessages.success('Đã mở khóa bảng chấm công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.monthlyAttendanceSummaries });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.timesheet });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Lỗi khi mở khóa bảng công.');
    },
  });

  const pushSummaryToPayroll = useMutation({
    mutationFn: (id: number) => hrmService.pushSummaryToPayroll(id),
    onSuccess: (res) => {
      toastMessages.success(res?.message || 'Đã chuyển dữ liệu sang Bảng lương thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.monthlyAttendanceSummaries });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.payroll });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.payrollKPIs });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Lỗi khi chuyển tính lương.');
    },
  });

  const createWorkLocation = useMutation({
    mutationFn: (data: Partial<NativeWorkLocation>) => hrmService.createWorkLocation(data),
    onSuccess: () => {
      toastMessages.success('Đã tạo chi nhánh mới thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.workLocations });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể tạo chi nhánh.');
    },
  });

  const updateWorkLocation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<NativeWorkLocation> }) =>
      hrmService.updateWorkLocation(id, data),
    onSuccess: () => {
      toastMessages.success('Đã cập nhật chi nhánh thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.workLocations });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể cập nhật chi nhánh.');
    },
  });

  const deleteWorkLocation = useMutation({
    mutationFn: (id: number) => hrmService.deleteWorkLocation(id),
    onSuccess: () => {
      toastMessages.success('Đã xóa chi nhánh thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.workLocations });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể xóa chi nhánh.');
    },
  });

  const createBiometricDevice = useMutation({
    mutationFn: (data: Partial<NativeBiometricDevice>) => hrmService.createBiometricDevice(data),
    onSuccess: () => {
      toastMessages.success('Đã thêm thiết bị máy chấm công mới thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.biometricDevices });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể tạo thiết bị.');
    },
  });

  const updateBiometricDevice = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<NativeBiometricDevice> }) =>
      hrmService.updateBiometricDevice(id, data),
    onSuccess: () => {
      toastMessages.success('Đã cập nhật thiết bị thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.biometricDevices });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể cập nhật thiết bị.');
    },
  });

  const deleteBiometricDevice = useMutation({
    mutationFn: (id: number) => hrmService.deleteBiometricDevice(id),
    onSuccess: () => {
      toastMessages.success('Đã xóa thiết bị thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.biometricDevices });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể xóa thiết bị.');
    },
  });

  const testDeviceConnection = useMutation({
    mutationFn: (id: number) => hrmService.testDeviceConnection(id),
    onSuccess: (res) => {
      if (res.success) {
        toastMessages.success(res.message);
      } else {
        toastMessages.error(res.message);
      }
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.biometricDevices });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể kiểm tra kết nối thiết bị.');
    },
  });

  const syncDevice = useMutation({
    mutationFn: (id: number) => hrmService.syncDevice(id),
    onSuccess: (res) => {
      toastMessages.success(res.message);
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.biometricDevices });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.biometricPunchLogs });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Không thể đồng bộ thiết bị.');
    },
  });

  // Deduplicate punch logs
  const deduplicatePunchLogs = useMutation({
    mutationFn: (data?: { date?: string; window_seconds?: number }) => hrmService.deduplicatePunchLogs(data),
    onSuccess: (res) => {
      toastMessages.success(res.message || `Đã lọc ${res.duplicate_count} bản ghi quẹt trùng.`);
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.biometricPunchLogs });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.detail || 'Lỗi khi chạy lọc trùng lặp.');
    },
  });

  // Career History Mutations
  const createCareerHistory = useMutation({
    mutationFn: (data: Partial<NativeEmployeeCareerHistory>) => hrmService.createCareerHistory(data),
    onSuccess: () => {
      toastMessages.success('Đã lưu biến động nhân sự mới thành công.');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.careerHistories });
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.employees });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.detail || 'Không thể lưu biến động nhân sự.');
    },
  });

  const deleteCareerHistory = useMutation({
    mutationFn: (id: number) => hrmService.deleteCareerHistory(id),
    onSuccess: () => {
      toastMessages.success('Đã xóa bản ghi biến động nhân sự.');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.careerHistories });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.detail || 'Không thể xóa bản ghi biến động.');
    },
  });

  // Employee Document Mutations
  const createEmployeeDocument = useMutation({
    mutationFn: (data: Partial<NativeEmployeeDocument>) => hrmService.createEmployeeDocument(data),
    onSuccess: () => {
      toastMessages.success('Đã tải lên tài liệu số thành công.');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.documents });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.detail || 'Không thể lưu tài liệu số.');
    },
  });

  const deleteEmployeeDocument = useMutation({
    mutationFn: (id: number) => hrmService.deleteEmployeeDocument(id),
    onSuccess: () => {
      toastMessages.success('Đã xóa tài liệu số.');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.documents });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.detail || 'Không thể xóa tài liệu số.');
    },
  });

  return {
    createDepartment,
    updateDepartment,
    deleteDepartment,
    createDesignation,
    updateDesignation,
    deleteDesignation,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    onboardCandidate,
    createContract,
    updateContract,
    deleteContract,
    renewContract,
    createLeaveRequest,
    deleteLeaveRequest,
    approveLeave,
    rejectLeave,
    autoAllocateLeaveBalances,
    quickCheckin,
    calculateMonthlyPayroll,
    approveAllPayroll,
    markPaidAllPayroll,
    createWorkShift,
    updateWorkShift,
    deleteWorkShift,
    batchAssignShifts,
    deleteShiftAssignment,
    createAttendanceRequest,
    approveAttendanceRequestStage1,
    approveAttendanceRequestStage2,
    rejectAttendanceRequest,
    cancelAttendanceRequest,
    createBiometricPunchLog,
    processDailyPunchLogs,
    deduplicatePunchLogs,
    recalculateMonthlyAttendanceSummary,
    lockMonthlyAttendanceSummary,
    unlockMonthlyAttendanceSummary,
    pushSummaryToPayroll,
    createWorkLocation,
    updateWorkLocation,
    deleteWorkLocation,
    createBiometricDevice,
    updateBiometricDevice,
    deleteBiometricDevice,
    testDeviceConnection,
    syncDevice,
    createCareerHistory,
    deleteCareerHistory,
    createEmployeeDocument,
    deleteEmployeeDocument,
  };
};
