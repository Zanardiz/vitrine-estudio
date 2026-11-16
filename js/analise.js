// Análise grátis: roda o PageSpeed Insights (Google) no endereço digitado e mostra as quatro notas
// e os pontos a corrigir. Sem chave, a cota pública do Google se esgota quase sempre (erro 429):
// crie uma chave grátis no Google Cloud (PageSpeed Insights API), restrinja-a ao domínio do site
// (referenciadores HTTP) e cole em API_KEY. Um link com ?url=empresa.com.br#analise já roda a análise.
const API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const API_KEY = '';
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];
const MAX_ISSUES = 5;
const PASSING_SCORE = 0.9;

const form = document.querySelector('[data-audit]');
if (form) setupAudit(form);

function setupAudit(auditForm) {
  const input = auditForm.querySelector('input[name="url"]');
  const error = document.getElementById(input.getAttribute('aria-describedby'));
  const status = auditForm.querySelector('[data-audit-status]');

  auditForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const address = normalizeAddress(input.value);
    if (!address) {
      input.setAttribute('aria-invalid', 'true');
      error.hidden = false;
      status.textContent = '1 campo para corrigir.';
      input.focus();
      return;
    }
    input.removeAttribute('aria-invalid');
    error.hidden = true;
    input.value = address;
    status.textContent = 'Analisando. Isso leva uns 30 segundos.';

    try {
      const report = await runPageSpeed(address);
      showReport(address, report);
      status.textContent = 'Análise pronta.';
      prefillQuote(address);
    } catch (problem) {
      showFallback(status, problem.message, address);
    }
  });

  input.addEventListener('input', () => {
    if (input.getAttribute('aria-invalid')) { input.removeAttribute('aria-invalid'); error.hidden = true; }
  });

  // Link pronto dos e-mails: ?url=empresa.com.br preenche o campo e roda a análise uma vez.
  const linked = new URLSearchParams(location.search).get('url');
  if (linked) {
    input.value = linked;
    auditForm.requestSubmit();
  }
}

function normalizeAddress(raw) {
  const text = raw.trim();
  if (!text) return null;
  const withScheme = /^https?:\/\//i.test(text) ? text : `https://${text}`;
  try {
    const url = new URL(withScheme);
    if (!url.hostname.includes('.')) return null;
    return url.href;
  } catch {
    return null;
  }
}

async function runPageSpeed(address) {
  const params = new URLSearchParams({ url: address, strategy: 'mobile', locale: 'pt-BR' });
  CATEGORIES.forEach((category) => params.append('category', category));
  if (API_KEY) params.set('key', API_KEY);

  let response;
  try {
    response = await fetch(`${API_URL}?${params}`);
  } catch {
    throw new Error('Sem conexão com a análise do Google. Confira a internet e tente de novo.');
  }
  if (response.status === 429) {
    throw new Error('A análise do Google chegou ao limite de agora.');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.lighthouseResult) {
    throw new Error('Não foi possível abrir esse site. Confira se o endereço está certo e se o site está no ar.');
  }
  return data.lighthouseResult;
}

function showReport(address, report) {
  document.querySelector('[data-audit-site]').textContent = new URL(address).hostname;

  CATEGORIES.forEach((id) => {
    const score = report.categories?.[id]?.score;
    const ring = document.querySelector(`[data-score="${id}"] .audit-ring`);
    const value = typeof score === 'number' ? Math.round(score * 100) : null;
    ring.style.setProperty('--v', value ?? 0);
    ring.querySelector('b').textContent = value ?? '–';
  });

  const issues = pickIssues(report);
  const list = document.querySelector('[data-audit-issues]');
  const title = document.querySelector('[data-audit-issues-title]');
  list.replaceChildren(...issues.map((text) => {
    const item = document.createElement('li');
    item.textContent = text;
    return item;
  }));
  title.textContent = issues.length ? 'O que corrigir primeiro no site' : 'Nenhum problema grave no site';
}

// As auditorias que falharam, das que mais pesam na nota para as que menos pesam.
function pickIssues(report) {
  const seen = new Set();
  const failing = [];
  CATEGORIES.forEach((id) => {
    (report.categories?.[id]?.auditRefs ?? []).forEach((ref) => {
      const audit = report.audits?.[ref.id];
      if (!audit || seen.has(ref.id) || ref.group === 'metrics') return;
      if (typeof audit.score !== 'number' || audit.score >= PASSING_SCORE) return;
      seen.add(ref.id);
      const savings = audit.details?.overallSavingsMs ?? 0;
      failing.push({ title: cleanTitle(audit.title), weight: ref.weight ?? 0, savings });
    });
  });
  return failing
    .sort((a, b) => (b.weight - a.weight) || (b.savings - a.savings))
    .slice(0, MAX_ISSUES)
    .map((issue) => issue.title);
}

// Os títulos do Lighthouse trazem marcação de código e links em markdown.
function cleanTitle(title) {
  return String(title).replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/`/g, '');
}

// Quando a API falha (cota, rede), o mesmo teste abre no site do PageSpeed numa aba nova.
function showFallback(status, message, address) {
  const link = document.createElement('a');
  link.className = 'link';
  link.href = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(address)}`;
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = 'Abrir a análise no site do Google';
  status.replaceChildren(document.createTextNode(`${message} `), link);
}

function prefillQuote(address) {
  const siteField = document.getElementById('f-site');
  if (siteField && !siteField.value) siteField.value = address;
}
