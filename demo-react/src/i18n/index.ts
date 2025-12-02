import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
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

i18n.use(initReactI18next).init({
  lng: 'zh',
  fallbackLng: 'zh',
  resources: {
    zh: {
      translation: zh,
    },
    en: {
      translation: en,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
