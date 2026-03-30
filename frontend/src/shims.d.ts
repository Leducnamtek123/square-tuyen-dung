import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    hot: Palette['primary'];
    feedback: {
      button: {
        background: string;
        shadow: string;
        hover: string;
      };
      dialog: {
        border: string;
      };
    };
  }
  interface PaletteOptions {
    hot?: PaletteOptions['primary'];
    feedback?: {
      button: {
        background: string;
        shadow: string;
        hover: string;
      };
      dialog: {
        border: string;
      };
    };
  }
  interface PaletteColor {
    background?: string;
    backgroundHover?: string;
    gradient?: string;
  }
  interface SimplePaletteColorOptions {
    background?: string;
    backgroundHover?: string;
    gradient?: string;
  }
  interface TypeText {
    placeholder?: string;
    italic?: React.CSSProperties | Record<string, unknown>;
  }
  interface Theme {
    customShadows: {
      small: string;
      medium: string;
      large: string;
      card: string;
      feedback: string;
    };
  }
  interface ThemeOptions {
    customShadows?: {
      small?: string;
      medium?: string;
      large?: string;
      card?: string;
      feedback?: string;
    };
  }
}

declare module 'js-cookie' {
  export interface CookieAttributes {
    [key: string]: unknown;
  }

  const Cookies: {
    get: (name: string) => string | undefined;
    set: (name: string, value: string, options?: CookieAttributes) => void;
    remove: (name: string, options?: CookieAttributes) => void;
  };

  export default Cookies;
}

declare module 'draft-js' {
  import type { ComponentType } from 'react';
  export interface EditorState {
    getCurrentContent(): ContentState;
    getSelection(): SelectionState;
  }
  export interface ContentState {
    getPlainText(delimiter?: string): string;
    hasText(): boolean;
  }
  export interface SelectionState {
    isCollapsed(): boolean;
  }
  export const EditorState: {
    createEmpty(): EditorState;
    createWithContent(content: ContentState): EditorState;
    push(editorState: EditorState, contentState: ContentState, changeType: string): EditorState;
  };
  export const ContentState: {
    createFromText(text: string): ContentState;
    createFromBlockArray(blocks: unknown[]): ContentState;
  };
  export function convertFromHTML(html: string): { contentBlocks: unknown[]; entityMap: unknown };
  export function convertToRaw(contentState: ContentState): Record<string, unknown>;
}

declare module 'draftjs-to-html' {
  const draftToHtml: (raw: Record<string, unknown>) => string;
  export default draftToHtml;
}

declare module 'react-color' {
  import type { ComponentType } from 'react';
  interface ColorResult {
    hex: string;
    rgb: { r: number; g: number; b: number; a: number };
    hsl: { h: number; s: number; l: number; a: number };
  }
  interface ColorPickerProps {
    color?: string | { r: number; g: number; b: number; a?: number };
    onChange?: (color: ColorResult) => void;
    onChangeComplete?: (color: ColorResult) => void;
    disableAlpha?: boolean;
    width?: string | number;
    className?: string;
    styles?: Record<string, unknown>;
  }
  export const SketchPicker: ComponentType<ColorPickerProps>;
  export const ChromePicker: ComponentType<ColorPickerProps>;
  export const CompactPicker: ComponentType<ColorPickerProps>;
  export const BlockPicker: ComponentType<ColorPickerProps>;
}

declare module 'mui-file-dropzone' {
  import type { ComponentType } from 'react';
  interface MuiFileDropzoneProps {
    acceptedFiles?: string[];
    maxFileSize?: number;
    filesLimit?: number;
    onChange?: (files: File[]) => void;
    onDelete?: (file: File) => void;
    showPreviews?: boolean;
    showPreviewsInDropzone?: boolean;
    [key: string]: unknown;
  }
  export const MuiFileDropzone: ComponentType<MuiFileDropzoneProps>;
}

declare module 'react-draft-wysiwyg' {
  import type { ComponentType } from 'react';
  interface EditorProps {
    editorState?: unknown;
    onEditorStateChange?: (state: unknown) => void;
    toolbar?: Record<string, unknown>;
    wrapperClassName?: string;
    editorClassName?: string;
    toolbarClassName?: string;
    placeholder?: string;
    readOnly?: boolean;
    [key: string]: unknown;
  }
  export const Editor: ComponentType<EditorProps>;
}

declare module 'mui-image' {
  import type { ComponentType } from 'react';
  interface MuiImageProps {
    src: string;
    alt?: string;
    width?: string | number;
    height?: string | number;
    fit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    duration?: number;
    easing?: string;
    showLoading?: boolean;
    errorIcon?: boolean;
    shift?: 'top' | 'bottom' | 'left' | 'right' | null;
    shiftDuration?: number;
    className?: string;
    style?: React.CSSProperties;
    [key: string]: unknown;
  }
  const Image: ComponentType<MuiImageProps>;
  export default Image;
}


declare module '@fortawesome/react-fontawesome' {
  import type { ComponentType } from 'react';
  import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
  interface FontAwesomeIconProps {
    icon: IconDefinition;
    size?: 'xs' | 'sm' | 'lg' | '1x' | '2x' | '3x' | '4x' | '5x';
    color?: string;
    className?: string;
    spin?: boolean;
    pulse?: boolean;
    fixedWidth?: boolean;
    style?: React.CSSProperties;
    [key: string]: unknown;
  }
  export const FontAwesomeIcon: ComponentType<FontAwesomeIconProps>;
}

declare module '@fortawesome/free-solid-svg-icons' {
  import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
  export const faEye: IconDefinition;
  export const faFile: IconDefinition;
  export const faFilePdf: IconDefinition;
  export const faCalendarDays: IconDefinition;
  export const faCircleDollarToSlot: IconDefinition;
  export const faLocationDot: IconDefinition;
  export const faFire: IconDefinition;
  export const faBolt: IconDefinition;
  export const faClock: IconDefinition;
}

declare module '@fortawesome/fontawesome-svg-core' {
  export interface IconDefinition {
    prefix: string;
    iconName: string;
    icon: [number, number, string[], string, string | string[]];
  }
}
