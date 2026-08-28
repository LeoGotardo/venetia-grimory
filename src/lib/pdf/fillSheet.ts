import { PDFDocument, PDFName, StandardFonts, rgb } from 'pdf-lib'
import type { PDFFont, PDFPage, PDFTextField } from 'pdf-lib'
import i18n from '../../i18n'
import { CAMPOS } from './camposFicha'
import { dados } from '../../data/dados'
import { getAntecedentes } from '../../data/antecedentes'
import { getItens } from '../../data/itens'
import { resolverMagia } from '../../data/magias'
import { ATRIBUTOS, calcPercepcaoPassiva, formatModificador } from '../calculos'
import type { Ficha, ItemInventario } from '../../types'

/**
 * `exportar` preenche tudo e achata o resultado (PDF final, não editável).
 * `imprimir` deixa em branco o que muda em jogo, para ser escrito a lápis, e
 * mantém o formulário editável.
 *
 * O que é "muda em jogo" foi cruzado com três fontes:
 *
 * 1. as regras de 2024 — Descanso Longo devolve todos os PV e **todos** os dados
 *    de vida gastos (mudou em relação a 2014, que devolvia metade), e Descanso
 *    Curto é onde se *gastam* dados de vida;
 * 2. o desenho da própria ficha — só são medidores as caixas que vêm em par
 *    (ATUAL/TEMP · GASTO/max · Total/Gastos), mais SUCESSOS/FALHAS, EXP,
 *    INSPIRAÇÃO HERÓICA e MOEDAS. As demais caixas são valores fixos;
 * 3. as ações do store — o que `descansoLongo`/`descansoCurto` restauram e o que
 *    `atualizarPV`, `gastarDadoVida`, `gastarEspaco`, `updateMoedas` e `addXP`
 *    alteram fora do wizard.
 *
 * Resultado: ficam em branco no modo `imprimir` os PV atual e temporário, os
 * dados de vida gastos, o XP, os espaços de magia gastos e as moedas.
 *
 * Nunca são preenchidos, em modo nenhum, por não existirem no modelo de dados:
 * salvaguardas contra a morte, inspiração heroica e sintonização de itens.
 *
 * Dos recursos de classe (fúrias, pontos de foco, …) sai só o **máximo**, que é
 * derivado do nível; o valor atual é gasto em jogo e fica de fora.
 */
export type ModoFichaPdf = 'imprimir' | 'exportar'

interface Preenchimento {
  textos: Array<{ campo: string; valor: string }>
  marcas: string[]
}

const TAMANHO_FONTE = 8
const TAMANHO_FONTE_MINIMO = 5

const CATEGORIAS_ARMADURA: Record<keyof typeof CAMPOS.treino_armadura, string[]> = {
  leve: ['leve', 'light'],
  media: ['média', 'media', 'medium'],
  pesada: ['pesada', 'heavy'],
  escudos: ['escudo', 'escudos', 'shield', 'shields'],
}

/** Recursos de classe: só o máximo entra na ficha — o atual muda a cada descanso. */
const RECURSOS_DE_CLASSE: Array<[keyof Recursos, string, (r: Recursos) => number | null]> = [
  ['furias', 'resources.furias', r => r.furias.maximo],
  ['inspiracao_de_bardo', 'resources.inspiracaoBardo', r => r.inspiracao_de_bardo.maximo],
  ['canalizar_divindade', 'resources.canalizarDivindade', r => r.canalizar_divindade.maximo],
  ['formas_selvagens', 'resources.formasSelvagens', r => r.formas_selvagens.maximo],
  ['pontos_de_feiticaria', 'resources.pontosFeiticaria', r => r.pontos_de_feiticaria.maximo],
  ['pontos_de_foco', 'resources.pontosFoco', r => r.pontos_de_foco.maximo],
  ['surto_de_acao', 'resources.surtoAcao', r => r.surto_de_acao.usos],
  ['recuperar_folego', 'resources.recuperarFolego', r => r.recuperar_folego.maximo],
  ['imposicao_de_maos', 'resources.imposicaoMaos', r => r.imposicao_de_maos.pool_pv],
]

type Recursos = Ficha['caracteristicas_de_classe']['recursos_de_classe']

function nomeDoItem(item: ItemInventario): string {
  if (item.nome) return item.nome
  const catalogo = getItens().find(i => i.id === item.id_item)
  return catalogo?.nome ?? item.id_item ?? '?'
}

