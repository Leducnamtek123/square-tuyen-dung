import {
  convertEditorStateToHTMLString,
  createEditorStateFromHTMLString,
} from '../editorUtils';

type DraftJsMock = {
  ContentState: {
    createFromBlockArray: jest.Mock;
  };
  EditorState: {
    createEmpty: jest.Mock;
    createWithContent: jest.Mock;
  };
  convertFromHTML: jest.Mock;
  convertToRaw: jest.Mock;
};

jest.mock('draft-js', () => ({
  convertFromHTML: jest.fn(),
  convertToRaw: jest.fn(),
  ContentState: {
    createFromBlockArray: jest.fn(),
  },
  EditorState: {
    createEmpty: jest.fn(() => ({ kind: 'empty' })),
    createWithContent: jest.fn((content) => ({ kind: 'with-content', content })),
  },
}));

jest.mock('draftjs-to-html', () => jest.fn());

describe('editorUtils', () => {
  const draftJs = jest.requireMock('draft-js') as DraftJsMock;
  const draftToHtml = jest.requireMock('draftjs-to-html') as jest.Mock;
  const { ContentState, EditorState, convertFromHTML, convertToRaw } = draftJs;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes entityMap into createFromBlockArray when loading HTML', () => {
    (convertFromHTML as jest.Mock).mockReturnValue({
      contentBlocks: ['block-a', 'block-b'],
      entityMap: { 0: { type: 'IMAGE', data: { src: 'https://example.com/image.jpg' } } },
    });
    (ContentState.createFromBlockArray as jest.Mock).mockReturnValue({ contentState: true });

    const state = createEditorStateFromHTMLString(
      '<p>Before</p><p><img src="https://example.com/image.jpg" alt="Example" /></p>',
    );

    expect(convertFromHTML).toHaveBeenCalledTimes(1);
    expect(ContentState.createFromBlockArray).toHaveBeenCalledWith(
      ['block-a', 'block-b'],
      { 0: { type: 'IMAGE', data: { src: 'https://example.com/image.jpg' } } },
    );
    expect(EditorState.createWithContent).toHaveBeenCalledWith({ contentState: true });
    expect(state).toEqual({ kind: 'with-content', content: { contentState: true } });
  });

  it('converts editor state to html via draftjs-to-html', () => {
    const editorState = {
      getCurrentContent: jest.fn(() => ({ content: 'raw-content' })),
    } as unknown as ReturnType<typeof EditorState.createEmpty>;

    (convertToRaw as jest.Mock).mockReturnValue({ raw: true });
    (draftToHtml as jest.Mock).mockReturnValue('<p>hello</p>');

    const html = convertEditorStateToHTMLString(editorState as never);

    expect(convertToRaw).toHaveBeenCalledWith({ content: 'raw-content' });
    expect(draftToHtml).toHaveBeenCalledWith({ raw: true });
    expect(html).toBe('<p>hello</p>');
  });
});
