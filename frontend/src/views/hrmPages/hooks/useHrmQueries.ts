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
} from '@/services/hrmService';
import toastMessages from '@/utils/toastMessages';

// ── Query Keys ─────────────────────────────────────────────────────────────
export const HRM_QUERY_KEYS = {
  stats: ['hrm-stats'] as const,
  employees: ['hrm-employees'] as const,
  departments: ['hrm-departments'] as const,
  designations: ['hrm-designations'] as const,
  contracts: ['hrm-contracts'] as const,
  leaves: ['hrm-leaves'] as const,
  orgChart: ['hrm-org-chart'] as const,
};

// ── Queries ────────────────────────────────────────────────────────────────
export const useHrmDashboardStats = () => {
  return useQuery<HrmDashboardStats>({
    queryKey: HRM_QUERY_KEYS.stats,
    queryFn: () => hrmService.getDashboardStats(),
    staleTime: 60 * 1000,
  });
};

export const useHrmEmployees = () => {
  return useQuery<NativeEmployee[]>({
    queryKey: HRM_QUERY_KEYS.employees,
    queryFn: () => hrmService.getEmployees(),
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

export const useHrmLeaves = () => {
  return useQuery<NativeLeaveRequest[]>({
    queryKey: HRM_QUERY_KEYS.leaves,
    queryFn: () => hrmService.getLeaveRequests(),
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

// ── Mutations ──────────────────────────────────────────────────────────────
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

  const createLeaveRequest = useMutation({
    mutationFn: (data: Partial<NativeLeaveRequest>) => hrmService.createLeaveRequest(data),
    onSuccess: () => {
      toastMessages.success('Đã tạo đơn xin nghỉ phép thành công!');
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.leaves });
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
      queryClient.invalidateQueries({ queryKey: HRM_QUERY_KEYS.stats });
    },
    onError: (err: any) => {
      toastMessages.error(err?.response?.data?.message || err?.message || 'Lỗi khi từ chối đơn nghỉ phép.');
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
    createLeaveRequest,
    deleteLeaveRequest,
    approveLeave,
    rejectLeave,
  };
};
