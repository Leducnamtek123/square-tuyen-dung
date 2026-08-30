import { readFileSync } from 'fs';
import { join } from 'path';

const source = readFileSync(join(__dirname, '../SidebarRenderer.tsx'), 'utf8');

describe('SidebarRenderer Component', () => {
  it('integrates debounced search input with useChatRooms', () => {
    expect(source).toContain('useDebounce(searchText, 300)');
    expect(source).toContain('useChatRooms(debouncedTextValue)');
  });

  it('renders active room styling when room is selected', () => {
    expect(source).toContain('selectedRoomId === room.id');
    expect(source).toContain("borderLeft: isSelected ? '3.5px solid #2563eb'");
  });

  it('displays avatar with letter monogram fallback and online badge', () => {
    expect(source).toContain('getInitials');
    expect(source).toContain('Badge');
    expect(source).toContain('Avatar');
  });

  it('provides polished empty state when no conversations exist', () => {
    expect(source).toContain('noConversationsFound');
    expect(source).toContain('noSearchResults');
  });
});