function montarPreenchimento(ficha: Ficha, modo: ModoFichaPdf): Preenchimento {
  const textos: Preenchimento['textos'] = []
  const marcas: Preenchimento['marcas'] = []
  const completo = modo === 'exportar'

  const texto = (campo: string, valor: unknown) => {
    if (valor === null || valor === undefined || valor === '') return
    textos.push({ campo, valor: String(valor) })
  }
  /** Só sai no modo `exportar`; no modo `imprimir` fica em branco. */
  const volatil = (campo: string, valor: unknown) => {
    if (completo) texto(campo, valor)
  }
  const marca = (campo: string, ligado: boolean | null | undefined) => {
    if (ligado) marcas.push(campo)
  }
  const marcaVolatil = (campos: readonly string[], quantidade: number) => {
    if (!completo) return
    for (const campo of campos.slice(0, quantidade)) marcas.push(campo)
  }
  const lista = (itens: Array<string | null | undefined>) =>
    itens.filter(Boolean).join('\n')

  const { identidade, combate, magia, inventario, personalidade, proficiencias } = ficha

  // ---- identidade
  const multiclasses = identidade.multiclasses ?? []
  const classe = dados.classes.find(c => c.id === identidade.classe_id)
  const especie = dados.especies?.find(e => e.id === identidade.especie_id)
  const antecedente = getAntecedentes().find(a => a.id === identidade.antecedente_id)
  const subclasse = classe?.subclasses.find(s => s.id === identidade.subclasse_id)
  const nivelPrimaria = identidade.nivel - multiclasses.reduce((soma, m) => soma + m.nivel, 0)
  const classesSecundarias = multiclasses.map(m => ({
    classe: dados.classes.find(c => c.id === m.classe_id),
    nivel: m.nivel,
  }))

  texto(CAMPOS.identidade.nome, identidade.nome_personagem)
  texto(CAMPOS.identidade.origem, antecedente?.nome)
  texto(
    CAMPOS.identidade.classe,
    multiclasses.length === 0
      ? classe?.nome
      : [
          `${classe?.nome ?? '?'} ${nivelPrimaria}`,
          ...classesSecundarias.map(m => `${m.classe?.nome ?? '?'} ${m.nivel}`),
        ].join(' / '),
  )
  const linhagem = especie?.linhagens?.find(l => l.id === identidade.linhagem_id)
  texto(CAMPOS.identidade.especie, linhagem ? `${especie?.nome} (${linhagem.nome})` : especie?.nome)
  texto(
    CAMPOS.identidade.subclasse,
    [
      subclasse?.nome,
      ...multiclasses.map(m => {
        const mc = dados.classes.find(c => c.id === m.classe_id)
        return mc?.subclasses.find(s => s.id === m.subclasse_id)?.nome
      }),
    ]
      .filter(Boolean)
      .join(' / '),
  )
  texto(CAMPOS.identidade.nivel, identidade.nivel)
  volatil(CAMPOS.identidade.exp, identidade.xp)

  // ---- combate
  const dadosDeVida = combate.dados_de_vida
  texto(CAMPOS.combate.classe_armadura, combate.classe_de_armadura.valor)
  marca(CAMPOS.combate.escudo, combate.classe_de_armadura.escudo_equipado)
  texto(CAMPOS.combate.pv_maximo, combate.pontos_de_vida.maximo)
  volatil(CAMPOS.combate.pv_atual, combate.pontos_de_vida.atual)
  volatil(CAMPOS.combate.pv_temporario, combate.pontos_de_vida.temporario || null)
  texto(
    CAMPOS.combate.dados_vida_maximo,
    dadosDeVida.total ? `${dadosDeVida.total}${dadosDeVida.tipo ?? ''}` : null,
  )
  volatil(CAMPOS.combate.dados_vida_gastos, dadosDeVida.gastos || null)
  texto(CAMPOS.combate.bonus_proficiencia, formatModificador(combate._bonus_proficiencia))
  texto(CAMPOS.combate.iniciativa, formatModificador(combate.iniciativa._valor))
  texto(
    CAMPOS.combate.deslocamento,
    combate.deslocamento._total_metros ? `${combate.deslocamento._total_metros} m` : null,
  )
  texto(CAMPOS.combate.tamanho, especie?.tamanho)
  texto(
    CAMPOS.combate.percepcao_passiva,
    calcPercepcaoPassiva(ficha.pericias.percepcao?._valor ?? 0),
  )

  // ---- atributos, salvaguardas e perícias
  for (const atributo of ATRIBUTOS) {
    const campos = CAMPOS.atributos[atributo]
    const salvaguarda = combate.salvaguardas[atributo]
    texto(campos.modificador, formatModificador(ficha.atributos[atributo]._modificador))
    texto(campos.valor, ficha.atributos[atributo].valor)
    texto(campos.salvaguarda, formatModificador(salvaguarda?._valor ?? null))
    marca(campos.salvaguarda_proficiencia, salvaguarda?.proficiente)
  }

  for (const [id, campos] of Object.entries(CAMPOS.pericias)) {
    const pericia = ficha.pericias[id]
    if (!pericia) continue
    texto(campos.bonus, formatModificador(pericia._valor))
    marca(campos.proficiencia, pericia.proficiente || pericia.expertise)
  }

  // ---- ataques (a ficha tem 6 linhas)
  combate.ataques.slice(0, CAMPOS.ataques.length).forEach((ataque, i) => {
    const linha = CAMPOS.ataques[i]
    texto(linha.nome, ataque.nome)
    texto(linha.bonus, formatModificador(ataque._bonus_ataque))
    texto(linha.dano, [ataque._dano, ataque.tipo_dano].filter(Boolean).join(' '))
    texto(linha.anotacoes, ataque.notas)
  })

  // ---- características, talentos e proficiências
  const recursos = ficha.caracteristicas_de_classe.recursos_de_classe
  const caracteristicas = [
    ...ficha.caracteristicas_de_classe.ativas.map(c => c.nome),
    ...RECURSOS_DE_CLASSE.flatMap(([, chave, maximo]) => {
      const total = maximo(recursos)
      return total ? [`${i18n.t(chave)}: ${total}`] : []
    }),
  ]
  const meio = Math.ceil(caracteristicas.length / 2)
  texto(CAMPOS.textos.caracteristicas_classe_esquerda, lista(caracteristicas.slice(0, meio)))
  texto(CAMPOS.textos.caracteristicas_classe_direita, lista(caracteristicas.slice(meio)))
  texto(
    CAMPOS.textos.caracteristicas_especie,
    lista(ficha.tracos_de_especie.tracos_ativos.map(t => t.nome)),
  )
  texto(CAMPOS.textos.talentos, lista(ficha.talentos.lista.map(t => t.nome)))
  texto(CAMPOS.textos.proficiencia_armas, proficiencias.armas.join(', '))
  texto(CAMPOS.textos.proficiencia_ferramentas, proficiencias.ferramentas.join(', '))

  const armaduras = proficiencias.armaduras.map(a => a.toLowerCase())
  for (const [categoria, campo] of Object.entries(CAMPOS.treino_armadura)) {
    const nomes = CATEGORIAS_ARMADURA[categoria as keyof typeof CAMPOS.treino_armadura]
    marca(campo, armaduras.some(a => nomes.includes(a)))
  }

  // ---- magia
  if (magia.conjurador) {
    const atributo = magia.atributo_conjuracao
    // no idioma da interface, para casar com o modelo escolhido
    texto(CAMPOS.magia.atributo_conjuracao, atributo ? i18n.t(`attrs.${atributo}`) : null)
    texto(
      CAMPOS.magia.modificador_conjuracao,
      atributo ? formatModificador(ficha.atributos[atributo]._modificador) : null,
    )
    texto(CAMPOS.magia.cd_magia, magia._cd_magia)
    texto(CAMPOS.magia.bonus_ataque_magia, formatModificador(magia._bonus_ataque_magia))

    CAMPOS.espacos_de_magia.forEach((celula, i) => {
      const espaco = magia.espacos_de_magia[`c${i + 1}` as keyof typeof magia.espacos_de_magia]
      if (!espaco?.maximo) return
      texto(celula.total, espaco.maximo)
      marcaVolatil(celula.gastos, espaco.gastos)
    })

    const nomesDeMagias = [
      ...Object.values(magia.truques_por_classe).flat(),
      ...Object.values(magia.magias_por_classe).flat(),
    ]
    const preparadas = [...new Set(nomesDeMagias)]
      .map(nome => resolverMagia(nome))
      .filter((m): m is NonNullable<typeof m> => m !== null)
      .sort((a, b) => a.circulo - b.circulo || a.nome.localeCompare(b.nome))

    preparadas.slice(0, CAMPOS.magias.length).forEach((m, i) => {
      const linha = CAMPOS.magias[i]
      texto(linha.nivel, m.circulo)
      texto(linha.nome, m.nome)
      texto(linha.tempo_conjuracao, m.tempo_conjuracao)
      texto(linha.alcance, m.alcance)
      marca(linha.concentracao, m.concentracao)
      marca(linha.ritual, m.ritual)
      marca(linha.material, m.componentes?.includes('M'))
      texto(linha.anotacoes, [m.dano, m.tipo_dano].filter(Boolean).join(' ') || m.duracao)
    })
  }

  // ---- inventário e perfil
  texto(
    CAMPOS.perfil.equipamento,
    lista(
      inventario.itens.map(item =>
        item.quantidade > 1 ? `${item.quantidade}× ${nomeDoItem(item)}` : nomeDoItem(item),
      ),
    ),
  )
  for (const [moeda, campo] of Object.entries(CAMPOS.moedas)) {
    volatil(campo, inventario.moedas[moeda as keyof typeof inventario.moedas] || null)
  }

  texto(CAMPOS.perfil.aparencia, personalidade.aparencia_descricao)
  texto(
    CAMPOS.perfil.historia_personalidade,
    lista([
      personalidade.historia,
      ...personalidade.tracos,
      ...personalidade.ideais,
      ...personalidade.vinculos,
      ...personalidade.fraquezas,
    ]),
  )
  texto(
    CAMPOS.perfil.alinhamento,
    [identidade.alinhamento.etico, identidade.alinhamento.moral].filter(Boolean).join(' '),
  )
  texto(CAMPOS.perfil.idiomas, proficiencias.idiomas.join(', '))

  return { textos, marcas }
}

