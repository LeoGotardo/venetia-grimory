// Uso pontual: extrai a geometria de cada widget AcroForm (nome, tipo, página, retângulo).
// Ver scripts/README.md para o encadeamento completo.
import { readFileSync, writeFileSync } from 'node:fs';
import { PDFDocument } from 'pdf-lib';

const pdf = await PDFDocument.load(readFileSync(process.argv[2]), { ignoreEncryption: true });
const pages = pdf.getPages();

// widget -> page: match the widget ref against each page's Annots array
const paginaDoRef = new Map();
pages.forEach((p, i) => {
  const annots = p.node.Annots();
  if (!annots) return;
  for (let k = 0; k < annots.size(); k++) paginaDoRef.set(annots.get(k).toString(), i);
});

const form = pdf.getForm();
const saida = [];

for (const field of form.getFields()) {
  const name = field.getName();
  const type = field.constructor.name.replace(/^PDF|Field$/g, '');
  for (const widget of field.acroField.getWidgets()) {
    const r = widget.getRectangle();
    const ref = pdf.context.getObjectRef(widget.dict) ?? widget.dict;
    const page = paginaDoRef.get(ref.toString()) ?? -1;
    const multilinha = type === 'Text' ? field.isMultiline() : undefined;
    const alturaPagina = page >= 0 ? pages[page].getHeight() : pages[0].getHeight();
    saida.push({
      name,
      type,
      page,
      x: +r.x.toFixed(1),
      y: +r.y.toFixed(1),
      w: +r.width.toFixed(1),
      h: +r.height.toFixed(1),
      // origem no topo, para casar com as coordenadas do pdftotext -bbox
      yTop: +(alturaPagina - (r.y + r.height)).toFixed(1),
      ...(multilinha === undefined ? {} : { multilinha }),
    });
  }
}

saida.sort((a, b) => a.page - b.page || a.yTop - b.yTop || a.x - b.x);
writeFileSync(process.argv[3], JSON.stringify(saida, null, 2));
const semPagina = saida.filter((c) => c.page < 0).length;
console.log(`${saida.length} widgets, ${form.getFields().length} campos, ${semPagina} sem página`);
