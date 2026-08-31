'use client';

import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import adminSettingsService from '@/services/adminSettingsService';
import toastMessages from '@/utils/toastMessages';
import type { SystemSettingsPayload } from '@/services/adminSettingsService';

export interface SystemSettings extends SystemSettingsPayload {
    maintenanceMode: boolean;
    autoApproveJobs: boolean;
    emailNotifications: boolean;
    ttsSpeed: string;
    interviewQuestionGapSeconds: string;
    interviewMinimumSilenceSeconds: string;
    chatbotTitle: string;
    chatbotSubtitle: string;
    chatbotEmployerGreeting: string;
    chatbotJobSeekerGreeting: string;
    chatbotEmployerSuggestions: string;
    chatbotJobSeekerSuggestions: string;
}

type UseSystemSettingsResult = UseQueryResult<SystemSettings> & {
    updateSystemSettings: (data: Partial<SystemSettings>) => Promise<SystemSettings>;
    isMutating: boolean;
};

const DEFAULT_EMPLOYER_SUGGESTIONS = JSON.stringify([
    'Tìm ứng viên cho vị trí thiết kế',
    'Soạn tin mời phỏng vấn',
    'Mức lương thị trường hiện nay',
]);

const DEFAULT_JOBSEEKER_SUGGESTIONS = JSON.stringify([
    'Tìm việc làm vị trí Frontend',
    'Tải mẫu CV tiếng Anh',
    'Cách trả lời phỏng vấn về mức lương',
]);

const normalizeSettings = (res: Partial<SystemSettingsPayload> = {}): SystemSettings => ({
    maintenanceMode: !!res.maintenanceMode,
    autoApproveJobs: !!res.autoApproveJobs,
    emailNotifications: res.emailNotifications ?? true,
    googleApiKey: res.googleApiKey || '',
    supportEmail: res.supportEmail || '',
    ttsSpeed: res.ttsSpeed || '0.92',
    interviewQuestionGapSeconds: res.interviewQuestionGapSeconds || '2.0',
    interviewMinimumSilenceSeconds: res.interviewMinimumSilenceSeconds || '1.2',
    chatbotTitle: res.chatbotTitle || 'AILA AI',
    chatbotSubtitle: res.chatbotSubtitle || 'Trợ lý tuyển dụng thông minh',
    chatbotEmployerGreeting:
        res.chatbotEmployerGreeting ||
        'Chào bạn! Tôi là AILA AI, trợ lý tuyển dụng của bạn. Tôi có thể giúp gì cho bạn?\n\n**Bạn có thể hỏi tôi về:**\n- Tìm kiếm ứng viên tiềm năng\n- Soạn tin nhắn mời phỏng vấn\n- Gợi ý mô tả công việc\n- Thống kê thị trường tuyển dụng',
    chatbotJobSeekerGreeting:
        res.chatbotJobSeekerGreeting ||
        'Chào bạn! Tôi là AILA AI, trợ lý tư vấn nghề nghiệp của bạn. Tôi có thể giúp gì cho bạn?\n\n**Bạn có thể hỏi tôi về:**\n- Tìm kiếm việc làm phù hợp\n- Soạn và tối ưu hóa CV\n- Mẹo trả lời phỏng vấn ấn tượng\n- Thông tin mức lương thị trường',
    chatbotEmployerSuggestions: res.chatbotEmployerSuggestions || DEFAULT_EMPLOYER_SUGGESTIONS,
    chatbotJobSeekerSuggestions: res.chatbotJobSeekerSuggestions || DEFAULT_JOBSEEKER_SUGGESTIONS,
});

export const useSystemSettings = (): UseSystemSettingsResult => {
    const { t } = useTranslation('admin');
    const queryClient = useQueryClient();

    const query = useQuery<SystemSettings>({
        queryKey: ['system-settings'],
        queryFn: async () => {
            const res = await adminSettingsService.getSystemSettings();
            return normalizeSettings(res);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (data: Partial<SystemSettings>): Promise<SystemSettings> => {
            const res = await adminSettingsService.updateSystemSettings(data);
            return normalizeSettings(res);
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['system-settings'], data);
            toastMessages.success(t('pages.settings.toast.saveSuccess'));
            queryClient.invalidateQueries({ queryKey: ['system-settings'] });
        },
        onError: () => toastMessages.error(t('pages.settings.toast.saveError')),
    });

    return {
        ...query,
        updateSystemSettings: updateMutation.mutateAsync,
        isMutating: updateMutation.isPending
    };
};
