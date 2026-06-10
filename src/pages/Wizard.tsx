import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useFichaStore } from '../store/fichaStore'
import { WizardProgressBar } from '../components/wizard/WizardProgressBar'
import { Step01Nivel } from '../components/wizard/Step01Nivel'
import { Step02Classe } from '../components/wizard/Step02Classe'
import { Step03Subclasse } from '../components/wizard/Step03Subclasse'
import { Step04Especie } from '../components/wizard/Step04Especie'
import { Step05Antecedente } from '../components/wizard/Step05Antecedente'
import { Step06Atributos } from '../components/wizard/Step06Atributos'
import { Step07Pericias } from '../components/wizard/Step07Pericias'
import { Step08Idiomas } from '../components/wizard/Step08Idiomas'
import { Step09Equipamento } from '../components/wizard/Step09Equipamento'
import { Step10Personalidade } from '../components/wizard/Step10Personalidade'
import { Step11Revisar } from '../components/wizard/Step11Revisar'

const COMPONENTES = [
  Step01Nivel, Step02Classe, Step03Subclasse, Step04Especie, Step05Antecedente,
  Step06Atributos, Step07Pericias, Step08Idiomas, Step09Equipamento, Step10Personalidade, Step11Revisar,
]

export function Wizard() {
  const { passoAtual, setPasso, novaFicha, fichaId } = useFichaStore()

  useEffect(() => {
    if (!fichaId) novaFicha()
  }, [])

  // Scroll ao topo ao trocar step — novo conteúdo começa do início
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [passoAtual])

  const StepComponent = COMPONENTES[passoAtual - 1]

  return (
    <div className="min-h-screen bg-[#2D2520] flex flex-col">
      <WizardProgressBar atual={passoAtual} onJump={n => n <= passoAtual && setPasso(n)} />
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={passoAtual}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.2 }}
          >
            <StepComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
