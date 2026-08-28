// Uso pontual: injeta o formulário AcroForm numa ficha oficial "crua" (só a arte).
// PT-BR e EN são o mesmo template (603×774 pts, mesma diagramação), então os dois
// modelos recebem os mesmos campos, com os mesmos nomes e nas mesmas posições —
// é o que permite `fillSheet.ts` tratar os dois de forma idêntica.
// A arte crua vem do gs (comprime e, de quebra, remove o formulário original).
// Ver scripts/README.md para o encadeamento completo.
import { readFileSync, writeFileSync } from 'node:fs';
import { PDFDocument, PDFName } from 'pdf-lib';

const FONT_SIZE = 8;

/**
 * A aparência que o pdf-lib gera para uma caixa pinta um retângulo branco por cima
 * do anel impresso na ficha. Como as marcas são desenhadas na página (ver
 * `desenharMarcas` em fillSheet.ts), a caixa fica com aparência vazia — porém
 * presente, senão o pdf-lib a regeraria na hora de preencher.
 */
function apagarAparencia(widget, field) {
  const vazio = pdf.context.register(
    pdf.context.stream('', {
      Type: 'XObject',
      Subtype: 'Form',
      FormType: 1,
      BBox: pdf.context.obj([0, 0, field.w, field.h]),
      Resources: pdf.context.obj({}),
    }),
  );
  widget.dict.delete(PDFName.of('MK'));
  widget.dict.set(PDFName.of('AP'), pdf.context.obj({ N: { Off: vazio, Yes: vazio } }));
  widget.dict.set(PDFName.of('AS'), PDFName.of('Off'));
}

const [, , entradaPdf, entradaCampos, saida] = process.argv;
const pdf = await PDFDocument.load(readFileSync(entradaPdf));
const fields = JSON.parse(readFileSync(entradaCampos, 'utf8'));
const pages = pdf.getPages();
const form = pdf.getForm();

if (pdf.getForm().getFields().length > 0) {
  throw new Error('o PDF de entrada já tem formulário — este script espera a ficha oficial crua');
}

let texts = 0;
let caixas = 0;
for (const field of fields) {
  const page = pages[field.page];
  if (!page) throw new Error(`página ${field.page} inexistente (campo ${field.name})`);
  // Sem borda e sem fundo: a moldura já é parte da arte da ficha.
  const posicao = { x: field.x, y: field.y, width: field.w, height: field.h, borderWidth: 0 };

  if (field.type === 'CheckBox') {
    const checkbox = form.createCheckBox(field.name);
    checkbox.addToPage(page, posicao);
    for (const widget of checkbox.acroField.getWidgets()) apagarAparencia(widget, field);
    caixas++;
  } else {
    const text = form.createTextField(field.name);
    if (field.multilinha) text.enableMultiline();
    text.addToPage(page, posicao);
    text.setFontSize(FONT_SIZE); // depois do addToPage: é ele quem cria o /DA
    texts++;
  }
}

const bytes = await pdf.save();
writeFileSync(saida, bytes);
console.log(
  `${texts} campos de texto e ${caixas} caixas criados → ${saida} (${(bytes.length / 1024 / 1024).toFixed(1)} MB)`,
);
