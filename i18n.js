import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './i18n/en.json';
import fr from './i18n/fr.json';
import es from './i18n/es.json';

i18n
  .use(LanguageDetector) // Detect the user's language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      es: { translation: es },
    },
    fallbackLng: 'en', // Default language
    interpolation: {
      escapeValue: false, // React already handles escaping
    },
  });

export default i18n;
