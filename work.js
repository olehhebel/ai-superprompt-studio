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
      name: 'CocheLUX concept 01',
      src: 'https://images-platform.99static.com/CFJKFxSunwcI3H-S0aaSEPEEAsM%3D/0x0%3A1509x1509/500x500/top/smart/99designs-contests-attachments/128/128567/attachment_128567111',
      href: 'https://99designs.com/logo-design/contests/cochelux-coches-de-lujo-ocasi%C3%B3n-1100034',
      mode: 'contain'
    },
    {
      name: 'CocheLUX concept 02',
      src: 'https://images-platform.99static.com/iLJTXKzy5UYOQWtV163DXCJsyrU%3D/83x1180%3A903x2000/500x500/top/smart/99designs-contests-attachments/128/128567/attachment_128567038',
      href: 'https://99designs.com/logo-design/contests/cochelux-coches-de-lujo-ocasi%C3%B3n-1100034',
      mode: 'contain'
    },
    {
      name: 'CocheLUX concept 03',
      src: 'https://images-platform.99static.com/iDzWMFhZKtOAMfeBK624isQUz7g%3D/0x186%3A1656x1842/500x500/top/smart/99designs-contests-attachments/128/128566/attachment_128566669',
      href: 'https://99designs.com/logo-design/contests/cochelux-coches-de-lujo-ocasi%C3%B3n-1100034',
      mode: 'contain'
    },
    {
      name: 'CocheLUX concept 04',
      src: 'https://images-platform.99static.com/JdmwBCLauopZewfEQzQbu6w-qf0%3D/0x571%3A1422x1993/500x500/top/smart/99designs-contests-attachments/128/128565/attachment_128565385',
      href: 'https://99designs.com/logo-design/contests/cochelux-coches-de-lujo-ocasi%C3%B3n-1100034',
      mode: 'contain'
    },
    {
      name: 'CocheLUX concept 05',
      src: 'https://images-platform.99static.com/-BY4NWGHajsdVyuk9VZOjokGLXA%3D/213x0%3A992x779/500x500/top/smart/99designs-contests-attachments/128/128565/attachment_128565376',
      href: 'https://99designs.com/logo-design/contests/cochelux-coches-de-lujo-ocasi%C3%B3n-1100034',
      mode: 'contain'
    },
    {
      name: 'CocheLUX concept 06',
      src: 'https://images-platform.99static.com/JEpr0IHLmobI1SBbkXXxBQXv8Zs%3D/33x0%3A1966x1933/500x500/top/smart/99designs-contests-attachments/128/128509/attachment_128509568',
      href: 'https://99designs.com/logo-design/contests/cochelux-coches-de-lujo-ocasi%C3%B3n-1100034',
      mode: 'contain'
    },
    {
      name: 'Ciucaș Rescue Race concept',
      src: 'https://images-platform.99static.com/eSMZUFJ47mbG4p3xYlB_l6TH6iM%3D/0x1374%3A1440x2814/500x500/top/smart/99designs-contests-attachments/138/138862/attachment_138862605',
      href: 'https://99designs.com/logo-brand-guide/contests/logo-ciuca%C8%99-rescue-race-1193171',
      mode: 'contain'
    },
    { name: 'Trä', src: '/assets/work/tra-cover.png', href: '#tra', mode: 'cover' },
    { name: 'Yads', src: '/assets/work/yads-cover.png', href: '#yads', mode: 'cover' },
    { name: 'ERP. Smartproject', src: '/assets/work/smartproject-cover.png', href: '#smartproject', mode: 'cover' },
    { name: 'Thrive Well', src: '/assets/work/thrive-well-cover.png', href: '#thrive-well', mode: 'cover' },
    { name: 'Maison', src: '/assets/work/maison-cover.png', href: '#maison', mode: 'cover' },
    { name: 'Muse', src: '/assets/work/muse-cover.png', href: '#muse', mode: 'cover' },
    { name: 'Autumn Hills', src: '/assets/work/autumn-hills-cover.png', href: '#autumn-hills', mode: 'cover' },
    { name: 'FuelUp', src: '/assets/work/fuelup-cover.png', href: '#fuelup', mode: 'cover' }
  ];

  const neoversity = document.getElementById('neoversity');
  if (neoversity && !document.querySelector('.work-concepts')) {
    const section = document.createElement('section');
    section.className = 'work-concepts';
    section.setAttribute('aria-labelledby', 'work-concepts-title');

    const title = document.createElement('p');
    title.className = 'eyebrow work-concepts-title';
    title.id = 'work-concepts-title';
    title.textContent = 'CONCEPTS';

    const viewport = document.createElement('div');
    viewport.className = 'work-concepts-viewport';

    const track = document.createElement('div');
    track.className = 'work-concepts-track';

    const makeGroup = hidden => {
      const group = document.createElement('div');
      group.className = 'work-concepts-group';
      if (hidden) group.setAttribute('aria-hidden', 'true');

      conceptLogos.forEach(concept => {
        const link = document.createElement('a');
        link.className = `work-concept-logo work-concept-logo--${concept.mode}`;
        link.href = concept.href;
        link.setAttribute('aria-label', concept.name);
        if (concept.href.startsWith('http')) {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        }

        const image = document.createElement('img');
        image.src = concept.src;
        image.alt = '';
        image.loading = 'lazy';
        image.decoding = 'async';
        image.addEventListener('error', () => {
          link.classList.add('is-image-missing');
          link.dataset.fallback = concept.name.replace(/ concept \d+$/i, '').replace(/ concept$/i, '');
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
