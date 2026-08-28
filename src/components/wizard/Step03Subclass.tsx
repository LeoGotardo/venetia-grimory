import { useTranslation } from 'react-i18next'
import { useFichaStore } from '../../store/fichaStore'
import { WizardNav } from './WizardNav'
import { Card } from '../ui/Card'
import { dados } from '../../data/dados'

function temEstiloDeLuta(classeId: string, nivel: number) {
  if (classeId === 'guerreiro') return nivel >= 1
  if (classeId === 'guardiao' || classeId === 'paladino') return nivel >= 2
  return false
}

function temOrdemDivina(classeId: string) { return classeId === 'clerigo' }
function temOrdemPrimal(classeId: string) { return classeId === 'druida' }
function temInimigoFavorito(classeId: string) { return classeId === 'guardiao' }

export function Step03Subclasse() {
  const { ficha, setSubclasse, setEscolhasDeClasse, setPasso } = useFichaStore()
  const { t } = useTranslation()
  const nivel = ficha.identidade.nivel
  const classeId = ficha.identidade.classe_id ?? ''
  const subclasseId = ficha.identidade.subclasse_id
  const cc = ficha.caracteristicas_de_classe
  const classe = dados.classes.find(c => c.id === classeId)

  const precisaSubclasse = nivel >= 3
  const precisaEstilo = temEstiloDeLuta(classeId, nivel)
  const precisaOrdemDivina = temOrdemDivina(classeId)
  const precisaOrdemPrimal = temOrdemPrimal(classeId)
  const precisaInimigoFavorito = temInimigoFavorito(classeId)

  const temAlgumaEscolha = precisaEstilo || precisaOrdemDivina || precisaOrdemPrimal || precisaInimigoFavorito

  const tudoOk =
    (!precisaSubclasse || !!subclasseId) &&
    (!precisaEstilo || !!cc.estilo_de_luta) &&
    (!precisaOrdemDivina || !!cc.ordem_divina) &&
    (!precisaOrdemPrimal || !!cc.ordem_primal) &&
    (!precisaInimigoFavorito || !!cc.inimigo_favorito)

  if (!precisaSubclasse && !temAlgumaEscolha) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">{t('step03.heading')}</h2>
        </div>
        <div className="bg-[#3D332D] border border-[#B8860B]/30 rounded-lg p-6 text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="font-cinzel text-lg text-[#F5F0E8] mb-2">{t('step03.lockedHeading')}</h3>
          <p className="text-[#A8A09B] text-sm">{t('step03.lockedDesc', { n: nivel })}</p>
        </div>
        <WizardNav onBack={() => setPasso(2)} onNext={() => setPasso(4)} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-bold text-[#F5F0E8] mb-1">{t('step03.heading')}</h2>
        {precisaSubclasse && <p className="text-[#A8A09B] text-sm">{t('step03.subtitle', { classe: classe?.nome })}</p>}
      </div>

      {precisaSubclasse && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {classe?.subclasses.map(sub => (
            <Card
              key={sub.id}
              selected={subclasseId === sub.id}
              hoverable
              onClick={() => setSubclasse(sub.id)}
            >
              <h3 className="font-cinzel font-bold text-[#F5F0E8] mb-1">{sub.nome}</h3>
              <p className="text-[#A8A09B] text-xs">{sub.descricao ?? t('step03.subtitle', { classe: classe.nome })}</p>
            </Card>
          ))}
        </div>
      )}

      {temAlgumaEscolha && (
        <div className="space-y-6">
          {precisaSubclasse && <hr className="border-[#B8860B]/20" />}
          <h3 className="font-cinzel text-lg font-semibold text-[#B8860B]">{t('step03.featuresHeading')}</h3>

          {precisaEstilo && (
            <EscolhaSecao
              heading={t('step03.estiloLutaHeading')}
              selecionado={cc.estilo_de_luta}
              opcoes={(dados.estilos_de_luta ?? []).map(e => ({ id: e.id, nome: e.nome, descricao: e.descricao }))}
              onSelect={id => setEscolhasDeClasse({ estilo_de_luta: id })}
            />
          )}

          {precisaOrdemDivina && (
            <EscolhaSecao
              heading={t('step03.ordemDivinaHeading')}
              selecionado={cc.ordem_divina}
              opcoes={(dados.ordens_divinas ?? []).map(o => ({ id: o.id, nome: o.nome, descricao: o.descricao }))}
              onSelect={id => setEscolhasDeClasse({ ordem_divina: id })}
            />
          )}

          {precisaOrdemPrimal && (
            <EscolhaSecao
              heading={t('step03.ordemPrimalHeading')}
              selecionado={cc.ordem_primal}
              opcoes={(dados.ordens_primais ?? []).map(o => ({ id: o.id, nome: o.nome, descricao: o.descricao }))}
              onSelect={id => setEscolhasDeClasse({ ordem_primal: id })}
            />
          )}

          {precisaInimigoFavorito && (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-[#F5F0E8]">{t('step03.inimigoFavoritoHeading')}</p>
                <p className="text-xs text-[#A8A09B] mt-1">{t('step03.inimigoFavoritoHint')}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(dados.inimigos_favoritos ?? []).map(inf => (
                  <button
                    key={inf.id}
                    onClick={() => setEscolhasDeClasse({ inimigo_favorito: inf.id })}
                    className={`px-3 py-2 rounded border text-sm font-medium transition-colors cursor-pointer text-left
                      ${cc.inimigo_favorito === inf.id
                        ? 'bg-[#4D2020] border-[#7B1D1D] text-[#F5F0E8]'
                        : 'border-[#B8860B]/30 text-[#A8A09B] hover:bg-[#3D332D] hover:text-[#F5F0E8]'}`}
                  >
                    {inf.nome}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <WizardNav onBack={() => setPasso(2)} onNext={() => setPasso(4)} nextDisabled={!tudoOk} />
    </div>
  )
}

interface EscolhaSecaoProps {
  heading: string
  selecionado: string | null
  opcoes: { id: string; nome: string; descricao: string }[]
  onSelect: (id: string) => void
}

function EscolhaSecao({ heading, selecionado, opcoes, onSelect }: EscolhaSecaoProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[#F5F0E8]">{heading}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {opcoes.map(op => (
          <Card
            key={op.id}
            selected={selecionado === op.id}
            hoverable
            onClick={() => onSelect(op.id)}
          >
            <p className="font-cinzel font-bold text-[#F5F0E8] text-sm mb-1">{op.nome}</p>
            <p className="text-[#A8A09B] text-xs leading-relaxed">{op.descricao}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
