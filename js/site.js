// Vitrine Estúdio v6: rolagem suave (Lenis), textos que sobem palavra por palavra e fita azul
// desenhada pelo scroll (Motion), fotos em velocidades diferentes, reel, menu, cursor e formulário.
(() => {
  'use strict';
  const M = window.Motion;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const EASE = [0.2, 0.8, 0.2, 1];
  const REEL_MS = 2600;

  if (M && !reduce) document.documentElement.classList.add('motion-ok');

  /* Rolagem suave */
  let lenis = null;
  function initScroll() {
    if (reduce || !window.Lenis) return;
    lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const el = id.length > 1 && document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      closeMenu();
      lenis.scrollTo(el, { offset: -20, duration: 1.4 });
      history.replaceState(null, '', id);
    }));
  }

  /* Textos que sobem palavra por palavra */
  function initSplit() {
    if (!M || reduce) return;
    $$('[data-split]').forEach((el) => {
      const words = [];
      const walk = (node) => {
        [...node.childNodes].forEach((n) => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach((part) => {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.append(part); return; }
              const outer = document.createElement('span');
              outer.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.12em;margin-bottom:-.12em';
              const inner = document.createElement('span');
              inner.style.cssText = 'display:inline-block;transform:translateY(105%)';
              inner.textContent = part;
              outer.append(inner);
              frag.append(outer);
              words.push(inner);
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1) walk(n);
        });
      };
      walk(el);
      M.inView(el, () => { M.animate(words, { y: ['105%', '0%'] }, { duration: 0.9, ease: EASE, delay: M.stagger(0.04) }); }, { amount: 0.25 });
    });
    $$('[data-rise]').forEach((el) => {
      M.inView(el, () => {
        const k = Math.max(0, $$('[data-rise]', el.parentElement).indexOf(el));
        M.animate(el, { y: [60, 0], opacity: [0, 1] }, { duration: 1, ease: EASE, delay: (k % 3) * 0.1 });
      }, { amount: 0.15 });
    });
  }

  /* Fita azul desenhada conforme a página desce */
  function initRibbon() {
    const path = $('[data-ribbon]');
    const flow = $('[data-flow]');
    if (!path || !flow) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    if (!M || reduce) { path.style.strokeDashoffset = '0'; return; }
    path.style.strokeDashoffset = `${len}`;
    M.scroll((p) => { path.style.strokeDashoffset = `${len * (1 - Math.min(1, p * 1.15))}`; }, { target: flow, offset: ['start 85%', 'end end'] });
  }

  /* Fotos e celulares em velocidades diferentes */
  function initParallax() {
    if (reduce) return;
    const items = $$('[data-speed]').map((el) => ({ el, speed: Number(el.dataset.speed) || 0 }));
    if (!items.length) return;
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      items.forEach(({ el, speed }) => {
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2 - vh / 2;
        el.style.translate = `0 ${(-center * speed).toFixed(1)}px`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* Reel: os sites passando um atrás do outro */
  function initReel() {
    const reel = $('[data-reel]');
    if (!reel) return;
    const imgs = $$('img', reel);
    let i = 0;
    let timer = null;
    const next = () => { imgs[i].classList.remove('is-on'); i = (i + 1) % imgs.length; imgs[i].classList.add('is-on'); };
    if (!reduce) {
      new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !timer) timer = setInterval(next, REEL_MS);
        if (!e.isIntersecting && timer) { clearInterval(timer); timer = null; }
      }).observe(reel);
    }
    if (M && !reduce) {
      const l = $('[data-reel-l]', reel);
      const r = $('[data-reel-r]', reel);
      M.scroll((p) => { const s = (0.5 - p) * 160; l.style.translate = `${-s}px 0`; r.style.translate = `${s}px 0`; }, { target: reel, offset: ['start end', 'end start'] });
    }
  }

  /* Menu */
  const menu = $('[data-menu]');
  const openBtn = $('[data-menu-open]');
  function closeMenu() {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    openBtn?.setAttribute('aria-expanded', 'false');
    lenis?.start();
    openBtn?.focus();
  }
  function initMenu() {
    if (!menu || !openBtn) return;
    openBtn.addEventListener('click', () => {
      menu.hidden = false;
      openBtn.setAttribute('aria-expanded', 'true');
      lenis?.stop();
      $('a', menu)?.focus();
      if (M && !reduce) M.animate($$('li', menu), { y: [60, 0], opacity: [0, 1] }, { duration: 0.6, ease: EASE, delay: M.stagger(0.05) });
    });
    $('[data-menu-close]', menu).addEventListener('click', closeMenu);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  }

  /* Cursor */
  function initCursor() {
    const dot = $('[data-cursor]');
    if (!dot || !fine || reduce) return;
    let x = 0; let y = 0; let cx = 0; let cy = 0;
    window.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; dot.classList.add('on'); }, { passive: true });
    document.addEventListener('pointerleave', () => dot.classList.remove('on'));
    const tick = () => { cx += (x - cx) * 0.22; cy += (y - cy) * 0.22; dot.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    $$('a, button, summary, [data-stage]').forEach((el) => {
      el.addEventListener('pointerenter', () => dot.classList.add('big'));
      el.addEventListener('pointerleave', () => dot.classList.remove('big'));
    });
  }

  /* Formulário do pedido */
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

  initScroll();
  initSplit();
  initRibbon();
  initParallax();
  initReel();
  initMenu();
  initCursor();
  initForm();
})();
