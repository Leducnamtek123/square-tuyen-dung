import {
  ContentState,
  convertFromHTML,
  convertToRaw,
  EditorState,
} from 'draft-js';
import draftToHtml from 'draftjs-to-html';

const convertEditorStateToHTMLString = (editorState) => {
  if (!editorState?.getCurrentContent) return '';
  const rawContentState = convertToRaw(editorState.getCurrentContent());
  const markup = draftToHtml(rawContentState);
  return markup;
};

const createEditorStateFromHTMLString = (htmlString) => {
  if (!htmlString) {
    return EditorState.createEmpty();
  }
  const blocksFromHTML = convertFromHTML(htmlString);
  const content = ContentState.createFromBlockArray(
    blocksFromHTML.contentBlocks,
    blocksFromHTML.entityMap
  );
  return EditorState.createWithContent(content);
};

export {
  convertEditorStateToHTMLString,
  createEditorStateFromHTMLString,
};
