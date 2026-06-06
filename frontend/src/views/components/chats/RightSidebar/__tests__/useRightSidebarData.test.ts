jest.mock('../../../../../context/ChatProvider', () => ({
  ChatContext: {},
}));

jest.mock('../../../../../services/firebaseService', () => ({
  addDocument: jest.fn(),
  checkChatRoomExists: jest.fn(),
  checkExists: jest.fn(),
  createUser: jest.fn(),
}));

import { normalizeRightSidebarResponse } from '../useRightSidebarData';

describe('normalizeRightSidebarResponse', () => {
  it('accepts array responses', () => {
    const rows = [{ id: 'chat-1' }, { id: 'chat-2' }];

    expect(normalizeRightSidebarResponse(rows)).toEqual({
      count: 2,
      results: rows,
    });
  });

  it('accepts nested data results responses', () => {
    const rows = [{ id: 'chat-1' }];

    expect(normalizeRightSidebarResponse({ data: { count: 5, results: rows } })).toEqual({
      count: 5,
      results: rows,
    });
  });

  it('accepts deeply nested data results responses', () => {
    const rows = [{ id: 'chat-3' }];

    expect(normalizeRightSidebarResponse({ data: { data: { count: 7, results: rows } } })).toEqual({
      count: 7,
      results: rows,
    });
  });
});
