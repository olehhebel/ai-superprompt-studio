(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header');
  const sections = [...document.querySelectorAll('[data-section]')];
  const navLinks = [...document.querySelectorAll('.desktop-nav [data-nav]')];
  const navIndicator = document.querySelector('.nav-indicator');

  const setActiveNav = (section) => {
    const name = section?.dataset.section || 'hero';
    const theme = section?.dataset.headerTheme || 'light';
    header.dataset.theme = theme;

    navLinks.forEach(link => link.classList.toggle('is-active', link.dataset.nav === name));
    const active = navLinks.find(link => link.dataset.nav === name);
    if (!active || name === 'hero') {
      navIndicator.style.opacity = '0';
      navIndicator.style.width = '0px';
      return;
    }
    const navRect = active.parentElement.getBoundingClientRect();
    const rect = active.getBoundingClientRect();
    navIndicator.style.width = `${rect.width}px`;
    navIndicator.style.transform = `translateX(${rect.left - navRect.left}px)`;
    navIndicator.style.opacity = '1';
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActiveNav(visible.target);
  }, { threshold: [0.2,0.4,0.55,0.7] });
  sections.forEach(section => sectionObserver.observe(section));

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = [...entry.target.parentElement.querySelectorAll('.reveal-item')];
      const index = Math.max(0, siblings.indexOf(entry.target));
      entry.target.style.transitionDelay = reduceMotion ? '0ms' : `${Math.min(index * 55, 220)}ms`;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.18 });
  document.querySelectorAll('.reveal-item').forEach(el => revealObserver.observe(el));

  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const closeMobileMenu = () => {
    mobileMenu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
  };
  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    mobileMenu.hidden = open;
    menuToggle.setAttribute('aria-expanded', String(!open));
  });
  mobileMenu?.querySelectorAll('a, button').forEach(el => el.addEventListener('click', closeMobileMenu));

  window.addEventListener('load', () => {
    if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    const paths = gsap.utils.toArray('.problem-path');
    paths.forEach((path, i) => {
      gsap.fromTo(path,
        { opacity: 0, scale: .985 },
        { opacity: 1, scale: 1, duration: .7, delay: i * .08, ease: 'power2.out',
          scrollTrigger: { trigger: '#problems', start: 'top 72%', toggleActions: 'play none none reverse' }
        }
      );
    });

    gsap.to('.problem-art', {
      opacity: 0,
      yPercent: 7,
      ease: 'none',
      scrollTrigger: { trigger: '.problem-sprint-story', start: '42% center', end: '57% center', scrub: .7 }
    });

    gsap.fromTo('.sprint-line', { scaleX: 0 }, {
      scaleX: 1,
      stagger: .06,
      ease: 'none',
      scrollTrigger: { trigger: '#sprints', start: 'top 82%', end: 'top 32%', scrub: .7 }
    });

    gsap.to('.white-transition', {
      scale: 8,
      ease: 'none',
      scrollTrigger: { trigger: '.outcome-team-story', start: '41% center', end: '55% center', scrub: .7 }
    });
  });

  const dialog = document.querySelector('#project-dialog');
  const projectForm = document.querySelector('#project-form');
  const defaultState = projectForm.querySelector('[data-form-state="default"]');
  const successState = projectForm.querySelector('[data-form-state="success"]');
  const productInputs = projectForm.querySelector('[data-product-inputs]');
  const productSummary = projectForm.querySelector('[data-product-summary]');
  const summaryTitle = projectForm.querySelector('[data-summary-title]');
  const summaryValue = projectForm.querySelector('[data-summary-value]');
  const productUrl = projectForm.querySelector('#product-url');
  const productFile = projectForm.querySelector('#product-file');
  const email = projectForm.querySelector('#email');
  const dropzone = projectForm.querySelector('[data-dropzone]');
  const removeProduct = projectForm.querySelector('[data-remove-product]');
  const submitButton = projectForm.querySelector('.form-submit');
  const formError = projectForm.querySelector('[data-form-error]');
  const dialogClose = projectForm.querySelector('.dialog-close');
  const successClose = projectForm.querySelector('.success-close');
  let selectedProduct = null;
  let source = 'unknown';
  let selectedSprint = '';
  let opener = null;
  let submitting = false;

  const honeypot = document.createElement('input');
  honeypot.type = 'text';
  honeypot.name = 'website';
  honeypot.tabIndex = -1;
  honeypot.autocomplete = 'off';
  honeypot.setAttribute('aria-hidden', 'true');
  honeypot.style.position = 'absolute';
  honeypot.style.left = '-10000px';
  honeypot.style.width = '1px';
  honeypot.style.height = '1px';
  honeypot.style.opacity = '0';
  honeypot.style.pointerEvents = 'none';
  projectForm.appendChild(honeypot);

  productUrl.maxLength = 2048;
  email.maxLength = 254;

  const validEmail = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
  const validUrl = (value) => {
    try {
      const url = new URL(value.trim());
      return ['http:', 'https:'].includes(url.protocol);
    } catch { return false; }
  };
  const updateSubmit = () => {
    submitButton.disabled = submitting || !(selectedProduct && validEmail());
  };

  const transitionDOM = (fn) => {
    if (!reduceMotion && document.startViewTransition) return document.startViewTransition(fn);
    fn();
    return null;
  };

  const acceptUrl = () => {
    if (selectedProduct || !validUrl(productUrl.value)) return false;
    selectedProduct = { type: 'url', value: productUrl.value.trim() };
    transitionDOM(() => {
      productInputs.hidden = true;
      productSummary.hidden = false;
      summaryTitle.textContent = 'Product link added';
      summaryValue.textContent = selectedProduct.value;
    });
    updateSubmit();
    return true;
  };

  const acceptFile = (file) => {
    if (!file) return;
    const allowedExtensions = ['pdf','png','jpg','jpeg','zip'];
    const allowedMimeTypes = ['application/pdf','image/png','image/jpeg','application/zip','application/x-zip-compressed'];
    const extension = (file.name.split('.').pop() || '').toLowerCase();
    const mimeType = String(file.type || '').toLowerCase();
    if (!allowedExtensions.includes(extension) || !allowedMimeTypes.includes(mimeType)) {
      formError.textContent = 'Choose a supported file.';
      productFile.value = '';
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      formError.textContent = 'File is too large. Maximum 4 MB.';
      productFile.value = '';
      return;
    }
    formError.textContent = '';
    selectedProduct = { type: 'file', value: file.name, file };
    productUrl.value = '';
    const size = file.size >= 1024 * 1024 ? `${(file.size / (1024*1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;
    transitionDOM(() => {
      productInputs.hidden = true;
      productSummary.hidden = false;
      summaryTitle.textContent = 'File added';
      summaryValue.textContent = `${file.name} · ${size}`;
    });
    updateSubmit();
  };

  productUrl.addEventListener('paste', () => setTimeout(acceptUrl, 0));
  productUrl.addEventListener('blur', acceptUrl);
  productUrl.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (acceptUrl()) email.focus();
    }
  });
  productFile.addEventListener('change', () => acceptFile(productFile.files?.[0]));
  email.addEventListener('input', updateSubmit);

  ['dragenter','dragover'].forEach(type => dropzone.addEventListener(type, (event) => {
    event.preventDefault();
    dropzone.classList.add('is-dragover');
  }));
  ['dragleave','drop'].forEach(type => dropzone.addEventListener(type, (event) => {
    event.preventDefault();
    dropzone.classList.remove('is-dragover');
  }));
  dropzone.addEventListener('drop', (event) => {
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    const transfer = new DataTransfer();
    transfer.items.add(file);
    productFile.files = transfer.files;
    acceptFile(file);
  });

  removeProduct.addEventListener('click', () => {
    selectedProduct = null;
    productUrl.value = '';
    productFile.value = '';
    formError.textContent = '';
    transitionDOM(() => {
      productSummary.hidden = true;
      productInputs.hidden = false;
    });
    updateSubmit();
    productUrl.focus();
  });

  const resetForm = () => {
    selectedProduct = null;
    productUrl.value = '';
    productFile.value = '';
    email.value = '';
    honeypot.value = '';
    submitting = false;
    formError.textContent = '';
    submitButton.disabled = true;
    productSummary.hidden = true;
    productInputs.hidden = false;
    defaultState.hidden = false;
    successState.hidden = true;
    dialogClose.hidden = false;
  };

  const openForm = (event) => {
    opener = event.currentTarget;
    source = opener.dataset.source || 'unknown';
    selectedSprint = opener.dataset.sprint || '';
    resetForm();
    dialog.showModal();
    requestAnimationFrame(() => productUrl.focus({ preventScroll: true }));
  };
  document.querySelectorAll('[data-open-form]').forEach(button => button.addEventListener('click', openForm));

  const closeDialog = () => {
    dialog.close();
    opener?.focus?.({ preventScroll: true });
  };
  dialogClose.addEventListener('click', closeDialog);
  successClose.addEventListener('click', closeDialog);
  dialog.addEventListener('click', event => {
    if (event.target === dialog) closeDialog();
  });
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    closeDialog();
  });

  const showSuccess = () => {
    transitionDOM(() => {
      defaultState.hidden = true;
      successState.hidden = false;
      dialogClose.hidden = true;
    });
    setTimeout(() => successClose.focus({ preventScroll: true }), reduceMotion ? 0 : 360);
  };

  projectForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting) return;
    formError.textContent = '';
    if (!selectedProduct) {
      formError.textContent = 'Add a product link or file.';
      return;
    }
    if (!validEmail()) {
      formError.textContent = 'Enter a valid email.';
      email.focus();
      return;
    }

    submitting = true;
    updateSubmit();
    submitButton.setAttribute('aria-busy', 'true');

    try {
      const data = new FormData();
      data.append('email', email.value.trim());
      if (selectedProduct.type === 'url') data.append('product_url', selectedProduct.value);
      if (selectedProduct.type === 'file') data.append('product_file', selectedProduct.file, selectedProduct.file.name);
      data.append('website', honeypot.value);
      data.append('cta_source', source);
      if (selectedSprint) data.append('selected_sprint', selectedSprint);
      data.append('page_url', location.href);
      data.append('referrer', document.referrer || 'direct');
      const params = new URLSearchParams(location.search);
      ['utm_source','utm_medium','utm_campaign'].forEach(key => { if (params.get(key)) data.append(key, params.get(key)); });

      const response = await fetch('/api/contact', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.ok !== true) throw new Error('Submission failed');

      showSuccess();
    } catch {
      formError.textContent = 'Something went wrong. Try again.';
    } finally {
      submitting = false;
      submitButton.removeAttribute('aria-busy');
      if (!successState.hidden) {
        submitButton.disabled = true;
      } else {
        updateSubmit();
      }
    }
  });

  const installInterfaceReportPromo = () => {
    if (document.querySelector('[data-interface-report-promo]')) return;
    const footer = document.querySelector('.site-footer');
    if (!footer) return;

    const style = document.createElement('style');
    style.textContent = `
      .ir-promo{background:#050505;color:#fff;padding:clamp(72px,9vw,144px) 24px;border-top:1px solid rgba(255,255,255,.12)}
      .ir-promo__inner{max-width:1440px;margin:0 auto}.ir-promo__eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;opacity:.58;margin-bottom:18px}
      .ir-promo__head{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(280px,.75fr);gap:40px;align-items:end;margin-bottom:44px}.ir-promo h2{font-size:clamp(42px,6vw,94px);line-height:.95;letter-spacing:-.055em;margin:0;max-width:980px}.ir-promo__head p{font-size:18px;line-height:1.45;max-width:560px;margin:0;opacity:.74}
      .ir-promo__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.ir-promo__card{min-height:420px;padding:28px;display:flex;flex-direction:column;justify-content:space-between;text-decoration:none;border:1px solid rgba(255,255,255,.15);transition:transform .25s ease,border-color .25s ease}.ir-promo__card:hover{transform:translateY(-6px);border-color:rgba(255,255,255,.55)}
      .ir-promo__card:nth-child(1){background:#0b0b0d;color:#fff}.ir-promo__card:nth-child(2){background:#065dff;color:#fff}.ir-promo__card:nth-child(3){background:#f4f4ef;color:#050505}.ir-promo__num{font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.7}.ir-promo__card strong{font-size:clamp(28px,3vw,46px);line-height:1.02;letter-spacing:-.035em;font-weight:500}.ir-promo__card span:last-child{font-size:15px;line-height:1.35;opacity:.78}.ir-promo__disclosure{margin-top:18px;font-size:12px;line-height:1.5;opacity:.48;max-width:900px}
      @media (max-width:900px){.ir-promo__head{grid-template-columns:1fr}.ir-promo__grid{grid-template-columns:1fr}.ir-promo__card{min-height:300px}}
    `;
    document.head.appendChild(style);

    const section = document.createElement('section');
    section.className = 'ir-promo';
    section.dataset.interfaceReportPromo = '';
    section.setAttribute('aria-labelledby', 'ir-promo-title');
    section.innerHTML = `
      <div class="ir-promo__inner">
        <div class="ir-promo__eyebrow">Independent media · Interface Report</div>
        <div class="ir-promo__head">
          <h2 id="ir-promo-title">Want your product seen by people who build products?</h2>
          <p>Interface Report is our independent publication about AI products, agents, design and engineering. Commercial placements are clearly labeled and kept separate from editorial decisions.</p>
        </div>
        <div class="ir-promo__grid">
          <a class="ir-promo__card" href="https://interfacereport.com/advertise/?utm_source=superprompt.pro&utm_medium=referral&utm_campaign=network_crosspromo&utm_content=sponsored_story">
            <span class="ir-promo__num">01 · Sponsored Story</span><strong>Place a clearly labeled product story.</strong><span>Permanent URL · editorial review · publication metadata ↗</span>
          </a>
          <a class="ir-promo__card" href="https://interfacereport.com/advertise/?utm_source=superprompt.pro&utm_medium=referral&utm_campaign=network_crosspromo&utm_content=founder_feature">
            <span class="ir-promo__num">02 · Founder / Product Feature</span><strong>Turn evidence into a credible commercial feature.</strong><span>Editor-led structure · substantiation · sponsor disclosure ↗</span>
          </a>
          <a class="ir-promo__card" href="https://interfacereport.com/advertise/?utm_source=superprompt.pro&utm_medium=referral&utm_campaign=network_crosspromo&utm_content=feature_distribution">
            <span class="ir-promo__num">03 · Feature + Distribution</span><strong>Publish and extend the reach when inventory exists.</strong><span>Feature · selected homepage/newsletter/social distribution ↗</span>
          </a>
        </div>
        <p class="ir-promo__disclosure">Commercial cross-promotion. Interface Report editorial coverage is not sold, guaranteed or influenced by SuperPrompt client relationships.</p>
      </div>`;
    footer.parentNode.insertBefore(section, footer);
  };
  installInterfaceReportPromo();
})();
