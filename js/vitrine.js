// Vitrine Estúdio v3: movimento com o Motion (a biblioteca do Framer Motion, versão sem React).
// Abertura com troca de ramo em 3D, carrossel 3D arrastável, títulos que sobem e o manifesto lido no scroll.
(() => {
  'use strict';
  const M = window.Motion;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const SPRING = { type: 'spring', stiffness: 140, damping: 20 };
  const EASE = [0.2, 0.8, 0.2, 1];

  if (M && !reduce) document.documentElement.classList.add('motion-ok');

  /* ---------- Abertura: um ramo por vez ---------- */
  const SLIDES = [
    { bg: '#e8603c', fg: '#1a0f0a', word: '#ffffff', text: 'CAFÉ', name: 'Café Aurora', kind: 'Site-conceito · empresa fictícia', tag: 'Conceito', wa: 'Oi! Vocês fazem encomenda de bolo?', desk: 'assets/conceitos/cafe-desk.webp', mob: 'assets/conceitos/cafe-mob.webp', alt: 'Site-conceito do Café Aurora' },
    { bg: '#16120f', fg: '#f3ece4', word: '#ff7a1a', text: 'BARBA', name: 'Barbearia Brasa', kind: 'Site-conceito · empresa fictícia', tag: 'Conceito', wa: 'Tem horário amanhã às 18h?', desk: 'assets/conceitos/barbearia-desk.webp', mob: 'assets/conceitos/barbearia-mob.webp', alt: 'Site-conceito da Barbearia Brasa', dark: true },
    { bg: '#f5c6d8', fg: '#141414', word: '#ffffff', text: 'SORRIA', name: 'Odonto Clara', kind: 'Site-conceito · empresa fictícia', tag: 'Conceito', wa: 'Vocês atendem por convênio?', desk: 'assets/conceitos/clinica-desk.webp', mob: 'assets/conceitos/clinica-mob.webp', alt: 'Site-conceito da Odonto Clara' },
    { bg: '#2747ff', fg: '#ffffff', word: '#d7ff3a', text: 'BRILHO', name: "Macedo's Auto Detail", kind: 'Cliente real · Caxias do Sul', tag: 'Cliente real', wa: 'Quanto fica o polimento?', desk: 'assets/img/work-macedos-servicos.webp', mob: 'assets/img/work-macedos-servicos-celular.webp', alt: "Site da Macedo's Auto Detail", dark: true },
  ];
  const AUTO_MS = 6000;

  function initHero() {
    const hero = $('[data-hero]');
    if (!hero) return;
    const els = {
      word: $('[data-word]', hero), desk: $('[data-desk]', hero), mob: $('[data-mob]', hero),
      laptop: $('.laptop', hero), phone: $('.phone', hero), pair: $('[data-pair]', hero),
      count: $('[data-count]', hero), name: $('[data-name]', hero), kind: $('[data-kind]', hero),
      wa: $('[data-chip-wa]', hero), tag: $('[data-chip-tag]', hero), chips: $$('[data-chip]', hero),
      tabs: $$('[data-go]', hero),
    };
    SLIDES.forEach((s) => { [s.desk, s.mob].forEach((src) => { const i = new Image(); i.src = src; }); });

    let current = 0;
    let busy = false;
    let timer = null;

    const paint = (s) => {
      hero.style.setProperty('--fg', s.fg);
      hero.style.setProperty('--word', s.word);
      hero.toggleAttribute('data-dark', !!s.dark);
    };
    const fillText = (s, i) => {
      els.word.textContent = s.text;
      els.count.textContent = String(i + 1).padStart(2, '0');
      els.name.textContent = s.name;
      els.kind.textContent = s.kind;
      els.wa.textContent = s.wa;
      els.tag.textContent = s.tag;
      els.desk.src = s.desk; els.desk.alt = `${s.alt} no computador`;
      els.mob.src = s.mob; els.mob.alt = `${s.alt} no celular`;
      els.tabs.forEach((t, k) => t.setAttribute('aria-selected', String(k === i)));
    };

    async function go(next, dir = 1) {
      if (busy || next === current) return;
      const s = SLIDES[next];
      if (!M || reduce) {
        hero.style.setProperty('--bg', s.bg); paint(s); fillText(s, next); current = next; return;
      }
      busy = true;
      const out = 60 * dir;
      M.animate(hero, { backgroundColor: s.bg }, { duration: 0.8, ease: EASE });
      paint(s);
      await Promise.all([
        M.animate(els.laptop, { rotateY: [0, -out], x: [0, -120 * dir], opacity: [1, 0] }, { duration: 0.45, ease: [0.4, 0, 1, 1] }).finished,
        M.animate(els.phone, { rotateY: [0, -out], x: [0, -60 * dir], opacity: [1, 0] }, { duration: 0.4, delay: 0.05, ease: [0.4, 0, 1, 1] }).finished,
        M.animate(els.word, { y: [0, -60], opacity: [0.16, 0] }, { duration: 0.35 }).finished,
        M.animate(els.chips, { scale: [1, 0.6], opacity: [1, 0] }, { duration: 0.25 }).finished,
      ]);
      fillText(s, next);
      current = next;
      M.animate(els.word, { y: [80, 0], opacity: [0, 0.16] }, { duration: 0.7, ease: EASE });
      M.animate(els.laptop, { rotateY: [out, 0], x: [140 * dir, 0], opacity: [0, 1] }, SPRING);
      M.animate(els.phone, { rotateY: [out, 0], x: [90 * dir, 0], opacity: [0, 1] }, { ...SPRING, delay: 0.08 });
      await M.animate(els.chips, { scale: [0.6, 1], opacity: [0, 1] }, { type: 'spring', stiffness: 260, damping: 16, delay: M.stagger(0.09, { startDelay: 0.25 }) }).finished;
      busy = false;
    }
    const step = (d) => go((current + d + SLIDES.length) % SLIDES.length, d);
    const stopAuto = () => { if (timer) clearInterval(timer); timer = null; };
    const startAuto = () => { if (reduce) return; stopAuto(); timer = setInterval(() => step(1), AUTO_MS); };

    $('[data-next]', hero).addEventListener('click', () => { step(1); startAuto(); });
    $('[data-prev]', hero).addEventListener('click', () => { step(-1); startAuto(); });
    els.tabs.forEach((t) => t.addEventListener('click', () => { const n = Number(t.dataset.go); go(n, n > current ? 1 : -1); startAuto(); }));
    hero.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { step(1); startAuto(); }
      if (e.key === 'ArrowLeft') { step(-1); startAuto(); }
    });
    hero.addEventListener('pointerenter', stopAuto);
    hero.addEventListener('pointerleave', startAuto);
    hero.addEventListener('focusin', stopAuto);
    document.addEventListener('visibilitychange', () => (document.hidden ? stopAuto() : startAuto()));

    // parallax: o par de aparelhos e os balões seguem o mouse
    if (!reduce && window.matchMedia('(pointer: fine)').matches) {
      let raf = 0;
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          els.pair.style.transform = `rotateY(${-16 + px * 14}deg) rotateX(${6 - py * 10}deg)`;
          els.chips.forEach((c, k) => { c.style.translate = `${px * (18 + k * 12)}px ${py * (14 + k * 10)}px`; });
        });
      });
    }

    // entrada da página
    if (M && !reduce) {
      M.animate(els.phone, { z: 80 }, { duration: 0 });
      M.animate($$('[data-hero-in]', hero), { y: [40, 0], opacity: [0, 1] }, { duration: 0.9, ease: EASE, delay: M.stagger(0.09, { startDelay: 0.1 }) });
      M.animate(els.laptop, { rotateY: [50, 0], y: [80, 0], opacity: [0, 1] }, { ...SPRING, delay: 0.25 });
      M.animate(els.phone, { rotateY: [50, 0], y: [140, 0], opacity: [0, 1] }, { ...SPRING, delay: 0.4 });
      M.animate(els.chips, { scale: [0.4, 1], opacity: [0, 1] }, { type: 'spring', stiffness: 260, damping: 15, delay: M.stagger(0.12, { startDelay: 0.8 }) });
      M.animate(els.word, { y: [120, 0], opacity: [0, 0.16] }, { duration: 1.2, ease: EASE });
    }
    startAuto();
  }

  /* ---------- Carrossel 3D arrastável ---------- */
  function initRing() {
    const ring = $('[data-ring]');
    const spin = $('[data-ring-spin]');
    if (!ring || !spin) return;
    const cards = $$('.card3d', spin);
    const step = 360 / cards.length;
    let radius = 560;
    const setRadius = () => {
      const w = cards[0].getBoundingClientRect().width || 320;
      radius = Math.round((w / 2) / Math.tan(Math.PI / cards.length) * 1.06);
      cards.forEach((c) => c.style.setProperty('--r', `${radius}px`));
    };

    let angle = 0;
    const idle = reduce ? 0 : -0.08;
    let velocity = idle;
    let dragging = false;
    let lastX = 0;
    let moved = 0;
    let visible = false;
    const render = () => { spin.style.transform = `translateZ(${-radius * 0.72}px) rotateY(${angle}deg)`; };
    const loop = () => {
      if (!visible) return;
      if (!dragging) { velocity += (idle - velocity) * 0.02; angle += velocity; }
      render();
      requestAnimationFrame(loop);
    };
    setRadius();
    render();
    window.addEventListener('resize', () => { setRadius(); render(); });
    new IntersectionObserver(([e]) => { const was = visible; visible = e.isIntersecting; if (visible && !was) requestAnimationFrame(loop); }).observe(ring);

    ring.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; moved = 0; });
    window.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx);
      velocity = dx * 0.25; angle += velocity;
    });
    const end = () => { dragging = false; };
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    // um arrasto não abre o link; um toque sim
    cards.forEach((c) => c.addEventListener('click', (e) => { if (moved > 6) e.preventDefault(); }));
    ring.tabIndex = 0;
    ring.setAttribute('aria-label', 'Carrossel 3D dos sites: use as setas para girar');
    ring.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { angle -= step; render(); }
      if (e.key === 'ArrowLeft') { angle += step; render(); }
    });
  }

  /* ---------- Palavras: títulos que sobem e manifesto que acende ---------- */
  function wrapWords(el, make) {
    const out = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const [outer, target] = make(part);
            out.push(target);
            frag.append(outer);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    return out;
  }

  function initReveals() {
    if (!M || reduce) return;
    $$('[data-reveal]').forEach((h) => {
      const words = wrapWords(h, (part) => {
        const outer = document.createElement('span');
        outer.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.1em;margin-bottom:-.1em';
        const inner = document.createElement('span');
        inner.style.display = 'inline-block';
        inner.style.transform = 'translateY(110%)';
        inner.textContent = part;
        outer.append(inner);
        return [outer, inner];
      });
      M.inView(h, () => { M.animate(words, { y: ['110%', '0%'] }, { duration: 0.8, ease: EASE, delay: M.stagger(0.05) }); }, { amount: 0.3 });
    });
    $$('[data-rise]').forEach((el) => {
      M.inView(el, () => {
        const k = Math.max(0, $$('[data-rise]', el.parentElement).indexOf(el));
        M.animate(el, { y: [48, 0], opacity: [0, 1] }, { duration: 0.8, ease: EASE, delay: k * 0.08 });
      }, { amount: 0.15 });
    });
  }

  function initManifesto() {
    const p = $('[data-words]');
    if (!p) return;
    const words = wrapWords(p, (part) => { const s = document.createElement('span'); s.className = 'w'; s.textContent = part; return [s, s]; });
    if (!M || reduce) { words.forEach((w) => w.classList.add('on')); return; }
    M.scroll((progress) => {
      const lit = Math.round(progress * words.length * 1.15);
      words.forEach((w, i) => w.classList.toggle('on', i < lit));
    }, { target: p, offset: ['start 85%', 'end 45%'] });
  }

  /* ---------- Formulário do pedido ---------- */
  function initForm() {
    const form = $('[data-form]');
    if (!form) return;
    const status = $('[data-form-status]', form);
    const isBad = (f) => !f.value.trim() || (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
    form.addEventListener('submit', async (e) => {
      const fields = $$('[required]', form);
      const invalid = fields.filter(isBad);
      fields.forEach((f) => {
        const bad = invalid.includes(f);
        f.setAttribute('aria-invalid', String(bad));
        const err = document.getElementById(f.getAttribute('aria-describedby') || '');
        if (err) err.hidden = !bad;
      });
      if (invalid.length) {
        e.preventDefault();
        status.textContent = invalid.length === 1 ? '1 campo para corrigir.' : `${invalid.length} campos para corrigir.`;
        invalid[0].focus();
        return;
      }
      const endpoint = form.dataset.endpoint;
      if (!endpoint) return; // sem endereço de envio, o navegador abre o e-mail (mailto)
      e.preventDefault();
      status.textContent = 'Enviando…';
      try {
        const res = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        status.textContent = form.dataset.sent;
        form.reset();
      } catch (problem) {
        console.error('Envio do pedido falhou:', problem);
        status.textContent = 'Não conseguimos enviar agora. Tente de novo em instantes.';
      }
    });
  }

  initHero();
  initRing();
  initReveals();
  initManifesto();
  initForm();
})();
