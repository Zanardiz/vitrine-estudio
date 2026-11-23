(function () {
  'use strict';

  var body = document.body;
  var menuButton = document.querySelector('.pb-menu-toggle');
  var menu = document.querySelector('.pb-nav');
  var searchButton = document.querySelector('.pb-search-toggle');
  var searchPanel = document.querySelector('.pb-search-panel');
  var themeButton = document.querySelector('.pb-theme-toggle');
  var themePanel = document.querySelector('.pb-theme-panel');
  var themeOptions = document.querySelectorAll('[data-pb-theme-choice]');
  var customInputs = document.querySelectorAll('[data-pb-custom-var]');
  var customReset = document.querySelector('.pb-color-reset');
  var root = document.documentElement;
  var progress = document.querySelector('.pb-reading-progress');

  function setExpanded(button, state) {
    if (button) button.setAttribute('aria-expanded', state ? 'true' : 'false');
  }

  function closeThemePanel() {
    if (!themePanel) return;
    themePanel.classList.remove('is-open');
    themePanel.hidden = true;
    setExpanded(themeButton, false);
  }

  function setThemeChoiceState(theme) {
    Array.prototype.forEach.call(themeOptions, function (option) {
      option.setAttribute('aria-pressed', option.getAttribute('data-pb-theme-choice') === theme ? 'true' : 'false');
    });
  }

  function contrastFor(hex) {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) return '#ffffff';
    var red = parseInt(hex.slice(1, 3), 16);
    var green = parseInt(hex.slice(3, 5), 16);
    var blue = parseInt(hex.slice(5, 7), 16);
    return ((red * 299 + green * 587 + blue * 114) / 1000) > 150 ? '#111318' : '#ffffff';
  }

  function isLight(hex) {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) return false;
    var red = parseInt(hex.slice(1, 3), 16);
    var green = parseInt(hex.slice(3, 5), 16);
    var blue = parseInt(hex.slice(5, 7), 16);
    return ((red * 299 + green * 587 + blue * 114) / 1000) > 150;
  }

  function remember(key, value) {
    try { window.localStorage.setItem(key, value); } catch (error) { /* Preferência funciona durante a visita. */ }
  }

  var DEFAULT_THEME = 'bordo';
  var ALLOWED_THEMES = ['bordo', 'marinho', 'vermelho', 'escuro'];
  var customDefaults = {
    accent: '#8b5cf6',
    background: '#0b0812',
    surface: '#171123',
    border: '#6d28d9',
    text: '#f8f7fb'
  };
  var customProperties = {
    accent: '--pb-user-color',
    background: '--pb-custom-bg',
    surface: '--pb-custom-surface',
    border: '--pb-custom-border',
    text: '--pb-custom-text'
  };

  function readRemembered(key, fallback) {
    try { return window.localStorage.getItem(key) || fallback; } catch (error) { return fallback; }
  }

  function applyCustomColors(values, save) {
    Object.keys(customDefaults).forEach(function (key) {
      var value = values[key] || customDefaults[key];
      if (!/^#[0-9a-f]{6}$/i.test(value)) value = customDefaults[key];
      root.style.setProperty(customProperties[key], value);
      var input = document.querySelector('[data-pb-custom-var="' + key + '"]');
      if (input) input.value = value;
      if (save) remember('pb-custom-' + key, value);
    });
    root.style.setProperty('--pb-on-accent', contrastFor(values.accent || customDefaults.accent));
    root.style.colorScheme = isLight(values.background || customDefaults.background) ? 'light' : 'dark';
  }

  function currentCustomColors() {
    var oldAccent = readRemembered('pb-custom-color', customDefaults.accent);
    return {
      accent: readRemembered('pb-custom-accent', oldAccent),
      background: readRemembered('pb-custom-background', customDefaults.background),
      surface: readRemembered('pb-custom-surface', customDefaults.surface),
      border: readRemembered('pb-custom-border', customDefaults.border),
      text: readRemembered('pb-custom-text', customDefaults.text)
    };
  }

  function applyTheme(theme) {
    if (ALLOWED_THEMES.indexOf(theme) === -1) theme = DEFAULT_THEME;

    if (theme === 'custom') {
      applyCustomColors(currentCustomColors(), false);
    } else {
      root.style.removeProperty('--pb-on-accent');
      root.style.removeProperty('color-scheme');
    }

    root.setAttribute('data-pb-theme', theme);
    remember('pb-theme', theme);
    setThemeChoiceState(theme);
  }

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      var open = !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', open);
      body.classList.toggle('menu-open', open);
      setExpanded(menuButton, open);
    });

    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        menu.classList.remove('is-open');
        body.classList.remove('menu-open');
        setExpanded(menuButton, false);
      }
    });
  }

  if (searchButton && searchPanel) {
    searchButton.addEventListener('click', function () {
      var open = !searchPanel.classList.contains('is-open');
      closeThemePanel();
      searchPanel.classList.toggle('is-open', open);
      setExpanded(searchButton, open);
      if (open) {
        var field = searchPanel.querySelector('input[type="search"]');
        if (field) window.setTimeout(function () { field.focus(); }, 50);
      }
    });
  }

  if (themeButton && themePanel) {
    applyCustomColors(currentCustomColors(), false);
    if ((root.getAttribute('data-pb-theme') || DEFAULT_THEME) !== 'custom') {
      root.style.removeProperty('--pb-on-accent');
      root.style.removeProperty('color-scheme');
    }
    setThemeChoiceState(root.getAttribute('data-pb-theme') || DEFAULT_THEME);

    themeButton.addEventListener('click', function () {
      var open = themePanel.hidden;
      if (searchPanel) searchPanel.classList.remove('is-open');
      setExpanded(searchButton, false);
      themePanel.hidden = !open;
      themePanel.classList.toggle('is-open', open);
      setExpanded(themeButton, open);
    });

    Array.prototype.forEach.call(themeOptions, function (option) {
      option.addEventListener('click', function () {
        var theme = option.getAttribute('data-pb-theme-choice');
        applyTheme(theme);
      });
    });

    Array.prototype.forEach.call(customInputs, function (input) {
      input.addEventListener('input', function () {
        var values = currentCustomColors();
        values[input.getAttribute('data-pb-custom-var')] = input.value;
        applyCustomColors(values, true);
        applyTheme('custom');
      });
    });

    if (customReset) {
      customReset.addEventListener('click', function () {
        applyCustomColors(customDefaults, true);
        applyTheme('custom');
      });
    }

    document.addEventListener('click', function (event) {
      if (!themePanel.hidden && !themePanel.contains(event.target) && !themeButton.contains(event.target)) closeThemePanel();
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-pb-copy]'), function (button) {
    button.addEventListener('click', function () {
      var target = document.querySelector(button.getAttribute('data-pb-copy'));
      if (!target) return;
      var value = target.textContent.trim();
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(value);
      } else {
        var field = document.createElement('textarea');
        field.value = value;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        document.execCommand('copy');
        document.body.removeChild(field);
      }
      var original = button.textContent;
      button.textContent = 'Copiado!';
      window.setTimeout(function () { button.textContent = original; }, 1600);
    });
  });

  /* Formulário de envio: o CPF só é pedido para o Pix e o botão acompanha a escolha. */
  var submissionForm = document.querySelector('[data-pb-submission-form]');
  if (submissionForm) {
    var methodInputs = submissionForm.querySelectorAll('input[name="payment_method"]');
    var pixOnly = submissionForm.querySelector('[data-pb-pix-only]');
    var cpfInput = pixOnly ? pixOnly.querySelector('input') : null;
    var submitButton = submissionForm.querySelector('[data-pb-submit-label]');

    function syncPaymentMethod() {
      var selected = submissionForm.querySelector('input[name="payment_method"]:checked');
      if (!selected) return;
      var isPix = selected.value === 'pix';
      if (pixOnly) pixOnly.hidden = !isPix;
      if (cpfInput) cpfInput.required = isPix;
      if (submitButton && selected.getAttribute('data-pb-button-label')) {
        submitButton.textContent = selected.getAttribute('data-pb-button-label');
      }
    }

    Array.prototype.forEach.call(methodInputs, function (input) {
      input.addEventListener('change', syncPaymentMethod);
    });
    syncPaymentMethod();

    submissionForm.addEventListener('submit', function () {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Preparando o pagamento…';
      }
    });
  }

  var paymentStage = document.querySelector('[data-pb-payment-status]');
  if (paymentStage) {
    var paymentState = paymentStage.querySelector('.pb-payment-state');
    var paymentTitle = paymentStage.querySelector('[data-pb-payment-title]');
    var paymentMessage = paymentStage.querySelector('[data-pb-payment-message]');
    var paymentIcon = paymentStage.querySelector('.pb-payment-state__icon');
    var paymentEndpoint = paymentStage.getAttribute('data-status-url');

    function finishPayment(status) {
      if (!paymentState) return false;
      if (status === 'approved') {
        paymentState.classList.remove('is-pending', 'is-failed');
        paymentState.classList.add('is-approved');
        if (paymentIcon) paymentIcon.textContent = '✓';
        if (paymentTitle) paymentTitle.textContent = paymentStage.getAttribute('data-approved-title');
        if (paymentMessage) paymentMessage.textContent = paymentStage.getAttribute('data-approved-message');
        return true;
      }
      if (status === 'failed') {
        paymentState.classList.remove('is-pending', 'is-approved');
        paymentState.classList.add('is-failed');
        if (paymentIcon) paymentIcon.textContent = '×';
        if (paymentTitle) paymentTitle.textContent = paymentStage.getAttribute('data-failed-title');
        if (paymentMessage) paymentMessage.textContent = 'Gere um novo pagamento para tentar novamente.';
        return true;
      }
      return false;
    }

    function pollPayment() {
      if (!paymentEndpoint || paymentState.classList.contains('is-approved')) return;
      window.fetch(paymentEndpoint, { credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' } })
        .then(function (response) {
          if (!response.ok) throw new Error('status');
          return response.json();
        })
        .then(function (data) {
          if (!finishPayment(data.status)) window.setTimeout(pollPayment, 5000);
        })
        .catch(function () {
          window.setTimeout(pollPayment, 10000);
        });
    }

    window.setTimeout(pollPayment, 2500);
  }

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    if (menu) menu.classList.remove('is-open');
    if (searchPanel) searchPanel.classList.remove('is-open');
    closeThemePanel();
    body.classList.remove('menu-open');
    setExpanded(menuButton, false);
    setExpanded(searchButton, false);
  });

  function updateProgress() {
    if (!progress) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var value = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = Math.min(100, Math.max(0, value)) + '%';
  }

  if (progress) {
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }
}());

