import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ptTranslations from './locales/pt.json';
import enTranslations from './locales/en.json';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: ptTranslations },
      en: { translation: enTranslations },
    },
    lng: 'pt', // Define explicitamente o idioma padrão como português
    fallbackLng: 'pt',
    debug: process.env.NODE_ENV === 'development', // Ativa o debug apenas em desenvolvimento
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
