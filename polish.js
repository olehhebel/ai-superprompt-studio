(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  window.addEventListener('load', () => {
    if (!window.gsap || !window.ScrollTrigger) return;

    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    // Opacity-first section transitions. Backgrounds stay solid; content crossfades.
    const sections = gsap.utils.toArray('.section');
    sections.forEach((section, index) => {
      const inner = section.querySelector('.section-inner');
      if (!inner) return;

      if (index > 0) {
        gsap.fromTo(inner,
          { opacity: 0.34 },
          {
            opacity: 1,
            ease: 'sine.inOut',
            scrollTrigger: {
              trigger: section,
              start: 'top 96%',
              end: 'top 58%',
              scrub: 0.9,
              invalidateOnRefresh: true
            }
          }
        );
      }

      if (index < sections.length - 1) {
        gsap.fromTo(inner,
          { opacity: 1 },
          {
            opacity: 0.34,
            ease: 'sine.inOut',
            scrollTrigger: {
              trigger: section,
              start: 'bottom 40%',
              end: 'bottom 4%',
              scrub: 0.9,
              invalidateOnRefresh: true
            }
          }
        );
      }
    });

    // Rebuild the white-circle transition so copy fades before the circle reaches it.
    ScrollTrigger.getAll().forEach((st) => {
      const trigger = st.trigger;
      if (trigger?.matches?.('.outcome-team-story')) {
        st.animation?.kill?.();
        st.kill();
      }
    });

    gsap.set('.white-transition', { scale: 1 });
    gsap.to('.white-transition', {
      scale: 8,
      ease: 'sine.inOut',
      scrollTrigger: {
        trigger: '#outcomes',
        start: 'bottom 41%',
        end: 'bottom 2%',
        scrub: 1.05,
        invalidateOnRefresh: true
      }
    });

    // Slow, continuous, non-mechanical PROBLEMS line weaving.
    const p1 = document.querySelector('.problem-path-1');
    const p2 = document.querySelector('.problem-path-2');
    const p3 = document.querySelector('.problem-path-3');

    if (p1) {
      gsap.to(p1, {
        x: 28,
        y: -18,
        rotation: 2.2,
        scaleX: 1.018,
        scaleY: 0.992,
        duration: 6.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }

    if (p2) {
      gsap.to(p2, {
        x: -24,
        y: 22,
        rotation: -2.8,
        scaleX: 0.99,
        scaleY: 1.018,
        duration: 7.7,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }

    if (p3) {
      gsap.to(p3, {
        x: 20,
        y: -26,
        rotation: -40.6,
        scaleX: 1.012,
        scaleY: 0.985,
        duration: 8.9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }

    // A second long wave on the whole group makes the paths weave together.
    gsap.to('.problem-art', {
      x: 10,
      y: -8,
      duration: 11.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    ScrollTrigger.refresh();
  });
})();