/**
 * As caixas de seleção do modelo têm aparência quebrada (o estado marcado
 * desenha um glifo numa fonte que o widget não declara), então o ponto é
 * desenhado direto na página em vez de usar `check()`.
 */
function desenharMarcas(pdf: PDFDocument, marcas: string[], achatar: boolean) {
  const form = pdf.getForm()
  const paginas = pdf.getPages()
  const paginaDoWidget = new Map<string, PDFPage>()
  paginas.forEach(pagina => {
    const annots = pagina.node.Annots()
    if (!annots) return
    for (let i = 0; i < annots.size(); i++) paginaDoWidget.set(annots.get(i).toString(), pagina)
  })

  for (const nome of marcas) {
    const caixa = form.getCheckBox(nome)
    for (const widget of caixa.acroField.getWidgets()) {
      const rect = widget.getRectangle()
      const pagina = paginaDoWidget.get(pdf.context.getObjectRef(widget.dict)?.toString() ?? '')
      pagina?.drawCircle({
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
        size: Math.min(rect.width, rect.height) * 0.38,
        color: rgb(0.1, 0.1, 0.1),
      })
    }
  }

  // O achatamento herda a aparência quebrada das caixas; como as marcas já
  // foram desenhadas, os campos podem sair do documento.
  if (achatar) {
    for (const campo of form.getFields()) {
      if (campo.constructor.name === 'PDFCheckBox') form.removeField(campo)
    }
  }
}

