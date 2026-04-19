import { useState, useCallback, useEffect } from 'react';
import { useQuery, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import { ChatConversation } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';

export type UseChatResult = UseQueryResult<PaginatedResponse<ChatConversation>> & {
    isMutating: boolean;
};

export type ChatListParams = {
    page?: number;
    pageSize?: number;
    ordering?: string;
    kw?: string;
    search?: string;
};

export const useChat = (params?: ChatListParams): UseChatResult => {
    // Current stub implementation as backend has no chat conversation endpoint yet
    const query = useQuery<PaginatedResponse<ChatConversation>>({
        queryKey: ['admin-chat', params],
        queryFn: async () => {
            return {
                results: [],
                count: 0,
            };
        },
        placeholderData: keepPreviousData,
    });

    return {
        ...query,
        isMutating: false
    };
};


