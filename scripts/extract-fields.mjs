// Uso pontual: extrai a geometria de cada widget AcroForm (nome, tipo, página, retângulo).
// Ver scripts/README.md para o encadeamento completo.
import { readFileSync, writeFileSync } from 'node:fs';
import { PDFDocument } from 'pdf-lib';

const pdf = await PDFDocument.load(readFileSync(process.argv[2]), { ignoreEncryption: true });
const paginas = pdf.getPages();

// widget -> page: match the widget ref against each page's Annots array
const paginaDoRef = new Map();
paginas.forEach((p, i) => {
  const annots = p.node.Annots();
  if (!annots) return;
  for (let k = 0; k < annots.size(); k++) paginaDoRef.set(annots.get(k).toString(), i);
});

const form = pdf.getForm();
const saida = [];

for (const campo of form.getFields()) {
  const nome = campo.getName();
  const tipo = campo.constructor.name.replace(/^PDF|Field$/g, '');
  for (const widget of campo.acroField.getWidgets()) {
    const r = widget.getRectangle();
    const ref = pdf.context.getObjectRef(widget.dict) ?? widget.dict;
    const pagina = paginaDoRef.get(ref.toString()) ?? -1;
    const multilinha = tipo === 'Text' ? campo.isMultiline() : undefined;
    const alturaPagina = pagina >= 0 ? paginas[pagina].getHeight() : paginas[0].getHeight();
    saida.push({
      nome,
      tipo,
      pagina,
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

saida.sort((a, b) => a.pagina - b.pagina || a.yTop - b.yTop || a.x - b.x);
writeFileSync(process.argv[3], JSON.stringify(saida, null, 2));
const semPagina = saida.filter((c) => c.pagina < 0).length;
console.log(`${saida.length} widgets, ${form.getFields().length} campos, ${semPagina} sem página`);
