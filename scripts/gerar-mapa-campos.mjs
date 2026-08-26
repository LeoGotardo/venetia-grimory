// Uso pontual: transforma o dump de extrair-campos.mjs em src/lib/pdf/camposFicha.ts.
// O modelo usa nomes de campo gerados por máquina (text_1aoob, checkbox_148cprb...),
// então cada campo é identificado por página + posição e recebe aqui uma chave semântica.
import { readFileSync, writeFileSync } from 'node:fs';

const campos = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const usados = new Set();
const TOL = 3;

function um(pagina, x, yTop) {
  const achados = campos.filter(
    (c) => c.pagina === pagina && Math.abs(c.x - x) <= TOL && Math.abs(c.yTop - yTop) <= TOL,
  );
  if (achados.length !== 1) {
    throw new Error(`p${pagina} (${x},${yTop}): ${achados.length} campos — ${achados.map((c) => c.nome)}`);
  }
  usados.add(achados[0].nome);
  return achados[0].nome;
}

function regiao({ pagina, tipo, xMin = -Infinity, xMax = Infinity, yMin = -Infinity, yMax = Infinity }) {
  return campos.filter(
    (c) => c.pagina === pagina && (!tipo || c.tipo === tipo) &&
      c.x >= xMin && c.x <= xMax && c.yTop >= yMin && c.yTop <= yMax,
  );
}

// clusters widgets into visual rows (their y differs by a point or two across columns)
function linhas(lista, folga = 6) {
  const linhas = [];
  for (const c of [...lista].sort((a, b) => a.yTop - b.yTop)) {
    const ultima = linhas.at(-1);
    if (ultima && c.yTop - ultima.y <= folga) ultima.itens.push(c);
    else linhas.push({ y: c.yTop, itens: [c] });
  }
  return linhas.map((l) => l.itens.sort((a, b) => a.x - b.x));
}

function marcar(lista) {
  for (const c of lista) usados.add(c.nome);
  return lista.map((c) => c.nome);
}

// ---------------------------------------------------------------- página 1 (frente)

const identidade = {
  nome: um(0, 28, 17),
  origem: um(0, 26, 39),
  classe: um(0, 150, 39),
  especie: um(0, 26, 60),
  subclasse: um(0, 150, 60),
  nivel: um(0, 265, 28),
  exp: um(0, 260, 55),
};

const combate = {
  classe_armadura: um(0, 322, 37),
  escudo: um(0, 337, 73),
  pv_atual: um(0, 381, 39),
  pv_temporario: um(0, 439, 32),
  pv_maximo: um(0, 439, 59),
  dados_vida_gastos: um(0, 493, 35),
  dados_vida_maximo: um(0, 493, 57),
  bonus_proficiencia: um(0, 48, 139),
  iniciativa: um(0, 251, 131),
  deslocamento: um(0, 344, 130),
  tamanho: um(0, 435, 130),
  percepcao_passiva: um(0, 533, 131),
  inspiracao_heroica: um(0, 54, 589),
};

const mortes = {
  sucessos: [um(0, 544, 43), um(0, 555, 43), um(0, 565, 43)],
  falhas: [um(0, 544, 64), um(0, 555, 64), um(0, 565, 64)],
};

// atributo: caixa do modificador, caixa do valor, linha da salvaguarda (bônus + proficiência)
const atributos = {
  FOR: { modificador: um(0, 34, 212), valor: um(0, 64, 221), salvaguarda: um(0, 28, 257), salvaguarda_proficiencia: um(0, 19, 263) },
  DES: { modificador: um(0, 33, 328), valor: um(0, 64, 337), salvaguarda: um(0, 28, 375), salvaguarda_proficiencia: um(0, 19, 381) },
  CON: { modificador: um(0, 34, 475), valor: um(0, 64, 484), salvaguarda: um(0, 28, 521), salvaguarda_proficiencia: um(0, 19, 527) },
  INT: { modificador: um(0, 140, 134), valor: um(0, 170, 143), salvaguarda: um(0, 135, 180), salvaguarda_proficiencia: um(0, 126, 186) },
  SAB: { modificador: um(0, 139, 307), valor: um(0, 170, 316), salvaguarda: um(0, 134, 354), salvaguarda_proficiencia: um(0, 126, 360) },
  CAR: { modificador: um(0, 140, 481), valor: um(0, 170, 491), salvaguarda: um(0, 135, 527), salvaguarda_proficiencia: um(0, 126, 534) },
};

const per = (x, y, xc, yc) => ({ bonus: um(0, x, y), proficiencia: um(0, xc, yc) });
const pericias = {
  atletismo: per(28, 276, 19, 283),
  acrobacia: per(28, 394, 19, 401),
  prestidigitacao: per(28, 408, 19, 415),
  furtividade: per(28, 423, 19, 429),
  arcanismo: per(134, 199, 126, 205),
  historia: per(134, 213, 126, 219),
  investigacao: per(134, 226, 126, 234),
  natureza: per(134, 242, 126, 248),
  religiao: per(134, 255, 126, 262),
  lidar_com_animais: per(135, 373, 126, 380),
  intuicao: per(135, 387, 126, 393),
  medicina: per(134, 401, 126, 408),
  percepcao: per(135, 416, 126, 421),
  sobrevivencia: per(135, 429, 126, 436),
  enganacao: per(134, 547, 126, 553),
  intimidacao: per(134, 561, 126, 567),
  atuacao: per(134, 575, 126, 582),
  persuasao: per(134, 589, 126, 595),
};

