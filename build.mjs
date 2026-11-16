// Monta o index.html a partir do molde (src/index.html) e dos textos (content/site.json).
// O painel /admin edita o content/site.json no GitHub; a Action roda este arquivo e publica.
// Uso: node build.mjs            -> escreve index.html
//      node build.mjs --check    -> só confere se o index.html está em dia (sai com erro se não)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = join(ROOT, 'src', 'index.html');
const CONTENT = join(ROOT, 'content', 'site.json');
const OUTPUT = join(ROOT, 'index.html');
const TEMPLATE_NOTE = /^<!--[^\n]*-->\n/;

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
export const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (ch) => ESCAPES[ch]);

function lookup(data, path, where) {
  const value = path.split('.').reduce((node, key) => (node == null ? undefined : node[key]), data);
  if (value === undefined || value === null) throw new Error(`Falta o campo "${path}" ${where}.`);
  return value;
}

// {{#each lista}}...{{/each}} repete o trecho para cada item; {{campo}} vira o texto do campo.
export function render(template, data) {
  const withLists = template.replace(/\{\{#each ([\w.]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, path, body) => {
    const items = lookup(data, path, 'em content/site.json');
    if (!Array.isArray(items) || items.length === 0) throw new Error(`A lista "${path}" precisa ter ao menos um item.`);
    return items.map((item, i) => fillFields(body, item, `no item ${i + 1} de "${path}"`)).join('');
  });
  return fillFields(withLists, data, 'em content/site.json');
}

function fillFields(text, data, where) {
  return text.replace(/\{\{([\w.]+)\}\}/g, (_, path) => {
    const value = lookup(data, path, where);
    if (typeof value === 'object') throw new Error(`O campo "${path}" ${where} precisa ser um texto.`);
    return escapeHtml(value);
  });
}

export function validate(content) {
  const problems = [];
  const required = [
    'seo.titulo', 'seo.descricao', 'inicio.titulo', 'inicio.texto', 'servicos.titulo',
    'perguntas.titulo', 'orcamento.titulo', 'orcamento.email', 'rodape.titulo',
  ];
  required.forEach((path) => {
    const value = path.split('.').reduce((node, key) => node?.[key], content);
    if (typeof value !== 'string' || !value.trim()) problems.push(`"${path}" está vazio.`);
  });
  const email = content?.orcamento?.email ?? '';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) problems.push('"orcamento.email" não parece um e-mail.');
  const endpoint = content?.orcamento?.endereco_formulario ?? '';
  if (endpoint && !/^https:\/\//.test(endpoint)) problems.push('"orcamento.endereco_formulario" precisa começar com https://.');
  return problems;
}

export function build() {
  const content = JSON.parse(readFileSync(CONTENT, 'utf8'));
  const problems = validate(content);
  if (problems.length) throw new Error(`Conteúdo com problema:\n- ${problems.join('\n- ')}`);
  const template = readFileSync(TEMPLATE, 'utf8').replace(TEMPLATE_NOTE, '');
  return render(template, content);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  try {
    const html = build();
    if (process.argv.includes('--check')) {
      const current = existsSync(OUTPUT) ? readFileSync(OUTPUT, 'utf8') : '';
      if (current !== html) { console.error('index.html está desatualizado: rode node build.mjs'); process.exit(1); }
      console.log('index.html em dia.');
    } else {
      writeFileSync(OUTPUT, html);
      console.log('index.html montado.');
    }
  } catch (problem) {
    console.error(problem.message);
    process.exit(1);
  }
}
