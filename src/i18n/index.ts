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
      // `lingua` é o nome antigo, de antes da renomeação PT → EN dos campos.
      return parsed.state?.config?.language ?? parsed.state?.config?.lingua ?? 'en'
    } catch {
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

type ConfigState = ReturnType<typeof useConfigStore.getState>

useConfigStore.subscribe((state: ConfigState) => {
  const currentLanguage = state.config?.language
  if (currentLanguage && i18n.language !== currentLanguage) {
    i18n.changeLanguage(currentLanguage)
  }
})

export default i18n