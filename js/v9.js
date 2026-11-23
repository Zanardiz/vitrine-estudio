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

  initBar();
  initReveal();
  initStage();
  initDock();
  initForm();
})();
