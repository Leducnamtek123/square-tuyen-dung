'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import adminManagementService, { type AdminListParams } from '../../../../services/adminManagementService';
import toastMessages from '../../../../utils/toastMessages';
import type { PaginatedResponse } from '../../../../types/api';
import type { TrustReport } from '../../../../types/models';
import i18next from 'i18next';

type UseTrustReportsResult = UseQueryResult<PaginatedResponse<TrustReport>> & {
  updateTrustReport: (args: { id: string | number; status: TrustReport['status'] }) => Promise<TrustReport>;
  isMutating: boolean;
};

export const useTrustReports = (params?: AdminListParams): UseTrustReportsResult => {
  const queryClient = useQueryClient();

  const query = useQuery<PaginatedResponse<TrustReport>>({
    queryKey: ['admin-trust-reports', params],
    queryFn: async () => adminManagementService.getTrustReports(params),
    placeholderData: keepPreviousData,
  });

  const updateMutation = useMutation<TrustReport, Error, { id: string | number; status: TrustReport['status'] }>({
    mutationFn: ({ id, status }) => adminManagementService.updateTrustReport(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trust-reports'] });
      toastMessages.success(i18next.t('admin:pages.trustReports.toast.updateSuccess'));
    },
    onError: (err) => {
      console.error(err);
      toastMessages.error(i18next.t('admin:pages.trustReports.toast.updateError'));
    },
  });

  return {
    ...query,
    updateTrustReport: updateMutation.mutateAsync,
    isMutating: updateMutation.isPending,
  } as UseTrustReportsResult;
};
