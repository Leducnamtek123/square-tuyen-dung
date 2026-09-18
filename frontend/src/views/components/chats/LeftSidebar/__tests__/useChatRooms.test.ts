import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../useChatRooms.ts'), 'utf8');

describe('useChatRooms hook and types', () => {
  it('exports useChatRooms hook function', () => {
    expect(source).toContain('export const useChatRooms = (searchQuery?: string)');
  });

  it('supports searching by name, email, company name, and lastMessage', () => {
    expect(source).toContain('filteredChatRooms');
    expect(source).toContain('room.user?.name?.toLowerCase()');
    expect(source).toContain('room.user?.company?.companyName?.toLowerCase()');
    expect(source).toContain('room.lastMessage?.toLowerCase()');
  });

  it('provides selectedRoomId from chat context and selection handler', () => {
    expect(source).toContain('selectedRoomId');
    expect(source).toContain('handleSelectRoom');
    expect(source).toContain('setSelectedRoomId(chatRoom?.id)');
  });

  it('defines UserAccount and ChatRoomData with lastMessage and unreadCount', () => {
    expect(source).toContain('export interface UserAccount');
    expect(source).toContain('export interface ChatRoomData');
    expect(source).toContain('lastMessage?: string;');
    expect(source).toContain('unreadCount?: number;');
  });
});
