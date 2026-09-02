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

  const validEmail = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
  const validUrl = (value) => {
    try {
      const url = new URL(value.trim());
      return ['http:', 'https:'].includes(url.protocol);
    } catch { return false; }
  };
  const updateSubmit = () => {
    submitButton.disabled = !(selectedProduct && validEmail());
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
    const extension = (file.name.split('.').pop() || '').toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      formError.textContent = 'Choose a supported file.';
      productFile.value = '';
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      formError.textContent = 'File is too large. Maximum 20 MB.';
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

    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    const endpoint = document.body.dataset.formEndpoint?.trim();
    const demo = document.body.dataset.demoForm === 'true';

    try {
      if (endpoint) {
        const data = new FormData();
        data.append('email', email.value.trim());
        if (selectedProduct.type === 'url') data.append('product_url', selectedProduct.value);
        if (selectedProduct.type === 'file') data.append('product_file', selectedProduct.file, selectedProduct.file.name);
        data.append('cta_source', source);
        if (selectedSprint) data.append('selected_sprint', selectedSprint);
        data.append('page_url', location.href);
        data.append('referrer', document.referrer || 'direct');
        const params = new URLSearchParams(location.search);
        ['utm_source','utm_medium','utm_campaign'].forEach(key => { if (params.get(key)) data.append(key, params.get(key)); });

        const response = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('Submission failed');
      } else if (demo) {
        await new Promise(resolve => setTimeout(resolve, reduceMotion ? 50 : 520));
      } else {
        throw new Error('Form endpoint not configured');
      }
      showSuccess();
    } catch (error) {
      formError.textContent = endpoint ? 'Something went wrong. Try again.' : 'Form endpoint is not configured yet.';
      submitButton.disabled = false;
    } finally {
      submitButton.removeAttribute('aria-busy');
    }
  });
})();