// ARMAS & TRUQUES DE DANO: 6 linhas × (nome, bônus/CD, dano & tipo, anotações)
const ataques = linhas(regiao({ pagina: 0, tipo: 'Text', xMin: 220, yMin: 190, yMax: 310 })).map(
  (linha) => {
    const [nome, bonus, dano, anotacoes] = marcar(linha);
    return { nome, bonus, dano, anotacoes };
  },
);

const textos = {
  caracteristicas_classe_esquerda: um(0, 229, 353),
  caracteristicas_classe_direita: um(0, 414, 353),
  caracteristicas_especie: um(0, 229, 592),
  talentos: um(0, 415, 592),
  proficiencia_armas: um(0, 16, 668),
  proficiencia_ferramentas: um(0, 17, 728),
};

const treino_armadura = {
  leve: um(0, 61, 647),
  media: um(0, 95, 646),
  pesada: um(0, 139, 646),
  escudos: um(0, 176, 646),
};

// ---------------------------------------------------------------- página 2 (verso)

const magia = {
  atributo_conjuracao: um(1, 29, 18),
  modificador_conjuracao: um(1, 20, 50),
  cd_magia: um(1, 20, 77),
  bonus_ataque_magia: um(1, 20, 104),
};

// ESPAÇOS DE MAGIA: grade 3×3 (níveis 1-3 / 4-6 / 7-9), cada célula com "Total" e caixas de "Gastos"
const COLUNAS_ESPACOS = [
  { total: 182, gastos: [195, 235] },
  { total: 270, gastos: [283, 315] },
  { total: 349, gastos: [360, 385] },
];
const LINHAS_ESPACOS = [85, 99, 112];
const espacos_de_magia = [];
for (const coluna of COLUNAS_ESPACOS) {
  for (const y of LINHAS_ESPACOS) {
    const gastos = regiao({
      pagina: 1, tipo: 'CheckBox',
      xMin: coluna.gastos[0], xMax: coluna.gastos[1], yMin: y - 1, yMax: y + 7,
    }).sort((a, b) => a.x - b.x);
    espacos_de_magia.push({ total: um(1, coluna.total, y), gastos: marcar(gastos) });
  }
}

// TRUQUES & MAGIAS PREPARADAS: 30 linhas
const colunasMagia = [
  ['nivel', 15, 40],
  ['nome', 40, 150],
  ['tempo_conjuracao', 150, 185],
  ['alcance', 185, 235],
  ['concentracao', 235, 255],
  ['ritual', 255, 275],
  ['material', 275, 300],
  ['anotacoes', 300, 400],
];
const magias = linhas(
  regiao({ pagina: 1, xMin: 15, xMax: 400, yMin: 175 }),
).map((linha) => {
  const entrada = {};
  for (const [chave, xMin, xMax] of colunasMagia) {
    const campo = linha.find((c) => c.x >= xMin && c.x < xMax);
    entrada[chave] = campo ? campo.nome : null;
  }
  marcar(linha);
  return entrada;
});

const sintonizacao = [598, 616, 637].map((y) => ({
  item: um(1, 430, y),
  marcado: um(1, 421, y + 3),
}));

const moedas = {
  PC: um(1, 416, 707),
  PP: um(1, 452, 707),
  PE: um(1, 488, 707),
  PO: um(1, 523, 707),
  PL: um(1, 558, 707),
};

const perfil = {
  aparencia: um(1, 414, 36),
  historia_personalidade: um(1, 414, 141),
  alinhamento: um(1, 416, 289),
  idiomas: um(1, 415, 344),
  equipamento: um(1, 415, 412),
};

// ---------------------------------------------------------------- saída

const faltando = campos.filter((c) => !usados.has(c.nome));
if (faltando.length) {
  console.error(`${faltando.length} campos sem chave semântica:`);
  for (const c of faltando) console.error(`  p${c.pagina} ${c.tipo} ${c.nome} x=${c.x} yTop=${c.yTop}`);
  process.exit(1);
}

const mapa = {
  identidade, combate, mortes, atributos, pericias, ataques, textos, treino_armadura,
  magia, espacos_de_magia, magias, sintonizacao, moedas, perfil,
};

const ts = `// GERADO por scripts/gerar-mapa-campos.mjs — não editar à mão.
// Cada chave semântica aponta para o nome do campo AcroForm correspondente na
// "Ficha Dnd 5.5.pdf" (nomes originais são gerados por máquina e não têm significado).

export const CAMPOS = ${JSON.stringify(mapa, null, 2)} as const

export type MapaCampos = typeof CAMPOS
`;

writeFileSync(process.argv[3], ts);
console.log(`${campos.length} campos mapeados → ${process.argv[3]}`);
console.log(`  ataques: ${ataques.length} linhas | magias: ${magias.length} linhas | espaços: ${espacos_de_magia.length} células`);
