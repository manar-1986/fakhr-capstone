declare module 'i18n-js' {
  export interface I18nOptions {
    [locale: string]: any;
  }

  export class I18n {
    constructor(options: I18nOptions);
    defaultLocale: string;
    enableFallback: boolean;
    locale: string;
    t(key: string, options?: object): string;
  }

  const i18n: I18n;
  export default i18n;
}
