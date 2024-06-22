import { SecurityContext } from '@angular/core';
import { MarkedOptions } from 'ngx-markdown';

declare var Prism: any;

export function markedOptionsFactory(): MarkedOptions {
  return {
    gfm: true,
    breaks: false,
    pedantic: false,
    smartLists: true,
    smartypants: false,
    highlight: function (code: string, lang: string) {
      if (Prism && Prism.languages[lang]) {
        try {
          return Prism.highlight(code, Prism.languages[lang], lang);
        } catch (e) {
          console.error(e);
        }
      }
      return code;
    }
  };
}

export const markdownConfig = {
  sanitize: SecurityContext.NONE,
  markedOptions: {
    provide: MarkedOptions,
    useFactory: markedOptionsFactory,
  },
};
