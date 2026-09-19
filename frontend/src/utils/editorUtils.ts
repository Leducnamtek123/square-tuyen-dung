// react-doctor-disable-next-line react-doctor/prefer-dynamic-import
import {
  ContentState,
  convertFromHTML,
  convertToRaw,
  EditorState,
} from 'draft-js';
// @ts-expect-error No type declaration available for draftjs-to-html
import draftToHtml from 'draftjs-to-html';

const convertEditorStateToHTMLString = (editorState: EditorState | string | null | undefined): string => {
  if (!editorState) return '';
  if (typeof editorState === 'string') return editorState;
  if (typeof editorState !== 'object' || !('getCurrentContent' in editorState) || typeof (editorState as any).getCurrentContent !== 'function') {
    return '';
  }
  try {
    const currentContent = editorState.getCurrentContent();
    if (!currentContent) return '';
    const rawContentState = convertToRaw(currentContent);
    const markup = draftToHtml(rawContentState);
    return typeof markup === 'string' ? markup : '';
  } catch (err) {
    console.error('[convertEditorStateToHTMLString] Error converting EditorState:', err);
    return '';
  }
};

const createEditorStateFromHTMLString = (htmlString?: string | null): EditorState => {
  if (!htmlString || typeof htmlString !== 'string') {
    return EditorState.createEmpty();
  }
  try {
    const blocksFromHTML = convertFromHTML(htmlString);
    if (!blocksFromHTML || !blocksFromHTML.contentBlocks || blocksFromHTML.contentBlocks.length === 0) {
      return EditorState.createEmpty();
    }
    const content = ContentState.createFromBlockArray(
      blocksFromHTML.contentBlocks,
      blocksFromHTML.entityMap || {},
    );
    return EditorState.createWithContent(content);
  } catch (err) {
    console.error('[createEditorStateFromHTMLString] Error parsing HTML to EditorState:', err);
    return EditorState.createEmpty();
  }
};

export { convertEditorStateToHTMLString, createEditorStateFromHTMLString };
