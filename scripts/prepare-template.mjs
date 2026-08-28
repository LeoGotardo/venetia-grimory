// Uso pontual: injeta o formulário AcroForm numa ficha oficial "crua" (só a arte).
// PT-BR e EN são o mesmo template (603×774 pts, mesma diagramação), então os dois
// modelos recebem os mesmos campos, com os mesmos nomes e nas mesmas posições —
// é o que permite `preencherFicha.ts` tratar os dois de forma idêntica.
// A arte crua vem do gs (comprime e, de quebra, remove o formulário original).
// Ver scripts/README.md para o encadeamento completo.
import { readFileSync, writeFileSync } from 'node:fs';
import { PDFDocument, PDFName } from 'pdf-lib';

const TAMANHO_FONTE = 8;

/**
 * A aparência que o pdf-lib gera para uma caixa pinta um retângulo branco por cima
 * do anel impresso na ficha. Como as marcas são desenhadas na página (ver
 * `desenharMarcas` em preencherFicha.ts), a caixa fica com aparência vazia — porém
 * presente, senão o pdf-lib a regeraria na hora de preencher.
 */
function apagarAparencia(widget, campo) {
  const vazio = pdf.context.register(
    pdf.context.stream('', {
      Type: 'XObject',
      Subtype: 'Form',
      FormType: 1,
      BBox: pdf.context.obj([0, 0, campo.w, campo.h]),
      Resources: pdf.context.obj({}),
    }),
  );
  widget.dict.delete(PDFName.of('MK'));
  widget.dict.set(PDFName.of('AP'), pdf.context.obj({ N: { Off: vazio, Yes: vazio } }));
  widget.dict.set(PDFName.of('AS'), PDFName.of('Off'));
}

const [, , entradaPdf, entradaCampos, saida] = process.argv;
const pdf = await PDFDocument.load(readFileSync(entradaPdf));
const campos = JSON.parse(readFileSync(entradaCampos, 'utf8'));
const paginas = pdf.getPages();
const form = pdf.getForm();

if (pdf.getForm().getFields().length > 0) {
  throw new Error('o PDF de entrada já tem formulário — este script espera a ficha oficial crua');
}

let textos = 0;
let caixas = 0;
for (const campo of campos) {
  const pagina = paginas[campo.pagina];
  if (!pagina) throw new Error(`página ${campo.pagina} inexistente (campo ${campo.nome})`);
  // Sem borda e sem fundo: a moldura já é parte da arte da ficha.
  const posicao = { x: campo.x, y: campo.y, width: campo.w, height: campo.h, borderWidth: 0 };

  if (campo.tipo === 'CheckBox') {
    const caixa = form.createCheckBox(campo.nome);
    caixa.addToPage(pagina, posicao);
    for (const widget of caixa.acroField.getWidgets()) apagarAparencia(widget, campo);
    caixas++;
  } else {
    const texto = form.createTextField(campo.nome);
    if (campo.multilinha) texto.enableMultiline();
    texto.addToPage(pagina, posicao);
    texto.setFontSize(TAMANHO_FONTE); // depois do addToPage: é ele quem cria o /DA
    textos++;
  }
}

const bytes = await pdf.save();
writeFileSync(saida, bytes);
console.log(
  `${textos} campos de texto e ${caixas} caixas criados → ${saida} (${(bytes.length / 1024 / 1024).toFixed(1)} MB)`,
);
