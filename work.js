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
    {
      name: 'CocheLUX',
      alt: 'CocheLUX luxury car logo concept by Oleh Hebel',
      src: '/api/concept-logo?id=cochelux',
      href: 'https://99designs.com/logo-design/contests/cochelux-coches-de-lujo-ocasi%C3%B3n-1100034'
    },
    {
      name: 'Ciucaș Rescue Race',
      alt: 'Ciucaș Rescue Race logo and brand guide concept by Oleh Hebel',
      src: '/api/concept-logo?id=ciucas',
      href: 'https://99designs.com/logo-brand-guide/contests/logo-ciuca%C8%99-rescue-race-1193171'
    },
    { name: 'Trä', alt: 'Trä Scandinavian spa logo and identity concept by Oleh Hebel', src: '/assets/work/tra-8.webp', href: '#tra' },
    { name: 'Yads', alt: 'Yads fresh food delivery logo and identity by Oleh Hebel', src: '/assets/work/yads-14.webp', href: '#yads' },
    { name: 'ERP. Smartproject', alt: 'ERP Smartproject software logo and identity concept by Oleh Hebel', src: '/assets/work/smartproject-23.webp', href: '#smartproject' },
    { name: 'Thrive Well', alt: 'Thrive Well nutrition logo and packaging identity by Oleh Hebel', src: '/assets/work/thrive-well-28.webp', href: '#thrive-well' },
    { name: 'Maison', alt: 'Maison Australian flooring logo and identity by Oleh Hebel', src: '/assets/work/maison-37.webp', href: '#maison' },
    { name: 'Muse', alt: 'Muse real estate and mortgage logo and identity by Oleh Hebel', src: '/assets/work/muse-44.webp', href: '#muse' },
    { name: 'Autumn Hills', alt: 'Autumn Hills farm logo refresh and identity by Oleh Hebel', src: '/assets/work/autumn-hills-49.webp', href: '#autumn-hills' },
    { name: 'FuelUp', alt: 'FuelUp wordmark and brand identity concept by Oleh Hebel', src: '/assets/work/fuelup-55.webp', href: '#fuelup' }
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
        image.width = 500;
        image.height = 500;
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
