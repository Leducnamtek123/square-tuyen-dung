import { useState, useCallback, useEffect } from 'react';
import { useQuery, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import { ChatConversation } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';

export type UseChatResult = UseQueryResult<PaginatedResponse<ChatConversation>> & {
    isMutating: boolean;
};

export const useChat = (params?: Record<string, unknown>): UseChatResult => {
    // Current stub implementation as backend has no chat conversation endpoint yet
    const query = useQuery<PaginatedResponse<ChatConversation>>({
        queryKey: ['admin-chat', params],
        queryFn: async () => {
            return {
                results: [],
                count: 0,
                next: null,
                previous: null
            };
        },
        placeholderData: keepPreviousData,
    });

    return {
        ...query,
        isMutating: false
    } as UseChatResult;
};
