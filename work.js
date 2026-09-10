(() => {
  const externalProjectLinks = {
    'thrive-well': {
      url: 'https://thrivewellnutrition.com/',
      label: 'Thrive Well'
    },
    'maison': {
      url: 'https://gfethers.com.au/division/flooring/maison/',
      label: 'Maison'
    }
  };

  Object.entries(externalProjectLinks).forEach(([id, project]) => {
    const heading = document.querySelector(`#${id} h2`);
    if (!heading || heading.querySelector('a')) return;

    const link = document.createElement('a');
    link.href = project.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = `${project.label} ↗`;
    heading.replaceChildren(link);
  });

  ['brayn', 'neoversity'].forEach(id => {
    const meta = document.querySelector(`#${id} .work-meta`);
    if (!meta || meta.querySelector('.work-confidentiality')) return;

    const note = document.createElement('p');
    note.className = 'work-confidentiality';
    note.textContent = 'Confidentiality note — this work is subject to NDA. Only public, high-level information is shown.';
    meta.appendChild(note);
  });

  const conceptLogos = [
    { name: 'Trä', alt: 'Trä Scandinavian spa logo concept by Oleh Hebel', src: '/assets/work/concepts/tra.svg', href: '#tra' },
    { name: 'Yads', alt: 'Yads fresh food delivery logo and identity by Oleh Hebel', src: '/assets/work/concepts/yads.svg', href: '#yads' },
    { name: 'ERP. Smartproject', alt: 'ERP Smartproject software logo concept by Oleh Hebel', src: '/assets/work/concepts/erp-smartproject.svg', href: '#smartproject' },
    { name: 'Thrive Well', alt: 'Thrive Well nutrition labs logo by Oleh Hebel', src: '/assets/work/concepts/thrive-well.svg', href: '#thrive-well' },
    { name: 'Maison', alt: 'Maison Flooring logo by Oleh Hebel', src: '/assets/work/concepts/maison.svg', href: '#maison' },
    { name: 'Muse', alt: 'Muse real estate and mortgage logo by Oleh Hebel', src: '/assets/work/concepts/muse.svg', href: '#muse' },
    { name: 'Autumn Hills', alt: 'Autumn Hills Orchard logo by Oleh Hebel', src: '/assets/work/concepts/autumn-hills.svg', href: '#autumn-hills' },
    { name: 'FuelUp', alt: 'FuelUp stacked wordmark concept by Oleh Hebel', src: '/assets/work/concepts/fuelup.svg', href: '#fuelup' },
    { name: 'Terra', alt: 'Terra identity logo concept by Oleh Hebel', src: '/assets/work/concepts/terra.svg', href: 'https://freelance.ru/portfolio/project/view/863253' },
    { name: 'Predi', alt: 'Predi technology logo concept by Oleh Hebel', src: '/assets/work/concepts/predi.svg', href: 'https://dribbble.com/shots/17859463-Predi' },
    { name: 'Lushnikova', alt: 'Lushnikova fashion logo concept by Oleh Hebel', src: '/assets/work/concepts/lushnikova.svg', href: 'https://dribbble.com/shots/17859837-Lushnikova-logo' },
    { name: 'CocheLUX', alt: 'CocheLUX luxury automotive logo concept by Oleh Hebel', src: '/assets/work/concepts/cochelux.svg', href: 'https://99designs.com/logo-design/contests/cochelux-coches-de-lujo-ocasi%C3%B3n-1100034' }
  ];

  const absoluteUrl = value => {
    if (value.startsWith('/')) return `https://superprompt.pro${value}`;
    if (value.startsWith('#')) return `https://superprompt.pro/work${value}`;
    return value;
  };

  const neoversity = document.getElementById('neoversity');
  if (neoversity && !document.querySelector('.work-concepts')) {
    const section = document.createElement('section');
    section.className = 'work-concepts';
    section.setAttribute('aria-labelledby', 'work-concepts-title');

    const title = document.createElement('h2');
    title.className = 'eyebrow work-concepts-title';
    title.id = 'work-concepts-title';
    title.textContent = 'CONCEPTS';

    const viewport = document.createElement('div');
    viewport.className = 'work-concepts-viewport';
    viewport.setAttribute('aria-label', 'Logo and identity concepts by Oleh Hebel');

    const track = document.createElement('div');
    track.className = 'work-concepts-track';

    const makeGroup = hidden => {
      const group = document.createElement('div');
      group.className = 'work-concepts-group';
      if (hidden) group.setAttribute('aria-hidden', 'true');

      conceptLogos.forEach(concept => {
        const link = document.createElement('a');
        link.className = 'work-concept-logo work-concept-logo--contain';
        link.href = concept.href;
        link.setAttribute('aria-label', `View ${concept.name}`);
        link.title = concept.name;
        if (concept.href.startsWith('http')) {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        }

        const image = document.createElement('img');
        image.src = concept.src;
        image.alt = hidden ? '' : concept.alt;
        image.width = 600;
        image.height = 320;
        image.loading = 'lazy';
        image.decoding = 'async';
        image.fetchPriority = 'low';
        image.addEventListener('error', () => {
          link.hidden = true;
        }, { once: true });

        link.appendChild(image);
        group.appendChild(link);
      });

      return group;
    };

    track.append(makeGroup(false), makeGroup(true));
    viewport.appendChild(track);
    section.append(title, viewport);
    neoversity.insertAdjacentElement('afterend', section);

    if (!document.getElementById('work-concepts-schema')) {
      const schema = document.createElement('script');
      schema.id = 'work-concepts-schema';
      schema.type = 'application/ld+json';
      schema.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Logo and identity concepts by Oleh Hebel',
        description: 'Selected logo, wordmark and visual identity concepts by product and graphic designer Oleh Hebel.',
        numberOfItems: conceptLogos.length,
        itemListElement: conceptLogos.map((concept, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'CreativeWork',
            name: concept.name,
            description: concept.alt,
            image: absoluteUrl(concept.src),
            url: absoluteUrl(concept.href),
            creator: {
              '@type': 'Person',
              name: 'Oleh Hebel',
              url: 'https://superprompt.pro/'
            }
          }
        }))
      });
      document.head.appendChild(schema);
    }
  }

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
