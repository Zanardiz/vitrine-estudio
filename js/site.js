// Vitrine Estúdio v7: carregamento com contador, rolagem suave (Lenis), textos que sobem palavra por palavra,
// fita azul desenhada pelo scroll, passos que andam para o lado, faixa que acelera com o scroll,
// cartões que inclinam, botões com ímã, cursor com texto, reel, menu e formulário.
// Com "reduzir movimento" ligado no sistema, o movimento continua, só que mais curto e calmo.
(() => {
  'use strict';
  const M = window.Motion;
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const EASE = [0.2, 0.8, 0.2, 1];
  const D = (s) => (calm ? s * 0.6 : s);
  const REEL_MS = 2600;
  const LOADER_MS = 1600;

  if (M) document.documentElement.classList.add('motion-ok');
  let ready = false;
  const whenReady = (fn) => (ready ? fn() : document.addEventListener('vitrine:ready', fn, { once: true }));

  /* Rolagem suave */
  let lenis = null;
  function initScroll() {
    if (!window.Lenis) return;
    lenis = new window.Lenis({ lerp: calm ? 0.16 : 0.09, smoothWheel: true });
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

  /* Carregamento: contador de 0 a 100, depois a tela sobe e a abertura aparece */
  function initLoader() {
    const loader = $('[data-loader]');
    const finish = () => { ready = true; document.dispatchEvent(new Event('vitrine:ready')); };
    if (!loader || !M) { loader?.remove(); finish(); return; }
    const count = $('[data-loader-count]', loader);
    const bar = $('[data-loader-bar]', loader);
    lenis?.stop();
    M.animate(0, 100, { duration: D(LOADER_MS) / 1000, ease: [0.6, 0, 0.2, 1], onUpdate: (v) => { count.textContent = Math.round(v); bar.style.width = `${v}%`; } })
      .then(() => {
        loader.classList.add('done');
        finish();
        lenis?.start();
        M.animate(loader, { clipPath: ['inset(0 0 0% 0)', 'inset(0 0 100% 0)'] }, { duration: D(0.9), ease: [0.7, 0, 0.2, 1] }).then(() => loader.remove());
        const stage = $('[data-stage]');
        if (stage) M.animate(stage, { scale: [0.9, 1] }, { duration: D(1.3), ease: EASE });
      });
  }

  /* Textos que sobem palavra por palavra */
  function splitWords(el) {
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
            inner.style.cssText = 'display:inline-block;transform:translateY(105%) rotate(4deg);transform-origin:left bottom';
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
    el.classList.add('split-ready');
    return words;
  }
  function initSplit() {
    if (!M) return;
    $$('[data-split]').forEach((el) => {
      const words = splitWords(el);
      const play = () => M.animate(words, { y: ['105%', '0%'], rotate: [4, 0] }, { duration: D(1), ease: EASE, delay: M.stagger(0.045) });
      if (el.closest('.hero')) whenReady(() => setTimeout(play, 250));
      else M.inView(el, play, { amount: 0.25 });
    });
    $$('[data-rise]').forEach((el) => {
      M.inView(el, () => {
        const k = Math.max(0, $$('[data-rise]', el.parentElement).indexOf(el));
        M.animate(el, { y: [80, 0], opacity: [0, 1], scale: [0.96, 1] }, { duration: D(1.1), ease: EASE, delay: (k % 3) * 0.12 });
      }, { amount: 0.12 });
    });
    $$('.rule').forEach((el, k) => M.inView(el, () => { setTimeout(() => el.classList.add('in'), (k % 3) * 120); }, { amount: 0.3 }));
  }

  /* Fita azul desenhada conforme a página desce */
  function initRibbon() {
    const path = $('[data-ribbon]');
    const flow = $('[data-flow]');
    if (!path || !flow) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    if (!M) { path.style.strokeDashoffset = '0'; return; }
    path.style.strokeDashoffset = `${len}`;
    M.scroll((p) => { path.style.strokeDashoffset = `${len * (1 - Math.min(1, p * 1.15))}`; }, { target: flow, offset: ['start 85%', 'end end'] });
  }

  /* Passos que andam para o lado enquanto a página desce */
  function initHorizontal() {
    const sec = $('[data-hs]');
    const track = $('[data-hs-track]');
    const bar = $('[data-hs-bar]');
    if (!sec || !track || !M) return;
    let distance = 0;
    const size = () => {
      distance = Math.max(0, track.scrollWidth - track.parentElement.clientWidth + 20);
      sec.style.height = `${window.innerHeight + distance}px`;
    };
    size();
    window.addEventListener('resize', size);
    window.addEventListener('load', size);
    const imgs = $$('.hcard__img img', track);
    M.scroll((p) => {
      track.style.transform = `translateX(${-distance * p}px)`;
      bar.style.width = `${p * 100}%`;
      imgs.forEach((img, i) => { img.style.translate = `${(p * 120) - i * 30}px 0`; });
    }, { target: sec, offset: ['start start', 'end end'] });
  }

  /* Faixa que corre e acelera com a velocidade do scroll */
  function initBand() {
    const track = $('[data-band]');
    if (!track) return;
    let x = 0;
    let last = window.scrollY;
    let boost = 0;
    const tick = () => {
      const y = window.scrollY;
      boost += (Math.abs(y - last) * 0.12 - boost) * 0.1;
      last = y;
      x -= (calm ? 0.5 : 1) + boost;
      const half = track.scrollWidth / 2;
      if (-x >= half) x += half;
      track.style.transform = `translateX(${x}px) skewX(${-Math.min(boost, 12)}deg)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* Fotos e celulares em velocidades diferentes */
  function initParallax() {
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

  /* Cartões que inclinam seguindo o mouse */
  function initTilt() {
    if (!fine) return;
    $$('[data-tilt]').forEach((card) => {
      const img = $('.wcard__img', card);
      card.addEventListener('pointermove', (e) => {
        const r = img.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        img.style.transform = `perspective(900px) rotateY(${px * 10}deg) rotateX(${-py * 8}deg) translateZ(10px)`;
      });
      card.addEventListener('pointerleave', () => { img.style.transform = ''; });
    });
  }

  /* Botões com ímã */
  function initMagnet() {
    if (!fine) return;
    $$('[data-magnet]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.3}px, ${(e.clientY - r.top - r.height / 2) * 0.4}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* Reel: os sites passando e as palavras se afastando */
  function initReel() {
    const reel = $('[data-reel]');
    if (!reel) return;
    const imgs = $$('img', reel);
    let i = 0;
    let timer = null;
    const next = () => { imgs[i].classList.remove('is-on'); i = (i + 1) % imgs.length; imgs[i].classList.add('is-on'); };
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !timer) timer = setInterval(next, REEL_MS);
      if (!e.isIntersecting && timer) { clearInterval(timer); timer = null; }
    }).observe(reel);
    if (M) {
      const l = $('[data-reel-l]', reel);
      const r = $('[data-reel-r]', reel);
      M.scroll((p) => { const s = (0.5 - p) * 220; l.style.translate = `${-s}px 0`; r.style.translate = `${s}px 0`; }, { target: reel, offset: ['start end', 'end start'] });
      M.scroll((p) => { reel.style.clipPath = `inset(0 ${Math.max(0, 8 - p * 16).toFixed(2)}% round 30px)`; }, { target: reel, offset: ['start end', 'center center'] });
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
      if (M) {
        M.animate(menu, { clipPath: ['inset(0 0 100% 0 round 30px)', 'inset(0 0 0% 0 round 30px)'] }, { duration: D(0.7), ease: [0.7, 0, 0.2, 1] });
        M.animate($$('li', menu), { y: [80, 0], opacity: [0, 1] }, { duration: D(0.7), ease: EASE, delay: M.stagger(0.06, { startDelay: 0.2 }) });
      }
    });
    $('[data-menu-close]', menu).addEventListener('click', closeMenu);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  }

  /* Cursor que cresce e mostra texto */
  function initCursor() {
    const dot = $('[data-cursor]');
    const text = $('[data-cursor-text]');
    if (!dot || !fine) return;
    let x = 0; let y = 0; let cx = 0; let cy = 0;
    window.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; dot.classList.add('on'); }, { passive: true });
    document.addEventListener('pointerleave', () => dot.classList.remove('on'));
    const tick = () => { cx += (x - cx) * 0.2; cy += (y - cy) * 0.2; dot.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    const labels = [['[data-tilt], [data-reel]', 'Ver'], ['[data-stage]', 'Mexa'], ['.hcard--cta', 'Pedir']];
    labels.forEach(([sel, word]) => $$(sel).forEach((el) => {
      el.addEventListener('pointerenter', () => { text.textContent = word; dot.classList.add('label'); });
      el.addEventListener('pointerleave', () => dot.classList.remove('label'));
    }));
    $$('a, button, summary').forEach((el) => {
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
  initLoader();
  initSplit();
  initRibbon();
  initHorizontal();
  initBand();
  initParallax();
  initTilt();
  initMagnet();
  initReel();
  initMenu();
  initCursor();
  initForm();
})();
