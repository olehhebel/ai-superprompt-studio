(() => {
  const root = document.querySelector('[data-ecosystem-demo]');
  if (!root) return;

  const brands = {
    superprompt: {
      name: 'OLEH HEBEL & CO', kind: 'PRODUCT DESIGN / SERVICES',
      kicker: 'PRODUCT DESIGN · UX/UI · BRAND SYSTEMS',
      title: 'Your product works.<br><em>I make it worth choosing.</em>',
      copy: 'Clear, coherent experiences people understand, trust and remember.',
      link: 'https://superprompt.pro/', label: 'Explore Superprompt', foot: 'ONE PROBLEM · ONE SPRINT'
    },
    ship: {
      name: 'SHIP INDEX GROW', kind: 'EDUCATION / PRODUCT LAUNCH',
      kicker: 'AI-NATIVE PRODUCT LAUNCH SCHOOL',
      title: 'Don’t finish a course.<br><em>Ship something real.</em>',
      copy: 'From idea to a live, indexed and measurable product in six practical weeks.',
      link: 'https://shipindexgrow.top/', label: 'Explore Ship Index Grow', foot: 'BUILD · INDEX · GROW'
    },
    report: {
      name: 'INTERFACE REPORT', kind: 'INDEPENDENT EDITORIAL',
      kicker: 'INDEPENDENT AI PRODUCT PUBLICATION',
      title: 'Technology is moving fast.<br><em>Context has to move faster.</em>',
      copy: 'Source-first reporting and practical analysis for people building AI products.',
      link: 'https://interfacereport.com/', label: 'Explore Interface Report', foot: 'EDITORIAL · SOURCE-FIRST · INDEPENDENT'
    }
  };

  const buttons = [...root.querySelectorAll('[data-brand-choice]')];
  const fields = {
    name: root.querySelector('[data-brand-name]'), kind: root.querySelector('[data-brand-kind]'),
    kicker: root.querySelector('[data-brand-kicker]'), title: root.querySelector('[data-brand-title]'),
    copy: root.querySelector('[data-brand-copy]'), foot: root.querySelector('[data-brand-foot]'),
    link: root.querySelector('[data-brand-link]')
  };

  buttons.forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.brandChoice;
    const brand = brands[key];
    if (!brand || root.dataset.brand === key) return;
    root.dataset.brand = key;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    fields.name.textContent = brand.name;
    fields.kind.textContent = brand.kind;
    fields.kicker.textContent = brand.kicker;
    fields.title.innerHTML = brand.title;
    fields.copy.textContent = brand.copy;
    fields.foot.textContent = brand.foot;
    fields.link.href = brand.link;
    fields.link.firstChild.textContent = `${brand.label} `;
  }));
})();
