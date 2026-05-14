'use client';

import { useQuery, keepPreviousData, UseQueryResult } from '@tanstack/react-query';
import {
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    where,
    type DocumentData,
} from 'firebase/firestore';
import db from '../../../../configs/firebase-config';
import { getUserAccount, type ChatAccountData } from '../../../../services/firebaseService';
import { ChatConversation } from '../../../../types/models';
import { PaginatedResponse } from '../../../../types/api';

type UseChatResult = UseQueryResult<PaginatedResponse<ChatConversation>> & {
    isMutating: boolean;
};

export type AdminChatMessage = {
    id: string;
    senderId?: string;
    text?: string;
    attachmentUrl?: string;
    attachmentType?: string;
    fileName?: string;
    createAt?: string;
};

type ChatListParams = {
    page?: number;
    pageSize?: number;
    ordering?: string;
    kw?: string;
    search?: string;
};

const toIsoString = (value: unknown): string | undefined => {
    if (!value) return undefined;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string') return value;
    const timestamp = value as { toDate?: () => Date; seconds?: number };
    if (typeof timestamp.toDate === 'function') return timestamp.toDate().toISOString();
    if (typeof timestamp.seconds === 'number') return new Date(timestamp.seconds * 1000).toISOString();
    return undefined;
};

const normalizeAccount = (id: string, account: ChatAccountData | null) => ({
    id,
    userId: account?.userId ?? id,
    name: account?.name || '',
    email: account?.email || '',
    avatarUrl: account?.avatarUrl || undefined,
    company: account?.company || null,
});

const buildConversation = async (docId: string, data: DocumentData): Promise<ChatConversation> => {
    const members = Array.isArray(data.members) ? data.members.map(String) : [];
    const accounts = await Promise.all(
        members.map(async (memberId) => normalizeAccount(memberId, await getUserAccount('accounts', memberId)))
    );

    const candidate = accounts.find((account) => !account.company) || accounts[0];
    const employer = accounts.find((account) => account.company) || accounts.find((account) => account.id !== candidate?.id);

    return {
        id: docId,
        jobSeekerId: candidate?.userId || candidate?.id || '',
        jobSeekerName: candidate?.name || 'N/A',
        jobSeekerAvatar: candidate?.avatarUrl,
        jobSeekerEmail: candidate?.email,
        employerId: employer?.userId,
        companyId: employer?.company?.companyId,
        employerName: employer?.name,
        companyName: employer?.company?.companyName || employer?.name,
        employerLogo: employer?.company?.imageUrl || employer?.avatarUrl,
        lastMessage: data.lastMessage || '',
        isActive: data.isActive !== false,
        createAt: toIsoString(data.updatedAt || data.createdAt),
    };
};

export const useChat = (params?: ChatListParams): UseChatResult => {
    const queryResult = useQuery<PaginatedResponse<ChatConversation>>({
        queryKey: ['admin-chat', params],
        queryFn: async () => {
            const pageSize = params?.pageSize || 100;
            const chatRoomsQuery = query(
                collection(db, 'chatRooms'),
                orderBy('updatedAt', 'desc'),
                limit(pageSize)
            );
            const snapshot = await getDocs(chatRoomsQuery);
            let results = await Promise.all(snapshot.docs.map((docSnap) => buildConversation(docSnap.id, docSnap.data())));

            const search = (params?.kw || params?.search || '').trim().toLowerCase();
            if (search) {
                results = results.filter((item) => [
                    item.jobSeekerName,
                    item.jobSeekerEmail,
                    item.employerName,
                    item.companyName,
                    typeof item.lastMessage === 'string' ? item.lastMessage : item.lastMessage?.content,
                ].some((value) => String(value || '').toLowerCase().includes(search)));
            }

            return {
                results,
                count: results.length,
            };
        },
        placeholderData: keepPreviousData,
    });

    return {
        ...queryResult,
        isMutating: false,
    };
};

export const useChatMessages = (chatRoomId?: string | number | null): UseQueryResult<AdminChatMessage[]> => {
    return useQuery({
        queryKey: ['admin-chat-messages', chatRoomId],
        enabled: !!chatRoomId,
        queryFn: async () => {
            const messagesQuery = query(
                collection(db, 'messages'),
                where('chatRoomId', '==', String(chatRoomId)),
                orderBy('createdAt', 'asc'),
                limit(100)
            );
            const snapshot = await getDocs(messagesQuery);
            return snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    senderId: data.senderId,
                    text: data.text,
                    attachmentUrl: data.attachmentUrl,
                    attachmentType: data.attachmentType,
                    fileName: data.fileName,
                    createAt: toIsoString(data.createdAt),
                };
            });
        },
    });
};
