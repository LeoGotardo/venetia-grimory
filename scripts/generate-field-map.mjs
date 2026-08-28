// Uso pontual: transforma o dump de extract-fields.mjs em src/lib/pdf/sheetFields.ts.
// O modelo usa nomes de campo gerados por máquina (text_1aoob, checkbox_148cprb...),
// então cada campo é identificado por página + posição e recebe aqui uma chave semântica.
import { readFileSync, writeFileSync } from 'node:fs';

const fields = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const usados = new Set();
const TOL = 3;

function um(page, x, yTop) {
  const achados = fields.filter(
    (c) => c.page === page && Math.abs(c.x - x) <= TOL && Math.abs(c.yTop - yTop) <= TOL,
  );
  if (achados.length !== 1) {
    throw new Error(`p${page} (${x},${yTop}): ${achados.length} campos — ${achados.map((c) => c.name)}`);
  }
  usados.add(achados[0].name);
  return achados[0].name;
}

function regiao({ page, type, xMin = -Infinity, xMax = Infinity, yMin = -Infinity, yMax = Infinity }) {
  return fields.filter(
    (c) => c.page === page && (!type || c.type === type) &&
      c.x >= xMin && c.x <= xMax && c.yTop >= yMin && c.yTop <= yMax,
  );
}

// clusters widgets into visual rows (their y differs by a point or two across columns)
function lines(list, folga = 6) {
  const lines = [];
  for (const c of [...list].sort((a, b) => a.yTop - b.yTop)) {
    const ultima = lines.at(-1);
    if (ultima && c.yTop - ultima.y <= folga) ultima.items.push(c);
    else lines.push({ y: c.yTop, items: [c] });
  }
  return lines.map((l) => l.items.sort((a, b) => a.x - b.x));
}

function marcar(list) {
  for (const c of list) usados.add(c.name);
  return list.map((c) => c.name);
}

// ---------------------------------------------------------------- página 1 (frente)

const identity = {
  name: um(0, 28, 17),
  source: um(0, 26, 39),
  charClass: um(0, 150, 39),
  species: um(0, 26, 60),
  subclass: um(0, 150, 60),
  level: um(0, 265, 28),
  exp: um(0, 260, 55),
};

const combat = {
  classe_armadura: um(0, 322, 37),
  shield: um(0, 337, 73),
  pv_atual: um(0, 381, 39),
  pv_temporario: um(0, 439, 32),
  pv_maximo: um(0, 439, 59),
  dados_vida_gastos: um(0, 493, 35),
  dados_vida_maximo: um(0, 493, 57),
  bonus_proficiencia: um(0, 48, 139),
  initiative: um(0, 251, 131),
  speed: um(0, 344, 130),
  size: um(0, 435, 130),
  percepcao_passiva: um(0, 533, 131),
  inspiracao_heroica: um(0, 54, 589),
};

const mortes = {
  sucessos: [um(0, 544, 43), um(0, 555, 43), um(0, 565, 43)],
  falhas: [um(0, 544, 64), um(0, 555, 64), um(0, 565, 64)],
};

// atributo: caixa do modificador, caixa do valor, linha da salvaguarda (bônus + proficiência)
const abilities = {
  FOR: { modificador: um(0, 34, 212), value: um(0, 64, 221), save: um(0, 28, 257), salvaguarda_proficiencia: um(0, 19, 263) },
  DES: { modificador: um(0, 33, 328), value: um(0, 64, 337), save: um(0, 28, 375), salvaguarda_proficiencia: um(0, 19, 381) },
  CON: { modificador: um(0, 34, 475), value: um(0, 64, 484), save: um(0, 28, 521), salvaguarda_proficiencia: um(0, 19, 527) },
  INT: { modificador: um(0, 140, 134), value: um(0, 170, 143), save: um(0, 135, 180), salvaguarda_proficiencia: um(0, 126, 186) },
  SAB: { modificador: um(0, 139, 307), value: um(0, 170, 316), save: um(0, 134, 354), salvaguarda_proficiencia: um(0, 126, 360) },
  CAR: { modificador: um(0, 140, 481), value: um(0, 170, 491), save: um(0, 135, 527), salvaguarda_proficiencia: um(0, 126, 534) },
};

