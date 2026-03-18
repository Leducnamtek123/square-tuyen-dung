import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    hot: Palette['primary'];
  }
  interface PaletteOptions {
    hot?: PaletteOptions['primary'];
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
  interface Theme {
    customShadows: {
      small: string;
      medium: string;
      large: string;
      card: string;
    };
  }
  interface ThemeOptions {
    customShadows?: {
      small?: string;
      medium?: string;
      large?: string;
      card?: string;
    };
  }
}

declare module 'js-cookie' {
  export interface CookieAttributes {
    [key: string]: any;
  }

  const Cookies: {
    get: (name: string) => string | undefined;
    set: (name: string, value: string, options?: CookieAttributes) => void;
    remove: (name: string, options?: CookieAttributes) => void;
  };

  export default Cookies;
}

declare module 'draft-js' {
  export type EditorState = any;
  export const EditorState: any;
  export const ContentState: any;
  export const convertFromHTML: any;
  export const convertToRaw: any;
}

declare module 'draftjs-to-html';
declare module 'react-color';

declare module '@hookform/resolvers/*' {
  export const yupResolver: any;
}

declare module '@hookform/resolvers/yup' {
  export const yupResolver: any;
}

declare module '@fortawesome/*' {
  export const FontAwesomeIcon: any;
  export const faEye: any;
  export const faFile: any;
  export const faFilePdf: any;
  export const faCalendarDays: any;
  export const faCircleDollarToSlot: any;
  export const faLocationDot: any;
  export const faFire: any;
  export const faBolt: any;
  export const faClock: any;
}
