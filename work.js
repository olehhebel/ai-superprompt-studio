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
