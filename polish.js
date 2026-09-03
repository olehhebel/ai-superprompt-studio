(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.addEventListener('load', () => {
    document.documentElement.classList.remove('story-mode');

    // Remove all legacy scroll-effect timelines. Keep only normal document scrolling.
    if (window.gsap && window.ScrollTrigger) {
      const { gsap, ScrollTrigger } = window;
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill(true));
      gsap.set('.problem-art, .problem-path, .sprint-line, .white-transition', { clearProps: 'all' });
    }

    const sectionItems = new Map([
      ['#hero', [
        '.eyebrow',
        '.hero-title',
        '.hero-copy',
        '.terms',
        '.primary-cta'
      ]],
      ['#problems', [
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
