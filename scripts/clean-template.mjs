// Uso pontual: remove o personagem de exemplo da ficha oficial e grava o modelo
// em branco que o app carrega. O PDF original guarda valores antigos nos objetos
// de campo (o save incremental do visualizador limpou só os widgets filhos), então
// os valores são reescritos via pdf-lib para caírem no dicionário do campo.
import { readFileSync, writeFileSync } from 'node:fs';
import { PDFDocument } from 'pdf-lib';

const pdf = await PDFDocument.load(readFileSync(process.argv[2]));
const form = pdf.getForm();

let textos = 0;
let caixas = 0;
for (const campo of form.getFields()) {
  if (campo.constructor.name === 'PDFTextField') {
    if (campo.getText()?.trim()) textos++;
    campo.setText('');
  } else if (campo.constructor.name === 'PDFCheckBox') {
    if (campo.isChecked()) caixas++;
    campo.uncheck();
  }
}

form.updateFieldAppearances();
const bytes = await pdf.save();
writeFileSync(process.argv[3], bytes);
console.log(`limpos ${textos} textos e ${caixas} caixas → ${process.argv[3]} (${(bytes.length / 1024 / 1024).toFixed(1)} MB)`);
