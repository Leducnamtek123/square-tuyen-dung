import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import authService from '@/services/authService';
import type { UserSettingsData } from '@/types/auth';
import toastMessages from '@/utils/toastMessages';
import i18next from 'i18next';

export const useUserSettings = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const response = await authService.getUserSettings();
      return response;
    },
    enabled,
  });
};

export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UserSettingsData) => authService.updateUserSettings(data),
    onSuccess: (response: unknown) => {
      queryClient.setQueryData(['userSettings'], response);
      toastMessages.success(
        i18next.t('jobSeeker:settings.toast.updateSuccess', {
          defaultValue: 'Cập nhật cài đặt thành công!',
        })
      );
    },
    onError: () => {
      toastMessages.error(
        i18next.t('jobSeeker:settings.toast.updateError', {
          defaultValue: 'Có lỗi xảy ra khi cập nhật cài đặt.',
        })
      );
    },
  });
};

export default useUserSettings;
