#!/usr/bin/env python3
"""
Converte uma criatura da conversão downfallx (HTML nas tabelas) para o formato
markdown da fonte principal, gerando um override.

    python3 scripts/srd/downfallx-to-override.py <monsters-A-Z.md> "Nome" > scripts/srd/overrides/Nome.md

Para animals.md, normalize antes os cabeçalhos (## Nome → ### Nome; ### Actions → #### Actions),
como faz crosscheck.mjs. Revise o arquivo gerado: a tabela de atributos da downfallx às vezes
vem quebrada (Remorhaz) — aí copie a tabela da fonte principal.
"""
import re, sys
src, name = sys.argv[1], sys.argv[2]
t = open(src).read()
start = re.search(rf'^### {re.escape(name)}\s*$', t, re.M).start()
nxt = re.search(r'^#{2,3} (?!Traits|Actions|Bonus Actions|Reactions|Legendary Actions)', t[start + 4:], re.M)
block = t[start: start + 4 + (nxt.start() if nxt else len(t))]
cells = [re.sub(r'<[^>]+>', '', c).strip() for c in re.findall(r'<td>(.*?)</td>', block, re.S)]
ab = {}
for i, c in enumerate(cells):
    if c in ('STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'):
        ab[c] = cells[i + 1:i + 4]
table = '|            | MOD  | SAVE |            | MOD  | SAVE |            | MOD  | SAVE |\n| :--------- | :--- | :--- | :--------- | :--- | :--- | :--------- | :--- | :--- |\n'
row = lambda ks: '| ' + ' | '.join(f'**{k.title()} {ab[k][0]}** | {ab[k][1]} | {ab[k][2]}' for k in ks) + ' |\n'
table += row(['STR', 'DEX', 'CON']) + row(['INT', 'WIS', 'CHA'])
block = re.sub(r'<table>.*?</table>', table, block, flags=re.S)
block = block.replace("<br>", "").replace("<hr>", "")
block = re.sub(r'^### ', '# ', block, flags=re.M)
block = re.sub(r'^#### ', '## ', block, flags=re.M)
block = re.sub(r'&emsp;\*\*(.+?)\*\*', r'\n***\1***', block)
block = block.replace('&emsp;', ' ')
block = re.sub(r'\*\*_(.+?)_\*\*', r'***\1***', block)
block = re.sub(r'(?<![\w*])_(.+?)_(?![\w*])', r'*\1*', block)
block = re.sub(r'\n{3,}', '\n\n', block)
print(block.strip())
