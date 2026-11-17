// Análise grátis: roda o PageSpeed Insights (Google) no endereço digitado e mostra as quatro notas
// e os pontos a corrigir. Sem chave, a cota pública do Google se esgota quase sempre (erro 429):
// crie uma chave grátis no Google Cloud (PageSpeed Insights API), restrinja-a ao domínio do site
// (referenciadores HTTP) e cole em API_KEY. Um link com ?url=empresa.com.br#analise já roda a análise.
const API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
// Chave pública de navegador, restrita no Google Cloud ao site https://zanardiz.github.io/* e só à PageSpeed Insights API.
const API_KEY = 'AIzaSyDHWDo7R84w_Xi5EO62HoaFLAG6hShmS5k';
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
  if (response.status === 403) {
    // chave sem a API ativada, ou restrição de domínio: o problema é nosso, não o endereço digitado
    throw new Error('A análise do Google está indisponível agora.');
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
// O Google às vezes devolve os títulos em inglês; os mais comuns, em português simples para o dono da empresa.
const ISSUE_PT = {
  'robots-txt': 'O arquivo que orienta o Google (robots.txt) tem erro',
  'redirects': 'A página passa por redirecionamentos antes de abrir',
  'redirects-insight': 'A página passa por redirecionamentos antes de abrir',
  'forced-reflow-insight': 'O site faz o navegador recalcular a página várias vezes',
  'image-delivery-insight': 'As imagens estão mais pesadas do que precisam',
  'network-dependency-tree-insight': 'Muitos arquivos carregam em fila, um esperando o outro',
  'render-blocking-insight': 'Arquivos que atrasam a primeira aparição da página',
  'render-blocking-resources': 'Arquivos que atrasam a primeira aparição da página',
  'lcp-discovery-insight': 'A imagem principal demora a ser encontrada',
  'lcp-breakdown-insight': 'O maior elemento da tela demora a aparecer',
  'cache-insight': 'Os arquivos não ficam guardados no celular de quem volta',
  'uses-long-cache-ttl': 'Os arquivos não ficam guardados no celular de quem volta',
  'document-latency-insight': 'O servidor demora para responder',
  'font-display-insight': 'O texto some enquanto a fonte carrega',
  'cls-culprits-insight': 'Partes da página pulam de lugar enquanto carrega',
  'third-parties-insight': 'Serviços de fora deixam o site mais lento',
  'unused-javascript': 'Código que o site baixa e não usa',
  'unused-css-rules': 'Estilos que o site baixa e não usa',
  'unminified-javascript': 'Código sem compactar',
  'unminified-css': 'Estilos sem compactar',
  'uses-responsive-images': 'Imagens maiores do que a tela precisa',
  'modern-image-formats': 'Imagens em formato antigo e pesado',
  'offscreen-images': 'Imagens fora da tela carregando antes da hora',
  'total-byte-weight': 'A página é pesada demais para o celular',
  'dom-size': 'A página tem elementos demais',
  'bootup-time': 'O código demora para rodar no celular',
  'mainthread-work-breakdown': 'O celular fica ocupado demais carregando o site',
  'meta-description': 'Falta a descrição da página para o Google',
  'document-title': 'Falta o título da página para o Google',
  'link-text': 'Links com texto vago, como "clique aqui"',
  'crawlable-anchors': 'Links que o Google não consegue seguir',
  'is-crawlable': 'A página está bloqueada para o Google',
  'hreflang': 'Idioma da página mal informado',
  'canonical': 'Endereço principal da página mal informado',
  'image-alt': 'Imagens sem descrição para quem não enxerga',
  'color-contrast': 'Texto com pouco contraste, difícil de ler',
  'tap-targets': 'Botões pequenos ou colados demais para o dedo',
  'target-size': 'Botões pequenos ou colados demais para o dedo',
  'label': 'Campos de formulário sem nome',
  'button-name': 'Botões sem nome para leitores de tela',
  'link-name': 'Links sem nome para leitores de tela',
  'html-has-lang': 'A página não diz em que idioma está',
  'viewport': 'A página não se ajusta à tela do celular',
  'font-size': 'Letras pequenas demais para ler no celular',
  'is-on-https': 'O site não usa conexão segura (https)',
  'errors-in-console': 'O site mostra erros escondidos no navegador',
  'deprecations': 'O site usa recursos que os navegadores vão deixar de aceitar',
  'inspector-issues': 'O navegador encontrou problemas na página',
  'image-aspect-ratio': 'Imagens esticadas ou achatadas',
  'image-size-responsive': 'Imagens borradas por serem pequenas demais',
};

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
      failing.push({ title: ISSUE_PT[ref.id] ?? cleanTitle(audit.title), weight: ref.weight ?? 0, savings });
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
