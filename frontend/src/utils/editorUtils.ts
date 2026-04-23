import {
  ContentState,
  convertFromHTML,
  convertToRaw,
  EditorState,
} from 'draft-js';
// @ts-expect-error No type declaration available for draftjs-to-html
import draftToHtml from 'draftjs-to-html';

const convertEditorStateToHTMLString = (editorState: EditorState): string => {
  if (!editorState?.getCurrentContent) return '';
  const rawContentState = convertToRaw(editorState.getCurrentContent());
  const markup = draftToHtml(rawContentState);
  return markup;
};

const createEditorStateFromHTMLString = (htmlString: string): EditorState => {
  if (!htmlString) {
    return EditorState.createEmpty();
  }
  const blocksFromHTML = convertFromHTML(htmlString);
  const content = ContentState.createFromBlockArray(
    blocksFromHTML.contentBlocks,
    blocksFromHTML.entityMap,
  );
  return EditorState.createWithContent(content);
};

export { convertEditorStateToHTMLString, createEditorStateFromHTMLString };
