import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { useConfigStore } from '@/store/configStore'
import pt from './pt'
import en from './en'

const getInitialLanguage = (): string => {
  const stored = localStorage.getItem('venetia-config')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      return parsed.state?.config?.lingua ?? 'en'
    } catch (error) {
      return 'en'
    }
  }
  return 'en'
}

i18n.use(initReactI18next).init({
  resources: { pt: { translation: pt }, en: { translation: en } },
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

useConfigStore.subscribe((state) => {
  const linguaAtual = state.config.lingua
  if (i18n.language !== linguaAtual) {
    i18n.changeLanguage(linguaAtual)
  }
})

export default i18n