/** O modelo fixa 8pt; em campo estreito o texto é reduzido para não sair cortado. */
function ajustarTamanhoDaFonte(campo: PDFTextField, valor: string, fonte: PDFFont) {
  const widget = campo.acroField.getWidgets()[0]
  if (!widget) return
  const disponivel = widget.getRectangle().width - 4
  const necessario = fonte.widthOfTextAtSize(valor, TAMANHO_FONTE)
  if (necessario <= disponivel) return
  const proporcional = (TAMANHO_FONTE * disponivel) / necessario
  campo.setFontSize(Math.max(TAMANHO_FONTE_MINIMO, Math.floor(proporcional * 10) / 10))
  // Cada widget do modelo traz um /DA próprio, que venceria o do campo.
  for (const w of campo.acroField.getWidgets()) w.dict.delete(PDFName.of('DA'))
}

/** Preenche o modelo oficial com os dados da ficha e devolve o PDF resultante. */
export async function preencherFichaPdf(
  ficha: Ficha,
  modo: ModoFichaPdf,
  modelo: ArrayBuffer,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(modelo)
  const form = pdf.getForm()
  const fonte = await pdf.embedFont(StandardFonts.Helvetica)
  const { textos, marcas } = montarPreenchimento(ficha, modo)

  for (const { campo, valor } of textos) {
    const campoTexto = form.getTextField(campo)
    campoTexto.setText(valor)
    if (!campoTexto.isMultiline()) ajustarTamanhoDaFonte(campoTexto, valor, fonte)
  }
  form.updateFieldAppearances(fonte)

  const achatar = modo === 'exportar'
  desenharMarcas(pdf, marcas, achatar)
  if (achatar) form.flatten()

  return pdf.save()
}
