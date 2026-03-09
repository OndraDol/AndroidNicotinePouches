import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import cs from './locales/cs.json';
import en from './locales/en.json';

const resources = {
    en: { translation: en },
    cs: { translation: cs },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: getLocales()[0]?.languageCode === 'cs' ? 'cs' : 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
