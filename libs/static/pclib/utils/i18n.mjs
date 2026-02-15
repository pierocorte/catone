import i18next from 'i18next'
import Backend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

await i18next
    .use(Backend)
    .use(LanguageDetector)
    .init({
        lng: 'it',
        fallbackLng: 'en',
        debug: false,
        backend: {
            loadPath: '/locales/{{lng}}/translation.json'
        }
    });

// i18next.changeLanguage('en')

export default i18next
