import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import bn from './locales/bn.json';
import { settingsStore } from '../store/settingsStore';

// Confirmed source languages: English (default) + Bengali, with UI text
// elsewhere mixing Urdu — string-table driven so `ur` (and others) can be
// added later just by dropping in a new locale file (Section 4.4).
export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'bn', label: 'বাংলা' },
] as const;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    bn: { translation: bn },
  },
  lng: settingsStore.getLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export function setAppLanguage(code: string) {
  settingsStore.setLanguage(code);
  i18n.changeLanguage(code);
}

export default i18n;
