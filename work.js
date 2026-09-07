(() => {
  const projects = [
    {
      id: 'brayn',
      number: '01',
      title: 'BRAYN',
      role: 'User Experience Designer / Product Designer',
      url: 'https://brayn.app/',
      description: 'Led product design across web and mobile experiences: product discovery, user flows, high-fidelity UI, design systems and implementation support. Worked with product and engineering to turn business requirements into clear, scalable interfaces and keep the product experience consistent as it evolved.'
    },
    {
      id: 'neoversity',
      number: '02',
      title: 'Neoversity',
      role: 'Course Author / Lecturer — Interaction Design & AI',
      url: 'https://neoversity.com.ua/',
      description: 'Created and taught a master’s-level course on physical user interfaces and AI-driven interaction. Built the curriculum, lectures and practical work around sensors, voice, computer vision, microcontrollers, prototyping, interaction states, privacy, ethics and fail-safe behaviour.'
    }
  ];

  const list = document.querySelector('.work-list');
  const index = document.querySelector('.work-index');

  if (list && index && !document.getElementById('brayn')) {
    [...index.querySelectorAll('a')].forEach((link, i) => {
      const number = link.querySelector('span');
      if (number) number.textContent = String(i + 3).padStart(2, '0');
    });

    [...list.querySelectorAll('.work-project')].forEach((project, i) => {
      const eyebrow = project.querySelector('.work-meta .eyebrow');
      if (eyebrow) eyebrow.textContent = eyebrow.textContent.replace(/^\d{2}/, String(i + 3).padStart(2, '0'));
    });

    projects.slice().reverse().forEach(project => {
      const indexLink = document.createElement('a');
      indexLink.href = `#${project.id}`;
      indexLink.innerHTML = `<span>${project.number}</span> ${project.title}`;
      index.prepend(indexLink);

      const article = document.createElement('article');
      article.className = 'work-project work-project--text-only';
      article.id = project.id;
      article.setAttribute('aria-labelledby', `${project.id}-title`);
      article.innerHTML = `
        <div class="work-meta">
          <h2 id="${project.id}-title"><a href="${project.url}" target="_blank" rel="noopener noreferrer">${project.title} ↗</a></h2>
          <h3>${project.role}</h3>
          <p>${project.description}</p>
        </div>`;
      list.prepend(article);
    });

    const lead = document.querySelector('.work-lead');
    if (lead) lead.textContent = 'Twelve projects across product design, education, application UX, service websites, branding and packaging. Different briefs. The same attention to clarity, hierarchy and consistency.';

    const introEyebrow = document.querySelector('.work-intro > .eyebrow');
    if (introEyebrow) introEyebrow.textContent = 'WORK / SELECTED EXPERIENCE + THE 2022 COLLECTION';

    document.title = 'Product Design, UI/UX, Branding & Education Work | Oleh Hebel';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.content = 'Selected work by Oleh Hebel across product design, UI/UX, design systems, AI interaction education, branding and packaging.';

    const ld = document.querySelector('script[type="application/ld+json"]');
    if (ld) {
      try {
        const data = JSON.parse(ld.textContent);
        const itemList = data?.mainEntity?.itemListElement;
        if (Array.isArray(itemList)) {
          itemList.forEach((item, i) => { item.position = i + 3; });
          data.mainEntity.numberOfItems = itemList.length + 2;
          data.mainEntity.itemListElement = [
            {
              '@type': 'ListItem',
              position: 1,
              item: {
                '@type': 'CreativeWork',
                '@id': 'https://superprompt.pro/work#brayn',
                name: 'BRAYN',
                url: 'https://brayn.app/',
                description: projects[0].description,
                creator: { '@type': 'Person', name: 'Oleh Hebel' }
              }
            },
            {
              '@type': 'ListItem',
              position: 2,
              item: {
                '@type': 'CreativeWork',
                '@id': 'https://superprompt.pro/work#neoversity',
                name: 'Neoversity',
                url: 'https://neoversity.com.ua/',
                description: projects[1].description,
                creator: { '@type': 'Person', name: 'Oleh Hebel' }
              }
            },
            ...itemList
          ];
          ld.textContent = JSON.stringify(data);
        }
      } catch (_) {}
    }
  }

  const premiumCovers = {
    dashboarder: '/assets/work/dashboarder-premium-cover.svg',
    tra: '/assets/work/tra-premium-cover.svg',
    yads: '/assets/work/yads-premium-cover.svg',
    smartproject: '/assets/work/smartproject-premium-cover.svg',
    'thrive-well': '/assets/work/thrive-well-premium-cover.svg',
    maison: '/assets/work/maison-premium-cover.svg',
    muse: '/assets/work/muse-premium-cover.svg',
    'autumn-hills': '/assets/work/autumn-hills-premium-cover.svg',
    mentorium: '/assets/work/mentorium-premium-cover.svg',
    fuelup: '/assets/work/fuelup-premium-cover.svg'
  };

  Object.entries(premiumCovers).forEach(([id, src]) => {
    const project = document.getElementById(id);
    const cover = project?.querySelector('.work-cover');
    const img = cover?.querySelector('img');
    if (!img) return;
    img.src = src;
    img.width = 1600;
    img.height = 1100;
    img.decoding = 'async';
    if (cover) cover.href = src;
  });

  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-menu');
  if (!toggle || !menu) return;
  const close = () => { menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    menu.hidden = open;
    toggle.setAttribute('aria-expanded', String(!open));
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) { close(); toggle.focus(); } });
})();
