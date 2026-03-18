declare module '@hookform/resolvers/yup' {
  export * from '@hookform/resolvers/yup/dist/yup';
}

declare module 'draftjs-to-html' {
  const draftToHtml: (raw: any) => string;
  export default draftToHtml;
}
