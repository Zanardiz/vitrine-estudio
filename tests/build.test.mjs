// Testes da montagem da página: node tests/build.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { render, escapeHtml, validate, build } from '../build.mjs';

let passed = 0;
const test = (name, fn) => { fn(); passed += 1; console.log(`ok - ${name}`); };
const content = JSON.parse(readFileSync(new URL('../content/site.json', import.meta.url), 'utf8'));

test('escapa texto que quebraria o HTML', () => {
  assert.equal(escapeHtml('<b>"A & B"</b>'), '&lt;b&gt;&quot;A &amp; B&quot;&lt;/b&gt;');
});

test('preenche campos e repete listas', () => {
  const html = render('<h1>{{a.t}}</h1>{{#each a.l}}<i>{{n}}</i>{{/each}}', { a: { t: 'Oi', l: [{ n: '1' }, { n: '2' }] } });
  assert.equal(html, '<h1>Oi</h1><i>1</i><i>2</i>');
});

test('recusa campo que falta, dizendo qual', () => {
  assert.throws(() => render('{{a.b}}', { a: {} }), /a\.b/);
});

test('recusa lista vazia', () => {
  assert.throws(() => render('{{#each l}}x{{/each}}', { l: [] }), /ao menos um item/);
});

test('aponta título vazio, e-mail e endereço de formulário errados', () => {
  const bad = structuredClone(content);
  bad.inicio.titulo = ' ';
  bad.orcamento.email = 'sem-arroba';
  bad.orcamento.endereco_formulario = 'http://x';
  const problems = validate(bad).join(' ');
  assert.match(problems, /inicio\.titulo/);
  assert.match(problems, /não parece um e-mail/);
  assert.match(problems, /https:\/\//);
});

test('o conteúdo atual passa na validação', () => {
  assert.deepEqual(validate(content), []);
});

test('a página montada é a que está publicada', () => {
  assert.equal(build(), readFileSync(new URL('../index.html', import.meta.url), 'utf8'));
});

test('não sobra nenhum {{campo}} na página', () => {
  assert.doesNotMatch(build(), /\{\{/);
});

console.log(`${passed} testes passaram`);
