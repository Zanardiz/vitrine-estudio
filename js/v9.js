// Vitrine Estúdio v9: barra, entradas na luz, o showroom que inclina para o mouse, botão fixo no celular e o formulário.
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const MIN_PHONE_DIGITS = 10;

  /* A barra ganha fundo depois que a página desce um pouco */
  function initBar() {
    const bar = $('[data-bar]');
    if (!bar) return;
    const update = () => bar.classList.toggle('is-solid', window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* Cada peça aparece ao entrar na tela e recebe uma passada de luz */
  function initReveal() {
    const items = $$('[data-reveal]');
    if (!('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('is-in', 'is-lit')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in', 'is-lit');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    items.forEach((el) => io.observe(el));
  }

  /* O showroom inclina alguns graus na direção do mouse; o reflexo do piso acompanha porque faz parte do mesmo conjunto */
  function initStage() {
    const stage = $('[data-stage]');
    const set = $('[data-stage-set]');
    if (!stage || !set || !matchMedia('(pointer: fine)').matches) return;
    const range = calm ? 3 : 7;
    const area = stage.closest('section');
    area.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / r.width;
      const y = (e.clientY - (r.top + r.height / 2)) / r.height;
      set.style.setProperty('--ry', `${(-12 + x * range).toFixed(2)}deg`);
      set.style.setProperty('--rx', `${(4 - y * range * 0.5).toFixed(2)}deg`);
    });
    area.addEventListener('pointerleave', () => {
      set.style.removeProperty('--ry');
      set.style.removeProperty('--rx');
    });
  }

  /* No celular, o botão de pedido aparece depois da abertura e some quando o formulário está na tela */
  function initDock() {
    const dock = $('[data-dock]');
    const hero = $('.hero');
    const order = $('#pedido');
    if (!dock || !hero || !order || !('IntersectionObserver' in window)) return;
    let pastHero = false;
    let atOrder = false;
    const update = () => dock.classList.toggle('is-on', pastHero && !atOrder);
    new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; update(); }).observe(hero);
    new IntersectionObserver(([e]) => { atOrder = e.isIntersecting; update(); }, { threshold: 0.05 }).observe(order);
  }

  /* Formulário do pedido */
  const isContact = (value) => EMAIL.test(value) || value.replace(/\D/g, '').length >= MIN_PHONE_DIGITS;

  function checkFields(form) {
    const checks = [
      [$('#f-name', form), (v) => v.trim().length > 0],
      [$('#f-contato', form), (v) => isContact(v.trim())],
    ];
    const bad = [];
    checks.forEach(([field, ok]) => {
      const valid = ok(field.value);
      field.setAttribute('aria-invalid', String(!valid));
      const err = document.getElementById(`${field.id}-err`);
      if (err) err.hidden = valid;
      if (!valid) bad.push(field);
    });
    return bad;
  }

  function serviceFields(form) {
    return new Set($$('input[type="hidden"], input[name="botcheck"]', form).map((i) => i.name));
  }

  function openMail(form) {
    const hidden = serviceFields(form);
    const body = [...new FormData(form).entries()].filter(([k, v]) => !hidden.has(k) && String(v).trim()).map(([k, v]) => `${k}: ${v}`).join('\n');
    window.location.href = `mailto:${form.dataset.mailto}?subject=${encodeURIComponent('Pedido de prévia')}&body=${encodeURIComponent(body)}`;
  }

  function showDone(form) {
    const done = $('[data-form-done]');
    $('[data-done-name]', done).textContent = $('#f-name', form).value.trim().split(/\s+/)[0];
    $('[data-done-contact]', done).textContent = $('#f-contato', form).value.trim();
    form.hidden = true;
    done.hidden = false;
    done.focus();
  }

  function showSendError(form, status, submit) {
    status.textContent = 'Não consegui enviar agora. Tente de novo ou ';
    const link = document.createElement('a');
    link.href = '#pedido';
    link.textContent = 'mande por e-mail';
    link.addEventListener('click', (ev) => { ev.preventDefault(); openMail(form); });
    status.append(link, '.');
    submit.disabled = false;
    submit.textContent = 'Pedir minha prévia grátis';
  }

  function initForm() {
    const form = $('[data-form]');
    if (!form) return;
    const status = $('[data-form-status]', form);
    const submit = $('[data-submit]', form);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (submit.disabled) return;
      const bad = checkFields(form);
      if (bad.length) {
        status.textContent = bad.length === 1 ? 'Falta corrigir 1 campo.' : `Falta corrigir ${bad.length} campos.`;
        bad[0].focus();
        return;
      }
      const endpoint = form.dataset.endpoint;
      if (!endpoint) { openMail(form); status.textContent = 'Abrimos o seu e-mail com o pedido pronto. É só enviar.'; return; }
      const data = new FormData(form);
      const contact = String(data.get('contato')).trim();
      if (EMAIL.test(contact)) data.set('email', contact); // assim a resposta do Gmail vai direto para a pessoa
      submit.disabled = true;
      submit.textContent = 'Enviando…';
      status.textContent = '';
      try {
        const res = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        const answer = await res.json().catch(() => ({}));
        if (!res.ok || answer.success === false) throw new Error(answer.message || `HTTP ${res.status}`);
        showDone(form);
      } catch (problem) {
        console.error('Envio do pedido falhou:', problem);
        showSendError(form, status, submit);
      }
    });
    ['#f-name', '#f-contato'].forEach((sel) => {
      const field = $(sel, form);
      field.addEventListener('blur', () => { if (field.getAttribute('aria-invalid') === 'true') checkFields(form); });
    });
  }

  /* Fundo: cinzas caindo devagar; o mouse (ou o dedo) espalha as que estão perto e elas voltam a cair */
  const ASH = { AREA_PER_FLAKE: 9000, MAX: 220, MAX_PHONE: 80, RADIUS: 130, PUSH: 260, FRICTION: 0.92, DPR_MAX: 1.5 };

  function makeFlake(w, h, anywhere) {
    const size = 0.6 + Math.random() ** 2 * 2.2;
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : -10 - Math.random() * 40,
      size,
      stretch: 1 + Math.random() * 1.4,          // algumas lascas são mais compridas
      fall: 10 + size * 9 + Math.random() * 10,   // px por segundo; as maiores caem mais rápido
      sway: 6 + Math.random() * 14,
      phase: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 1.2,
      angle: Math.random() * Math.PI,
      alpha: 0.18 + Math.random() * 0.42,
      tone: 150 + Math.floor(Math.random() * 70), // do aço ao cinza claro
      vx: 0, vy: 0,
    };
  }

  function initAsh() {
    const canvas = $('[data-ash]');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const phone = matchMedia('(max-width: 639px)').matches;
    const slow = calm ? 0.5 : 1;
    let w = 0; let h = 0; let flakes = [];
    const pointer = { x: -9999, y: -9999 };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, ASH.DPR_MAX);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.min(phone ? ASH.MAX_PHONE : ASH.MAX, Math.round((w * h) / ASH.AREA_PER_FLAKE * (calm ? 0.6 : 1)));
      while (flakes.length < target) flakes.push(makeFlake(w, h, true));
      flakes.length = target;
    }

    function step(f, dt, t) {
      const dx = f.x - pointer.x; const dy = f.y - pointer.y;
      const dist = Math.hypot(dx, dy);
      if (dist < ASH.RADIUS && dist > 0.1) {
        const force = (1 - dist / ASH.RADIUS) * ASH.PUSH * dt;
        f.vx += (dx / dist) * force; f.vy += (dy / dist) * force;
        f.spin += (Math.random() - 0.5) * 0.4;
      }
      f.vx *= ASH.FRICTION; f.vy *= ASH.FRICTION;
      f.x += (Math.sin(t * 0.0006 + f.phase) * f.sway * dt + f.vx) * 1;
      f.y += f.fall * slow * dt + f.vy;
      f.angle += f.spin * dt;
      if (f.y > h + 12 || f.x < -30 || f.x > w + 30) Object.assign(f, makeFlake(w, h, false));
    }

    function draw(f) {
      ctx.save();
      ctx.translate(f.x, f.y); ctx.rotate(f.angle);
      ctx.fillStyle = `rgba(${f.tone},${f.tone},${f.tone + 4},${f.alpha})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, f.size * f.stretch, f.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    let last = performance.now(); let running = true;
    function frame(now) {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      ctx.clearRect(0, 0, w, h);
      flakes.forEach((f) => { step(f, dt, now); draw(f); });
      requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', (e) => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
    window.addEventListener('pointerleave', () => { pointer.x = -9999; pointer.y = -9999; });
    document.addEventListener('pointerout', (e) => { if (!e.relatedTarget) { pointer.x = -9999; pointer.y = -9999; } });
    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
      if (running) { last = performance.now(); requestAnimationFrame(frame); }
    });
    requestAnimationFrame(frame);
  }

  initAsh();
  initBar();
  initReveal();
  initStage();
  initDock();
  initForm();
})();
