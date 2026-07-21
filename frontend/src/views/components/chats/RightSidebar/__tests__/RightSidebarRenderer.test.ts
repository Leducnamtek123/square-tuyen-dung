import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import RightSidebarRenderer from '../RightSidebarRenderer';
import { useRightSidebarData } from '../useRightSidebarData';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('../../../../../components/Common/MuiImageCustom', () => ({
  __esModule: true,
  default: ({ src }: { src?: string }) => React.createElement('img', {
    alt: 'contact',
    ...(src ? { src } : {}),
  }),
}));

jest.mock('../useRightSidebarData', () => ({
  useRightSidebarData: jest.fn(),
}));

const mockUseRightSidebarData = jest.mocked(useRightSidebarData);

describe('RightSidebarRenderer', () => {
  it('disables chat action when the contact has no user id', () => {
    const handleAddRoom = jest.fn();
    mockUseRightSidebarData.mockReturnValue({
      isLoading: false,
      dataList: [{ id: 'activity-1', userId: '', fullName: 'Manual Candidate' }],
      page: 1,
      setPage: jest.fn(),
      count: 1,
      handleAddRoom,
      pageSize: 12,
      isContextReady: true,
    });

    const html = renderToStaticMarkup(React.createElement(RightSidebarRenderer, {
      titleKey: 'candidates',
      noDataKey: 'noCandidates',
      fetchData: jest.fn(),
      mapDataToUI: (value: { id: string; userId: string; fullName: string }) => ({
        id: value.id,
        imageUrl: '',
        primaryText: value.fullName,
        secondaryText: 'Manual candidate',
        partnerId: value.userId,
        userDataWrapper: {
          userId: value.userId,
          name: value.fullName,
        },
      }),
    }));

    expect(html).toContain('disabled=""');
    expect(handleAddRoom).not.toHaveBeenCalled();
  });
});