/* Layout "Cinema": a barra fica transparente sobre a capa e ganha fundo ao rolar. */
(function () {
  'use strict';
  var bar = document.querySelector('.pb-navbar--cinema');
  if (!bar || !document.querySelector('.pb-cine-hero')) return;
  var SCROLL_THRESHOLD = 40;
  function update() { bar.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD); }
  window.addEventListener('scroll', update, { passive: true });
  update();
}());

/* Entradas suaves: cada grupo aparece sozinho quando 15% dele entra na tela, uma vez só.
   Grupos mais altos que a tela aparecem assim que a borda surge (limite 0). */
(function () {
  'use strict';
  var root = document.documentElement;
  if (!root.classList.contains('pb-motion')) return;
  window.pbRevealReady = true;

  var VISIBLE_SHARE = 0.15;
  var STAGGER_STEP_SECONDS = 0.1;
  var groups = [];

  Array.prototype.forEach.call(document.querySelectorAll('[data-pb-reveal="up"], [data-pb-reveal-stagger]'), function (group) {
    groups.push(group);
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-pb-reveal-children]'), function (parent) {
    Array.prototype.forEach.call(parent.children, function (child) { groups.push(child); });
  });

  function show(group) {
    if (!group.hasAttribute('data-pb-reveal-stagger')) {
      group.classList.add('is-revealed');
      return;
    }
    /* Etapas em sequência: o grupo dispara junto e cada etapa começa 0,1s depois da anterior. */
    Array.prototype.forEach.call(group.children, function (step, index) {
      step.style.setProperty('--pb-stagger', (index * STAGGER_STEP_SECONDS) + 's');
      step.classList.add('is-revealed');
    });
  }

  function handle(entries, observer) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      show(entry.target);
    });
  }

  var regularObserver = new IntersectionObserver(handle, { threshold: VISIBLE_SHARE });
  var tallObserver = new IntersectionObserver(handle, { threshold: 0 });

  groups.forEach(function (group) {
    (group.offsetHeight > window.innerHeight ? tallObserver : regularObserver).observe(group);
  });
}());