const per = (x, y, xc, yc) => ({ bonus: um(0, x, y), proficiencia: um(0, xc, yc) });
const skills = {
  atletismo: per(28, 276, 19, 283),
  acrobacia: per(28, 394, 19, 401),
  prestidigitacao: per(28, 408, 19, 415),
  furtividade: per(28, 423, 19, 429),
  arcanismo: per(134, 199, 126, 205),
  backstory: per(134, 213, 126, 219),
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
const attacks = lines(regiao({ page: 0, type: 'Text', xMin: 220, yMin: 190, yMax: 310 })).map(
  (linha) => {
    const [name, bonus, damage, anotacoes] = marcar(linha);
    return { name, bonus, damage, anotacoes };
  },
);

const texts = {
  caracteristicas_classe_esquerda: um(0, 229, 353),
  caracteristicas_classe_direita: um(0, 414, 353),
  caracteristicas_especie: um(0, 229, 592),
  feats: um(0, 415, 592),
  proficiencia_armas: um(0, 16, 668),
  proficiencia_ferramentas: um(0, 17, 728),
};

const armor_training = {
  leve: um(0, 61, 647),
  media: um(0, 95, 646),
  pesada: um(0, 139, 646),
  shields: um(0, 176, 646),
};

// ---------------------------------------------------------------- página 2 (verso)

const spellcasting = {
  spellcasting_ability: um(1, 29, 18),
  modificador_conjuracao: um(1, 20, 50),
  cd_magia: um(1, 20, 77),
  bonus_ataque_magia: um(1, 20, 104),
};

// ESPAÇOS DE MAGIA: grade 3×3 (níveis 1-3 / 4-6 / 7-9), cada célula com "Total" e caixas de "Gastos"
const COLUNAS_ESPACOS = [
  { total: 182, spent: [195, 235] },
  { total: 270, spent: [283, 315] },
  { total: 349, spent: [360, 385] },
];
const LINHAS_ESPACOS = [85, 99, 112];
const spell_slots = [];
for (const coluna of COLUNAS_ESPACOS) {
  for (const y of LINHAS_ESPACOS) {
    const spent = regiao({
      page: 1, type: 'CheckBox',
      xMin: coluna.spent[0], xMax: coluna.spent[1], yMin: y - 1, yMax: y + 7,
    }).sort((a, b) => a.x - b.x);
    spell_slots.push({ total: um(1, coluna.total, y), spent: marcar(spent) });
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
const spells = lines(
  regiao({ page: 1, xMin: 15, xMax: 400, yMin: 175 }),
).map((linha) => {
  const entry = {};
  for (const [key, xMin, xMax] of colunasMagia) {
    const field = linha.find((c) => c.x >= xMin && c.x < xMax);
    entry[key] = field ? field.name : null;
  }
  marcar(linha);
  return entry;
});

const sintonizacao = [598, 616, 637].map((y) => ({
  item: um(1, 430, y),
  marcado: um(1, 421, y + 3),
}));

const coins = {
  PC: um(1, 416, 707),
  PP: um(1, 452, 707),
  PE: um(1, 488, 707),
  PO: um(1, 523, 707),
  PL: um(1, 558, 707),
};

const profile = {
  appearance: um(1, 414, 36),
  personality_backstory: um(1, 414, 141),
  alignment: um(1, 416, 289),
  languages: um(1, 415, 344),
  equipment: um(1, 415, 412),
};

// ---------------------------------------------------------------- saída

const faltando = fields.filter((c) => !usados.has(c.name));
if (faltando.length) {
  console.error(`${faltando.length} campos sem chave semântica:`);
  for (const c of faltando) console.error(`  p${c.page} ${c.type} ${c.name} x=${c.x} yTop=${c.yTop}`);
  process.exit(1);
}

const mapa = {
  identity, combat, mortes, abilities, skills, attacks, texts, armor_training,
  spellcasting, spell_slots, spells, sintonizacao, coins, profile,
};

const ts = `// GERADO por scripts/generate-field-map.mjs — não editar à mão.
// Cada chave semântica aponta para o nome do campo AcroForm correspondente na
// "Ficha Dnd 5.5.pdf" (nomes originais são gerados por máquina e não têm significado).

export const CAMPOS = ${JSON.stringify(mapa, null, 2)} as const

export type MapaCampos = typeof CAMPOS
`;

writeFileSync(process.argv[3], ts);
console.log(`${fields.length} campos mapeados → ${process.argv[3]}`);
console.log(`  ataques: ${attacks.length} linhas | magias: ${spells.length} linhas | espaços: ${spell_slots.length} células`);
