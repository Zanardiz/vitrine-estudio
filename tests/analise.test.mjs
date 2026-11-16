// Teste do script da análise com um DOM falso e uma resposta falsa da API.
const els = {};
const mk = (tag) => ({ tag, attrs: {}, style: { setProperty(k, v) { this[k] = v; } }, children: [], textContent: '', hidden: true, value: '',
  setAttribute(k, v) { this.attrs[k] = v; }, getAttribute(k) { return this.attrs[k]; }, removeAttribute(k) { delete this.attrs[k]; },
  addEventListener(t, f) { this['on' + t] = f; }, focus() {}, querySelector(s) { return els[s]; }, replaceChildren(...c) { this.children = c; } });
const form = mk('form'), input = mk('input'), err = mk('p'), status = mk('p'), site = mk('span'), list = mk('ol'), title = mk('h3'), fsite = mk('input');
input.attrs['aria-describedby'] = 'a-url-err';
form.querySelector = (s) => ({ 'input[name="url"]': input, '[data-audit-status]': status })[s];
const rings = {}; for (const id of ['performance', 'accessibility', 'best-practices', 'seo']) { const r = mk('span'); r.b = mk('b'); r.querySelector = () => r.b; rings[id] = r; }
globalThis.document = {
  querySelector(s) { if (s === '[data-audit]') return form; if (s === '[data-audit-site]') return site; if (s === '[data-audit-issues]') return list; if (s === '[data-audit-issues-title]') return title;
    const m = s.match(/data-score="([^"]+)"/); return m ? rings[m[1]] : null; },
  getElementById(id) { return id === 'a-url-err' ? err : id === 'f-site' ? fsite : null; },
  createElement(t) { return mk(t); }, createTextNode(t) { return { text: t }; },
};
let mode = 'ok';
globalThis.location = { search: '?url=lojateste.com.br' };
form.requestSubmit = () => form.onsubmit({ preventDefault() {} });
globalThis.fetch = async (url) => {
  if (mode === 'quota') return { ok: false, status: 429, json: async () => ({}) };
  return { ok: true, status: 200, json: async () => ({ lighthouseResult: {
    categories: { performance: { score: 0.42, auditRefs: [{ id: 'img', weight: 0 }, { id: 'lcp', weight: 25, group: 'metrics' }] },
      accessibility: { score: 0.81, auditRefs: [{ id: 'contrast', weight: 7 }] }, 'best-practices': { score: 1, auditRefs: [] }, seo: { score: 0.92, auditRefs: [{ id: 'meta', weight: 1 }] } },
    audits: { img: { title: 'Dimensione as [imagens](https://x)', score: 0.3, details: { overallSavingsMs: 900 } }, lcp: { title: 'LCP', score: 0.1 },
      contrast: { title: 'Cores sem `contraste`', score: 0 }, meta: { title: 'Sem meta descrição', score: 0 } } } }) };
};
await import('../js/analise.js');
await new Promise((r) => setTimeout(r, 10));
const assert = (c, m) => { if (!c) { console.error('FALHOU:', m); process.exitCode = 1; } else console.log('ok:', m); };
assert(site.textContent === 'lojateste.com.br', 'link com ?url= roda a análise sozinho');
input.value = '   '; await form.onsubmit({ preventDefault() {} });
assert(input.attrs['aria-invalid'] === 'true' && err.hidden === false, 'campo vazio mostra o erro');
fsite.value = ''; input.value = 'minhaloja.com.br'; await form.onsubmit({ preventDefault() {} });
assert(input.value === 'https://minhaloja.com.br/', 'endereço ganha https');
assert(rings.performance.b.textContent === 42 && rings.seo.b.textContent === 92, 'notas em 0 a 100');
assert(list.children.map((c) => c.textContent).join('|') === 'Cores sem contraste|Sem meta descrição|Dimensione as imagens', 'problemas por peso, sem markdown, sem métricas');
assert(fsite.value === 'https://minhaloja.com.br/', 'orçamento recebe o site');
mode = 'quota'; await form.onsubmit({ preventDefault() {} });
assert(status.children[1]?.href?.startsWith('https://pagespeed.web.dev/analysis?url='), 'cota esgotada mostra o link do Google');
