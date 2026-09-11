(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.addEventListener('load', () => {
    document.documentElement.classList.remove('story-mode');

    // Cross-network promotion: clear commercial offer, visually prominent, never disguised as editorial.
    if (!document.querySelector('.interface-report-promo')) {
      const promoStyle = document.createElement('style');
      promoStyle.textContent = `
        .interface-report-promo{background:#080a0d;color:#fff;padding:clamp(72px,8vw,128px) 0;border-top:1px solid rgba(255,255,255,.12);border-bottom:1px solid rgba(255,255,255,.12)}
        .interface-report-promo__inner{width:min(1280px,calc(100% - 48px));margin:0 auto}
        .interface-report-promo__head{display:grid;grid-template-columns:1.15fr .85fr;gap:clamp(32px,7vw,100px);align-items:end;margin-bottom:34px}
        .interface-report-promo__eyebrow{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#72a4ff;margin:0 0 14px}
        .interface-report-promo h2{font-size:clamp(46px,6.4vw,92px);line-height:.92;letter-spacing:-.055em;font-weight:500;margin:0;max-width:900px}
        .interface-report-promo__head p{font-size:16px;line-height:1.55;color:rgba(255,255,255,.64);max-width:520px;margin:0}
        .interface-report-promo__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
        .interface-report-promo__frame{min-height:520px;padding:28px;border-radius:22px;display:flex;flex-direction:column;border:1px solid rgba(255,255,255,.18);text-decoration:none!important;transition:transform .22s ease,box-shadow .22s ease}
        .interface-report-promo__frame:hover{transform:translateY(-6px);box-shadow:0 26px 74px rgba(0,0,0,.28)}
        .interface-report-promo__frame:nth-child(1){background:#065dff;color:#fff}
        .interface-report-promo__frame:nth-child(2){background:#f6f6f2;color:#080a0d}
        .interface-report-promo__frame:nth-child(3){background:#131923;color:#fff}
        .interface-report-promo__label{font-size:11px;letter-spacing:.08em;text-transform:uppercase;opacity:.64}
        .interface-report-promo__frame strong{font-size:clamp(31px,3.2vw,50px);line-height:.98;letter-spacing:-.045em;font-weight:500;margin:72px 0 22px}
        .interface-report-promo__frame small{font-size:12px;line-height:1.5;text-transform:uppercase;letter-spacing:.055em;opacity:.7}
        .interface-report-promo__frame b{margin-top:auto;font-size:14px;font-weight:600}
        .interface-report-promo__note{font-size:11px;color:rgba(255,255,255,.48);margin:18px 0 0;max-width:900px}
        @media(max-width:900px){.interface-report-promo__head{grid-template-columns:1fr}.interface-report-promo__grid{grid-template-columns:1fr}.interface-report-promo__frame{min-height:360px}.interface-report-promo__frame strong{margin-top:48px}}
        @media(max-width:640px){.interface-report-promo__inner{width:min(100% - 32px,1280px)}.interface-report-promo h2{font-size:48px}.interface-report-promo__frame{min-height:330px;padding:22px}.interface-report-promo__frame strong{font-size:36px}}
      `;
      document.head.appendChild(promoStyle);

      const promo = document.createElement('section');
      promo.className = 'interface-report-promo';
      promo.setAttribute('aria-labelledby', 'interface-report-promo-title');
      promo.innerHTML = `
        <div class="interface-report-promo__inner">
          <div class="interface-report-promo__head">
            <div>
              <p class="interface-report-promo__eyebrow">Publish & get discovered · Interface Report</p>
              <h2 id="interface-report-promo-title">Your product is ready.<br>Now make it visible.</h2>
            </div>
            <p>Interface Report is an independent publication covering AI products, agents, design, engineering, startups and SaaS. Companies can submit stories for editorial review or choose a clearly labelled sponsored package.</p>
          </div>
          <div class="interface-report-promo__grid">
            <a class="interface-report-promo__frame" href="https://interfacereport.com/advertise/?utm_source=superprompt.pro&utm_medium=referral&utm_campaign=network_crosspromo">
              <span class="interface-report-promo__label">01 · Sponsored Article</span>
              <strong>Tell the full product story in a curated technology publication.</strong>
              <small>Editorial review · clear disclosure · AI / product / startup relevance</small>
              <b>From $99 · View package ↗</b>
            </a>
            <a class="interface-report-promo__frame" href="https://interfacereport.com/advertise/?utm_source=superprompt.pro&utm_medium=referral&utm_campaign=network_crosspromo">
              <span class="interface-report-promo__label">02 · Editorial Feature</span>
              <strong>Turn a launch, founder story or product shift into a stronger editorial feature.</strong>
              <small>Editorial shaping · source review · publication-ready structure</small>
              <b>From $149 · See options ↗</b>
            </a>
            <a class="interface-report-promo__frame" href="https://interfacereport.com/advertise/?utm_source=superprompt.pro&utm_medium=referral&utm_campaign=network_crosspromo">
              <span class="interface-report-promo__label">03 · Feature + Distribution</span>
              <strong>Publish the story and extend it beyond the article page.</strong>
              <small>Featured placement · editorial package · distribution options</small>
              <b>From $199 · Explore package ↗</b>
            </a>
          </div>
          <p class="interface-report-promo__note">Interface Report controls editorial acceptance and labelling. Paid placements do not buy ranking guarantees, dofollow links or editorial conclusions.</p>
        </div>`;
      const teamSection = document.querySelector('#team');
      if (teamSection) teamSection.before(promo);
      else document.querySelector('main')?.appendChild(promo);
    }

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
