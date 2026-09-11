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

  // Original raster artwork only. No reconstructed or generated logos are used here.
  const conceptLogos = [
    {
      name: 'Trä',
      alt: 'Trä logo by Oleh Hebel',
      src: '/assets/work/concepts/original/tra-logo-by-oleh-hebel.png',
      href: '#tra'
    },
    {
      name: 'Yads',
      alt: 'Yads logo by Oleh Hebel',
      src: '/assets/work/concepts/original/yads-logo-by-oleh-hebel.png',
      href: '#yads'
    },
    {
      name: 'ERP. Smartproject',
      alt: 'ERP Smartproject logo by Oleh Hebel',
      src: '/assets/work/concepts/original/erp-smartproject-logo-by-oleh-hebel.png',
      href: '#smartproject'
    },
    {
      name: 'Thrive Well',
      alt: 'Thrive Well logo by Oleh Hebel',
      src: '/assets/work/concepts/original/thrive-well-logo-by-oleh-hebel.png',
      href: '#thrive-well'
    },
    {
      name: 'Maison',
      alt: 'Maison Flooring logo by Oleh Hebel',
      src: '/assets/work/concepts/original/maison-logo-by-oleh-hebel.png',
      href: '#maison'
    },
    {
      name: 'Muse',
      alt: 'Muse logo by Oleh Hebel',
      src: '/assets/work/concepts/original/muse-logo-by-oleh-hebel.png',
      href: '#muse'
    },
    {
      name: 'Autumn Hills',
      alt: 'Autumn Hills Orchard logo by Oleh Hebel',
      src: '/assets/work/concepts/original/autumn-hills-logo-by-oleh-hebel.png',
      href: '#autumn-hills'
    },
    {
      name: 'FuelUp',
      alt: 'FuelUp logo by Oleh Hebel',
      src: '/assets/work/concepts/original/fuelup-logo-by-oleh-hebel.png',
      href: '#fuelup'
    },
    {
      name: 'Terra',
      alt: 'Terra logo concept by Oleh Hebel',
      src: '/assets/work/concepts/original/terra-logo-by-oleh-hebel.png',
      href: 'https://freelance.ru/portfolio/project/view/863253'
    },
    {
      name: 'Tivona',
      alt: 'Tivona identity logo by Oleh Hebel',
      src: '/assets/work/concepts/original/tivona-logo-by-oleh-hebel.png',
      href: 'https://dribbble.com/olehhebel'
    },
    {
      name: 'Атомлайн',
      alt: 'Atomline logo concept by Oleh Hebel',
      src: '/assets/work/concepts/original/atomline-logo-concept-by-oleh-hebel.png',
      href: 'https://freelance.boutique/contest/view/1463'
    },
    {
      name: 'ARION',
      alt: 'ARION logo concept by Oleh Hebel',
      src: '/assets/work/concepts/original/arion-logo-concept-by-oleh-hebel.png',
      href: 'https://freelance.boutique/contest/view/504'
    }
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
    viewport.setAttribute('aria-label', 'Original logo and identity work by Oleh Hebel');

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
        image.loading = hidden ? 'lazy' : 'eager';
        image.decoding = 'async';
        image.fetchPriority = hidden ? 'low' : 'auto';
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
        name: 'Original logo and identity work by Oleh Hebel',
        description: 'Original logo and identity artwork created by Oleh Hebel and shown from source portfolio and contest files.',
        numberOfItems: conceptLogos.length,
        itemListElement: conceptLogos.map((concept, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'CreativeWork',
            name: concept.name,
            description: concept.alt,
            image: {
              '@type': 'ImageObject',
              contentUrl: absoluteUrl(concept.src),
              encodingFormat: 'image/png'
            },
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
