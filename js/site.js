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
    // A roda do mouse é tratada pelas janelas (initPanels); no toque, a rolagem segue normal.
    lenis = new window.Lenis({ lerp: calm ? 0.16 : 0.09, smoothWheel: !fine });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const el = id.length > 1 && document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      closeMenu();
      // as seções grudam no topo; o marcador antes delas guarda a posição real
      const mark = el.previousElementSibling;
      lenis.scrollTo(mark && mark.tagName === 'I' ? mark : el, { duration: 1.4 });
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

  /* Janelas: cada seção gruda no topo, a próxima sobe por cima e a de baixo encolhe e escurece.
     Uma rolada (ou seta para baixo) leva à próxima janela; seções altas andam uma tela por vez. */
  const STEP_MS = 1.05;
  function initPanels() {
    const panels = $$('main > section, .flow > section, .foot');
    if (!panels.length) return;
    const marks = panels.map((p) => { const m = document.createElement('i'); m.style.cssText = 'display:block;height:0'; p.before(m); return m; });
    let stops = [];
    let tops = [];
    const measure = () => {
      const vh = window.innerHeight;
      stops = [];
      tops = [];
      panels.forEach((p, i) => {
        const h = p.offsetHeight;
        if (!p.classList.contains('hs')) p.style.setProperty('--stick', `${Math.min(0, vh - h)}px`);
        const top = marks[i].getBoundingClientRect().top + window.scrollY;
        tops.push(top);
        stops.push(Math.round(top));
        const extra = h - vh;
        if (extra > vh * 0.15) {
          const stepLen = p.classList.contains('hs') ? vh * 0.55 : vh * 0.8;
          for (let y = stepLen; y < extra; y += stepLen) stops.push(Math.round(top + y));
          stops.push(Math.round(top + extra));
        }
      });
      stops = [...new Set(stops)].sort((a, b) => a - b);
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    setTimeout(measure, 1500);

    // a janela de baixo encolhe e escurece enquanto a próxima sobe
    if (M) {
      panels.forEach((p, i) => {
        const next = panels[i + 1];
        if (!next || p.classList.contains('hs')) return;
        const shade = document.createElement('span');
        shade.className = 'panel-shade';
        p.append(shade);
        M.scroll((v) => {
          p.style.transform = v > 0 ? `scale(${(1 - 0.08 * v).toFixed(4)})` : '';
          p.style.borderRadius = v > 0 ? `${Math.round(v * 32)}px` : '';
          shade.style.opacity = (v * 0.55).toFixed(3);
        }, { target: next, offset: ['start end', 'start start'] });
      });
    }

    // contador de janelas
    const pager = document.createElement('div');
    pager.className = 'pager';
    pager.setAttribute('aria-hidden', 'true');
    pager.innerHTML = `<b data-pg>01</b><span>/ ${String(panels.length).padStart(2, '0')}</span><span class="pager__bar"><i data-pg-bar></i></span>${fine ? '<span class="pager__hint">Role ou use ↓</span>' : ''}`;
    document.body.append(pager);
    const pgNum = $('[data-pg]', pager);
    const pgBar = $('[data-pg-bar]', pager);
    const updatePager = () => {
      const y = window.scrollY + window.innerHeight * 0.5;
      let idx = 0;
      tops.forEach((t, i) => { if (t <= y) idx = i; });
      pgNum.textContent = String(idx + 1).padStart(2, '0');
      pgBar.style.width = `${((idx + 1) / panels.length) * 100}%`;
    };
    window.addEventListener('scroll', updatePager, { passive: true });
    updatePager();

    if (!fine || !lenis) return;
    let lock = false;
    const go = (dir) => {
      if (lock) return;
      const y = window.scrollY;
      const target = dir > 0 ? stops.find((s) => s > y + 8) : [...stops].reverse().find((s) => s < y - 8);
      if (target === undefined) return;
      lock = true;
      const unlock = () => { lock = false; };
      const safety = setTimeout(unlock, (D(STEP_MS) + 0.6) * 1000);
      lenis.scrollTo(target, { duration: D(STEP_MS), easing: (t) => 1 - Math.pow(1 - t, 4), onComplete: () => { clearTimeout(safety); setTimeout(unlock, 160); } });
    };
    const menuOpen = () => menu && !menu.hidden;
    window.addEventListener('wheel', (e) => {
      if (e.ctrlKey || menuOpen()) return;
      e.preventDefault();
      if (Math.abs(e.deltaY) < 4) return;
      go(Math.sign(e.deltaY));
    }, { passive: false });
    document.addEventListener('keydown', (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (menuOpen() || ['input', 'textarea', 'select'].includes(tag) || e.target.isContentEditable) return;
      const down = ['ArrowDown', 'PageDown'].includes(e.key) || (e.key === ' ' && !e.shiftKey);
      const up = ['ArrowUp', 'PageUp'].includes(e.key) || (e.key === ' ' && e.shiftKey);
      if (!down && !up) return;
      e.preventDefault();
      go(down ? 1 : -1);
    });
  }

  /* Capítulos: o celular entra de um jeito diferente em cada janela e os extras aparecem */
  function initChapters() {
    if (!M) return;
    const entries = {
      'chap--antes': { phone: { y: [260, 0], rotate: [30, 12], opacity: [0, 1] } },
      'chap--previa': { phone: { scale: [0.6, 1], rotate: [-20, 0], opacity: [0, 1] } },
      'chap--nota': { phone: { x: [-300, 0], rotate: [-40, -14], opacity: [0, 1] } },
      'chap--whats': { phone: { y: [300, 0], opacity: [0, 1] } },
      'chap--publica': { phone: { rotateY: [180, 0], scale: [0.8, 1], opacity: [0, 1] } },
    };
    $$('.chap').forEach((ch) => {
      const kind = Object.keys(entries).find((k) => ch.classList.contains(k));
      const phone = $('[data-chap]', ch);
      const extra = $('[data-chap-extra]', ch);
      if (phone) phone.style.opacity = '0';
      if (extra) extra.style.opacity = '0';
      M.inView(ch, () => {
        if (phone) M.animate(phone, entries[kind].phone, { type: 'spring', stiffness: 90, damping: 15, delay: 0.15 });
        if (!extra) return;
        if (kind === 'chap--antes') M.animate(extra, { scale: [3, 1], opacity: [0, 1], rotate: [-30, -14] }, { duration: D(0.45), ease: [0.6, 0, 0.3, 1.4], delay: 0.7 });
        if (kind === 'chap--nota') {
          extra.style.opacity = '1';
          M.animate(0, 90, { duration: D(1.6), ease: [0.2, 0.8, 0.2, 1], onUpdate: (v) => { extra.textContent = Math.round(v); } }).then(() => { extra.textContent = '90+'; });
        }
        if (kind === 'chap--whats') {
          extra.style.opacity = '1';
          M.animate($$('span', extra), { scale: [0.4, 1], y: [30, 0], opacity: [0, 1] }, { type: 'spring', stiffness: 260, damping: 16, delay: M.stagger(0.45, { startDelay: 0.5 }) });
        }
      }, { amount: 0.45 });
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
  initPanels();
  initChapters();
  initForm();
})();