/* Capa em carrossel: setas, pausa, deslizar o dedo e troca automática.
   A troca automática é o fim da barra de progresso (animação CSS): pausar a barra pausa o carrossel.
   Para no mouse, no foco do teclado e com a aba escondida; sem troca automática em "menos movimento". */
(function () {
  'use strict';
  var slider = document.querySelector('[data-pb-hero-slider]');
  if (!slider) return;
  var slides = slider.querySelectorAll('[data-pb-slide]');
  var media = slider.querySelectorAll('[data-pb-slide-media]');
  var controls = slider.querySelector('[data-pb-slider-controls]');
  if (slides.length < 2 || !controls) return;

  var SWIPE_MIN_PX = 50;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var current = 0;
  var pausedByUser = false;
  var hovering = false;
  var focusInside = false;
  var counter = controls.querySelector('[data-pb-slide-current]');
  var progress = controls.querySelector('[data-pb-slide-progress]');
  var pauseButton = controls.querySelector('[data-pb-slide-pause]');

  controls.hidden = false;
  if (reduceMotion) {
    if (pauseButton) pauseButton.hidden = true;
  } else {
    slider.classList.add('is-autoplay');
  }

  function pad(number) { return (number < 10 ? '0' : '') + number; }

  function restartProgress() {
    if (!progress || reduceMotion) return;
    progress.style.animation = 'none';
    void progress.offsetWidth; /* reinicia a animação da barra */
    progress.style.animation = '';
  }

  function updatePaused() {
    var paused = pausedByUser || hovering || focusInside || document.hidden;
    slider.classList.toggle('is-paused', paused);
  }

  function goTo(index) {
    index = (index + slides.length) % slides.length;
    if (index === current) return;
    [slides, media].forEach(function (list) {
      Array.prototype.forEach.call(list, function (item, i) {
        item.classList.toggle('is-active', i === index);
      });
    });
    Array.prototype.forEach.call(slides, function (slide, i) {
      var active = i === index;
      slide.toggleAttribute('inert', !active);
      if (active) slide.removeAttribute('aria-hidden'); else slide.setAttribute('aria-hidden', 'true');
    });
    current = index;
    if (counter) {
      counter.textContent = pad(index + 1);
      counter.classList.remove('is-changing');
      void counter.offsetWidth;
      counter.classList.add('is-changing');
    }
    restartProgress();
  }

  controls.querySelector('[data-pb-slide-next]').addEventListener('click', function () { goTo(current + 1); });
  controls.querySelector('[data-pb-slide-prev]').addEventListener('click', function () { goTo(current - 1); });

  if (pauseButton) {
    pauseButton.addEventListener('click', function () {
      pausedByUser = !pausedByUser;
      pauseButton.setAttribute('aria-pressed', pausedByUser ? 'true' : 'false');
      pauseButton.setAttribute('aria-label', pausedByUser ? 'Continuar a troca automática' : 'Pausar a troca automática');
      pauseButton.firstElementChild.textContent = pausedByUser ? '▶' : '❚❚';
      updatePaused();
    });
  }

  if (progress) {
    progress.addEventListener('animationend', function () { goTo(current + 1); });
  }

  slider.addEventListener('mouseenter', function () { hovering = true; updatePaused(); });
  slider.addEventListener('mouseleave', function () { hovering = false; updatePaused(); });
  slider.addEventListener('focusin', function () { focusInside = true; updatePaused(); });
  slider.addEventListener('focusout', function (event) {
    if (!slider.contains(event.relatedTarget)) { focusInside = false; updatePaused(); }
  });
  document.addEventListener('visibilitychange', updatePaused);

  /* Deslizar o dedo na imagem troca de matéria. */
  var stage = slider.querySelector('.pb-sticker-hero__media');
  var startX = null;
  if (stage) {
    stage.addEventListener('touchstart', function (event) { startX = event.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (event) {
      if (startX === null) return;
      var distance = event.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(distance) >= SWIPE_MIN_PX) goTo(distance < 0 ? current + 1 : current - 1);
    }, { passive: true });
  }
}());
