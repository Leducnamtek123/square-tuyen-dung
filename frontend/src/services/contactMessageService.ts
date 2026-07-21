import httpRequest from '../utils/httpRequest';
import { PaginatedResponse } from '../types/api';
import { cleanParams } from '../utils/params';
import { normalizePaginatedResponse, unwrapDataResponse } from '../utils/apiResponse';
import { ContactMessage } from '../types/models';
import type { AdminListParams } from './adminManagementService';

const contactMessageService = {
  // Public: create a contact message (no auth required)
  async create(data: {
    category?: 'bug_report' | 'feedback' | 'support';
    subject?: string;
    pageUrl?: string;
    name: string;
    email: string;
    phone?: string;
    content: string;
  }): Promise<ContactMessage> {
    const url = 'content/web/contact-messages/';
    const res = await httpRequest.post(url, data);
    return unwrapDataResponse<ContactMessage>(res);
  },

  // Admin: list contact messages
  async getList(params: AdminListParams = {}): Promise<PaginatedResponse<ContactMessage>> {
    const url = 'content/web/admin/contact-messages/';
    const res = await httpRequest.get(url, { params: cleanParams(params) });
    return normalizePaginatedResponse<ContactMessage>(res);
  },

  // Admin: mark as read
  async markAsRead(id: number | string): Promise<ContactMessage> {
    const url = `content/web/admin/contact-messages/${id}/`;
    const res = await httpRequest.patch(url, { is_read: true });
    return unwrapDataResponse<ContactMessage>(res);
  },

  // Admin: delete
  async delete(id: number | string): Promise<void> {
    const url = `content/web/admin/contact-messages/${id}/`;
    await httpRequest.delete(url);
  },
};

export default contactMessageService;
