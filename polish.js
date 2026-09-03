(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.addEventListener('load', () => {
    document.documentElement.classList.remove('story-mode');

    // Stable nav state: determine the active section at the viewport center.
    // This avoids IntersectionObserver threshold thrashing at section boundaries.
    const softNavLinks = [...document.querySelectorAll('.desktop-nav [data-nav]')];
    const softNavSections = [...document.querySelectorAll('[data-section]')];
    let softActiveName = null;
    let softNavRaf = 0;

    const setSoftActive = (name) => {
      if (name === softActiveName) return;
      softActiveName = name;
      softNavLinks.forEach((link) => {
        link.classList.toggle('is-soft-active', link.dataset.nav === name);
      });
    };

    const updateSoftNav = () => {
      softNavRaf = 0;
      const centerY = window.innerHeight * 0.5;
      const hit = softNavSections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= centerY && rect.bottom >= centerY;
      });

      if (hit) {
        setSoftActive(hit.dataset.section || 'hero');
        return;
      }

      const team = document.querySelector('#team');
      if (team && team.getBoundingClientRect().bottom < centerY) {
        setSoftActive('team');
      } else {
        setSoftActive('hero');
      }
    };

    const requestSoftNavUpdate = () => {
      if (softNavRaf) return;
      softNavRaf = window.requestAnimationFrame(updateSoftNav);
    };

    window.addEventListener('scroll', requestSoftNavUpdate, { passive: true });
    window.addEventListener('resize', requestSoftNavUpdate);
    updateSoftNav();

    // Remove all legacy scroll-effect timelines. Keep only normal document scrolling.
    if (window.gsap && window.ScrollTrigger) {
      const { gsap, ScrollTrigger } = window;
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill(true));
      gsap.set('.sprint-line, .white-transition', { clearProps: 'all' });
    }

    const sectionItems = new Map([
      ['#hero', [
        '.eyebrow',
        '.hero-title',
        '.hero-copy',
        '.hero-marquee',
        '.primary-cta'
      ]],
      ['#problems', [
        '.problems-eyebrow',
        '.problem-line:nth-child(1)',
        '.problem-line:nth-child(2)',
        '.problem-line:nth-child(3)'
      ]],
      ['#sprints', [
        '.sprints-heading .eyebrow',
        '.sprints-heading .section-title',
        '.sprint-row:nth-child(1)',
        '.sprint-row:nth-child(2)',
        '.sprint-row:nth-child(3)',
        '.sprints-terms',
        '.primary-cta'
      ]],
      ['#outcomes', [
        '.eyebrow',
        '.outcome-list span:nth-child(1)',
        '.outcome-list span:nth-child(2)',
        '.outcome-list span:nth-child(3)',
        '.outcome-list span:nth-child(4)'
      ]],
      ['#team', [
        '.team-copy .eyebrow',
        '.team-copy .section-title',
        '.team-body',
        '.team-copy .terms',
        '.team-copy .primary-cta',
        '.team-trust'
      ]]
    ]);

    const sections = [];

    sectionItems.forEach((selectors, sectionSelector) => {
      const section = document.querySelector(sectionSelector);
      if (!section) return;
      const items = selectors
        .map((selector) => section.querySelector(selector))
        .filter(Boolean);

      items.forEach((item) => item.classList.add('progressive-item'));
      sections.push({ section, items });
    });

    if (reduceMotion) {
      sections.forEach(({ items }) => items.forEach((item) => item.classList.add('is-progressive-visible')));
      return;
    }

    const observer = new IntersectionObserver((entries, io) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const record = sections.find(({ section }) => section === entry.target);
        if (!record) return;

        record.items.forEach((item, index) => {
          window.setTimeout(() => {
            item.classList.add('is-progressive-visible');
          }, index * 95);
        });

        io.unobserve(entry.target);
      });
    }, {
      threshold: 0.22,
      rootMargin: '0px 0px -8% 0px'
    });

    sections.forEach(({ section }) => observer.observe(section));
  });
})();
