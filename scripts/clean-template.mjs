// Uso pontual: remove o personagem de exemplo da ficha oficial e grava o modelo
// em branco que o app carrega. O PDF original guarda valores antigos nos objetos
// de campo (o save incremental do visualizador limpou só os widgets filhos), então
// os valores são reescritos via pdf-lib para caírem no dicionário do campo.
import { readFileSync, writeFileSync } from 'node:fs';
import { PDFDocument } from 'pdf-lib';

const pdf = await PDFDocument.load(readFileSync(process.argv[2]));
const form = pdf.getForm();

let texts = 0;
let caixas = 0;
for (const field of form.getFields()) {
  if (field.constructor.name === 'PDFTextField') {
    if (field.getText()?.trim()) texts++;
    field.setText('');
  } else if (field.constructor.name === 'PDFCheckBox') {
    if (field.isChecked()) caixas++;
    field.uncheck();
  }
}

form.updateFieldAppearances();
const bytes = await pdf.save();
writeFileSync(process.argv[3], bytes);
console.log(`limpos ${texts} textos e ${caixas} caixas → ${process.argv[3]} (${(bytes.length / 1024 / 1024).toFixed(1)} MB)`);
