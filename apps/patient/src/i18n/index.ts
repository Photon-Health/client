import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import es from './locales/es';
import zh from './locales/zh';
import ru from './locales/ru';
import my from './locales/my';

export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { code: 'zh', label: 'Mandarin', nativeLabel: '中文' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский' },
  { code: 'my', label: 'Burmese', nativeLabel: 'မြန်မာ' }
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

const STORAGE_KEY = 'photon-language';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    zh: { translation: zh },
    ru: { translation: ru },
    my: { translation: my }
  },
  lng: (localStorage.getItem(STORAGE_KEY) as LanguageCode | null) ?? 'my',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});

export function setLanguage(code: LanguageCode) {
  localStorage.setItem(STORAGE_KEY, code);
  i18n.changeLanguage(code);
}

export default i18n;
