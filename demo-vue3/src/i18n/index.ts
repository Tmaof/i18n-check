import { createI18n } from 'vue-i18n'
import translates from './locales/translates.json';


function genTranslates(){
    const zh: Record<string, string> = {};
    const en: Record<string, string> = {};
    Object.keys(translates).forEach(key => {
      const value = translates[key as keyof typeof translates];
      if (value.zh) {
        zh[key] = value.zh;
      }
      if (value.en) {
        en[key] = value.en;
      }
    });
    return {
      zh,
      en,
    };
  }

  const { zh, en } = genTranslates();

export const i18nPlugin = createI18n({
  locale:'zh',
  messages:{
    zh,
    en,
  }
})

export default i18nPlugin.global;
